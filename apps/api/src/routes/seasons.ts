import { Hono } from "hono";
import {
  requireMentor,
  teamMiddleware,
  type AuthVariables,
  type TeamVariables,
} from "../middleware/auth";
import { db } from "../db";
import { teams, teamMembers, seasons } from "../db/schema";
import { eq, and, sql, or, desc } from "drizzle-orm";
import {
  createSeasonSchema,
  updateSeasonSchema,
  formatZodError,
} from "../schemas";

// ============ Seasons Routes ============
const teamSeasonsRoutes = new Hono<{
  Variables: AuthVariables & TeamVariables;
}>()
  .use("*", teamMiddleware)
  // Get all seasons for a team
  .get("/", async (c) => {
    const teamId = c.get("teamId");

    const seasonsList = await db.query.seasons.findMany({
      where: eq(seasons.teamId, teamId),
      orderBy: [desc(seasons.createdAt)],
    });

    const team = await db.query.teams.findFirst({
      where: eq(teams.id, teamId),
    });

    return c.json({
      seasons: seasonsList.map((s) => ({
        id: s.id,
        seasonYear: s.seasonYear,
        seasonName: s.seasonName,
        startDate: s.startDate?.toISOString() || null,
        endDate: s.endDate?.toISOString() || null,
        isArchived: s.isArchived,
        isActive: team?.activeSeasonId === s.id,
        createdAt: s.createdAt.toISOString(),
      })),
      activeSeasonId: team?.activeSeasonId || null,
    });
  })
  // Create a new season
  .post("/", requireMentor, async (c) => {
    const teamId = c.get("teamId");
    const body = await c.req.json();

    const result = createSeasonSchema.safeParse(body);
    if (!result.success) {
      return c.json(formatZodError(result.error), 400);
    }

    const { seasonYear, seasonName, startDate, endDate, copyMembers } =
      result.data;

    try {
      const seasonId = crypto.randomUUID();

      // Create the season
      await db.insert(seasons).values({
        id: seasonId,
        teamId,
        seasonYear,
        seasonName,
        startDate: startDate || null,
        endDate: endDate || null,
      });

      // Check if this is the first season for the team
      const existingSeasons = await db.query.seasons.findMany({
        where: eq(seasons.teamId, teamId),
      });

      // If first season (only the one we just created), set it as active
      if (existingSeasons.length === 1) {
        await db
          .update(teams)
          .set({ activeSeasonId: seasonId, updatedAt: new Date() })
          .where(eq(teams.id, teamId));
      }

      // If copyMembers is true, assign existing members to the new season
      if (copyMembers) {
        const existingMembers = await db.query.teamMembers.findMany({
          where: eq(teamMembers.teamId, teamId),
        });

        for (const member of existingMembers) {
          if (!member.seasonId) {
            await db
              .update(teamMembers)
              .set({ seasonId })
              .where(eq(teamMembers.id, member.id));
          }
        }
      }

      return c.json({
        id: seasonId,
        seasonYear,
        seasonName,
        startDate: startDate?.toISOString() || null,
        endDate: endDate?.toISOString() || null,
        isActive: existingSeasons.length === 1,
      });
    } catch (error) {
      console.error("Failed to create season:", error);
      return c.json({ error: "Failed to create season" }, 500);
    }
  })
  // Get a specific season
  .get("/:seasonId", async (c) => {
    const teamId = c.get("teamId");
    const seasonId = c.req.param("seasonId");

    const season = await db.query.seasons.findFirst({
      where: and(eq(seasons.id, seasonId), eq(seasons.teamId, teamId)),
    });

    if (!season) {
      return c.json({ error: "Season not found" }, 404);
    }

    const team = await db.query.teams.findFirst({
      where: eq(teams.id, teamId),
    });

    // Get member count for this season
    const memberCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.teamId, teamId),
          or(
            eq(teamMembers.seasonId, seasonId),
            sql`${teamMembers.seasonId} IS NULL`
          )
        )
      );

    return c.json({
      id: season.id,
      seasonYear: season.seasonYear,
      seasonName: season.seasonName,
      startDate: season.startDate?.toISOString() || null,
      endDate: season.endDate?.toISOString() || null,
      isArchived: season.isArchived,
      isActive: team?.activeSeasonId === season.id,
      memberCount: memberCount[0]?.count || 0,
      createdAt: season.createdAt.toISOString(),
      updatedAt: season.updatedAt.toISOString(),
    });
  })
  // Update a season
  .put("/:seasonId", requireMentor, async (c) => {
    const teamId = c.get("teamId");
    const seasonId = c.req.param("seasonId");
    const body = await c.req.json();

    const result = updateSeasonSchema.safeParse(body);
    if (!result.success) {
      return c.json(formatZodError(result.error), 400);
    }

    const existingSeason = await db.query.seasons.findFirst({
      where: and(eq(seasons.id, seasonId), eq(seasons.teamId, teamId)),
    });

    if (!existingSeason) {
      return c.json({ error: "Season not found" }, 404);
    }

    const { seasonYear, seasonName, startDate, endDate, isArchived } =
      result.data;

    try {
      await db
        .update(seasons)
        .set({
          ...(seasonYear !== undefined && { seasonYear }),
          ...(seasonName !== undefined && { seasonName }),
          ...(startDate !== undefined && { startDate }),
          ...(endDate !== undefined && { endDate }),
          ...(isArchived !== undefined && { isArchived }),
          updatedAt: new Date(),
        })
        .where(eq(seasons.id, seasonId));

      return c.json({ success: true });
    } catch (error) {
      console.error("Failed to update season:", error);
      return c.json({ error: "Failed to update season" }, 500);
    }
  })
  // Activate a season
  .put("/:seasonId/activate", requireMentor, async (c) => {
    const teamId = c.get("teamId");
    const seasonId = c.req.param("seasonId");

    const season = await db.query.seasons.findFirst({
      where: and(eq(seasons.id, seasonId), eq(seasons.teamId, teamId)),
    });

    if (!season) {
      return c.json({ error: "Season not found" }, 404);
    }

    if (season.isArchived) {
      return c.json({ error: "Cannot activate an archived season" }, 400);
    }

    try {
      await db
        .update(teams)
        .set({ activeSeasonId: seasonId, updatedAt: new Date() })
        .where(eq(teams.id, teamId));

      return c.json({ success: true, activeSeasonId: seasonId });
    } catch (error) {
      console.error("Failed to activate season:", error);
      return c.json({ error: "Failed to activate season" }, 500);
    }
  })
  // Archive a season
  .put("/:seasonId/archive", requireMentor, async (c) => {
    const teamId = c.get("teamId");
    const seasonId = c.req.param("seasonId");

    const season = await db.query.seasons.findFirst({
      where: and(eq(seasons.id, seasonId), eq(seasons.teamId, teamId)),
    });

    if (!season) {
      return c.json({ error: "Season not found" }, 404);
    }

    const team = await db.query.teams.findFirst({
      where: eq(teams.id, teamId),
    });

    if (team?.activeSeasonId === seasonId) {
      return c.json({ error: "Cannot archive the active season" }, 400);
    }

    try {
      await db
        .update(seasons)
        .set({ isArchived: true, updatedAt: new Date() })
        .where(eq(seasons.id, seasonId));

      return c.json({ success: true });
    } catch (error) {
      console.error("Failed to archive season:", error);
      return c.json({ error: "Failed to archive season" }, 500);
    }
  })
  // Delete a season (admin only)
  .delete("/:seasonId", async (c) => {
    const teamId = c.get("teamId");
    const teamRole = c.get("teamRole");
    const seasonId = c.req.param("seasonId");

    if (teamRole !== "admin") {
      return c.json({ error: "Only admins can delete seasons" }, 403);
    }

    const season = await db.query.seasons.findFirst({
      where: and(eq(seasons.id, seasonId), eq(seasons.teamId, teamId)),
    });

    if (!season) {
      return c.json({ error: "Season not found" }, 404);
    }

    const team = await db.query.teams.findFirst({
      where: eq(teams.id, teamId),
    });

    if (team?.activeSeasonId === seasonId) {
      return c.json({ error: "Cannot delete the active season" }, 400);
    }

    try {
      // Remove season reference from members
      await db
        .update(teamMembers)
        .set({ seasonId: null })
        .where(
          and(
            eq(teamMembers.teamId, teamId),
            eq(teamMembers.seasonId, seasonId)
          )
        );

      // Delete the season
      await db.delete(seasons).where(eq(seasons.id, seasonId));

      return c.json({ success: true });
    } catch (error) {
      console.error("Failed to delete season:", error);
      return c.json({ error: "Failed to delete season" }, 500);
    }
  });

export default teamSeasonsRoutes;
