import { Hono } from "hono";
import { Layout } from "../components/Layout";
import { requireAuth, type AuthVariables } from "../middleware/auth";
import { db } from "../db";
import { teams, teamMembers } from "../db/schema";
import { eq } from "drizzle-orm";

const app = new Hono<{ Variables: AuthVariables }>();

// Apply auth to all team routes
app.use("*", requireAuth);

// Dashboard - show user's teams or prompt to create
app.get("/dashboard", async (c) => {
  const user = c.get("user")!;

  const memberships = await db.query.teamMembers.findMany({
    where: eq(teamMembers.userId, user.id),
    with: { team: true },
  });

  const error = c.req.query("error");

  return c.html(
    <Layout title="Dashboard - BuildSeason">
      <div class="min-h-screen bg-gray-50">
        <nav class="bg-white shadow-sm">
          <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <a href="/dashboard" class="text-xl font-bold text-gray-900">
              BuildSeason
            </a>
            <div class="flex items-center gap-4">
              <span class="text-sm text-gray-600">{user.name}</span>
              <form action="/api/auth/sign-out" method="post">
                <button
                  type="submit"
                  class="text-sm text-gray-500 hover:text-gray-700"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </nav>

        <div class="max-w-4xl mx-auto py-8 px-4">
          {error && (
            <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p class="text-sm text-red-600">
                {error === "not_a_member"
                  ? "You are not a member of that team."
                  : decodeURIComponent(error)}
              </p>
            </div>
          )}

          <div class="flex justify-between items-center mb-8">
            <h1 class="text-2xl font-bold text-gray-900">Your Teams</h1>
            <a
              href="/teams/new"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Create Team
            </a>
          </div>

          {memberships.length === 0 ? (
            <div class="bg-white rounded-lg shadow p-8 text-center">
              <div class="text-gray-400 mb-4">
                <svg
                  class="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h2 class="text-xl font-semibold text-gray-900 mb-2">
                No teams yet
              </h2>
              <p class="text-gray-600 mb-6">
                Create a team to start managing your FTC robotics parts and
                orders.
              </p>
              <a
                href="/teams/new"
                class="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Create Your First Team
              </a>
            </div>
          ) : (
            <div class="grid gap-4">
              {memberships.map(({ team, role }) => (
                <a
                  href={`/teams/${team.id}`}
                  class="bg-white rounded-lg shadow p-6 hover:shadow-md transition flex justify-between items-center"
                >
                  <div>
                    <h2 class="text-lg font-semibold text-gray-900">
                      {team.name}
                    </h2>
                    <p class="text-sm text-gray-500">
                      Team #{team.number} &middot; {team.season}
                    </p>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600 capitalize">
                      {role}
                    </span>
                    <svg
                      class="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
});

// Team creation form
app.get("/teams/new", (c) => {
  const currentYear = new Date().getFullYear();
  const currentSeason = `${currentYear}-${currentYear + 1}`;

  return c.html(
    <Layout title="Create Team - BuildSeason">
      <div class="min-h-screen bg-gray-50">
        <nav class="bg-white shadow-sm">
          <div class="max-w-7xl mx-auto px-4 py-4">
            <a href="/dashboard" class="text-xl font-bold text-gray-900">
              BuildSeason
            </a>
          </div>
        </nav>

        <div class="max-w-lg mx-auto py-8 px-4">
          <div class="mb-6">
            <a
              href="/dashboard"
              class="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Dashboard
            </a>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <h1 class="text-2xl font-bold text-gray-900 mb-6">
              Create a New Team
            </h1>

            <form
              hx-post="/teams"
              hx-target="#form-result"
              hx-swap="innerHTML"
              class="space-y-6"
            >
              <div>
                <label
                  for="name"
                  class="block text-sm font-medium text-gray-700"
                >
                  Team Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  placeholder="e.g., Iron Panthers"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  for="number"
                  class="block text-sm font-medium text-gray-700"
                >
                  Team Number
                </label>
                <input
                  type="text"
                  id="number"
                  name="number"
                  required
                  pattern="[0-9]+"
                  placeholder="e.g., 16626"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <p class="mt-1 text-sm text-gray-500">
                  Your official FTC team number
                </p>
              </div>

              <div>
                <label
                  for="season"
                  class="block text-sm font-medium text-gray-700"
                >
                  Season
                </label>
                <select
                  id="season"
                  name="season"
                  required
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={currentSeason}>{currentSeason}</option>
                  <option value={`${currentYear - 1}-${currentYear}`}>
                    {currentYear - 1}-{currentYear}
                  </option>
                </select>
              </div>

              <div id="form-result"></div>

              <button
                type="submit"
                class="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <span>Create Team</span>
                <span class="htmx-indicator">
                  <svg
                    class="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
});

// Create team POST handler
app.post("/teams", async (c) => {
  const user = c.get("user")!;
  const body = await c.req.parseBody();

  const name = body.name as string;
  const number = body.number as string;
  const season = body.season as string;

  if (!name || !number || !season) {
    return c.html(
      <div class="p-3 bg-red-50 border border-red-200 rounded-md">
        <p class="text-sm text-red-600">All fields are required.</p>
      </div>
    );
  }

  // Validate team number is numeric
  if (!/^\d+$/.test(number)) {
    return c.html(
      <div class="p-3 bg-red-50 border border-red-200 rounded-md">
        <p class="text-sm text-red-600">Team number must be numeric.</p>
      </div>
    );
  }

  try {
    const teamId = crypto.randomUUID();
    const memberId = crypto.randomUUID();

    // Create team and add creator as admin
    await db.insert(teams).values({
      id: teamId,
      name: name.trim(),
      number: number.trim(),
      season,
    });

    await db.insert(teamMembers).values({
      id: memberId,
      userId: user.id,
      teamId,
      role: "admin",
    });

    // Redirect to the new team
    c.header("HX-Redirect", `/teams/${teamId}`);
    return c.html(<div>Redirecting...</div>);
  } catch (error) {
    console.error("Failed to create team:", error);
    return c.html(
      <div class="p-3 bg-red-50 border border-red-200 rounded-md">
        <p class="text-sm text-red-600">
          Failed to create team. Please try again.
        </p>
      </div>
    );
  }
});

// Team overview page (placeholder for now)
app.get("/teams/:teamId", async (c) => {
  const user = c.get("user")!;
  const teamId = c.req.param("teamId");

  // Check membership
  const membership = await db.query.teamMembers.findFirst({
    where: (tm, { and, eq }) =>
      and(eq(tm.userId, user.id), eq(tm.teamId, teamId)),
  });

  if (!membership) {
    return c.redirect("/dashboard?error=not_a_member");
  }

  const team = await db.query.teams.findFirst({
    where: eq(teams.id, teamId),
  });

  if (!team) {
    return c.redirect("/dashboard?error=team_not_found");
  }

  return c.html(
    <Layout title={`${team.name} - BuildSeason`}>
      <div class="min-h-screen bg-gray-50">
        <nav class="bg-white shadow-sm">
          <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div class="flex items-center gap-4">
              <a href="/dashboard" class="text-xl font-bold text-gray-900">
                BuildSeason
              </a>
              <span class="text-gray-300">/</span>
              <span class="text-gray-600">{team.name}</span>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-sm text-gray-600">{user.name}</span>
              <form action="/api/auth/sign-out" method="post">
                <button
                  type="submit"
                  class="text-sm text-gray-500 hover:text-gray-700"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </nav>

        <div class="max-w-7xl mx-auto py-8 px-4">
          <div class="mb-8">
            <h1 class="text-2xl font-bold text-gray-900">{team.name}</h1>
            <p class="text-gray-600">
              Team #{team.number} &middot; {team.season}
            </p>
          </div>

          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href={`/teams/${team.id}/parts`}
              class="bg-white rounded-lg shadow p-6 hover:shadow-md transition"
            >
              <div class="text-blue-600 mb-2">
                <svg
                  class="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 class="font-semibold text-gray-900">Parts Inventory</h3>
              <p class="text-sm text-gray-500">Track your parts and supplies</p>
            </a>

            <a
              href={`/teams/${team.id}/orders`}
              class="bg-white rounded-lg shadow p-6 hover:shadow-md transition"
            >
              <div class="text-green-600 mb-2">
                <svg
                  class="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
              </div>
              <h3 class="font-semibold text-gray-900">Orders</h3>
              <p class="text-sm text-gray-500">Manage purchase orders</p>
            </a>

            <a
              href={`/teams/${team.id}/bom`}
              class="bg-white rounded-lg shadow p-6 hover:shadow-md transition"
            >
              <div class="text-purple-600 mb-2">
                <svg
                  class="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                  />
                </svg>
              </div>
              <h3 class="font-semibold text-gray-900">Bill of Materials</h3>
              <p class="text-sm text-gray-500">Robot subsystem parts lists</p>
            </a>

            <a
              href={`/teams/${team.id}/members`}
              class="bg-white rounded-lg shadow p-6 hover:shadow-md transition"
            >
              <div class="text-orange-600 mb-2">
                <svg
                  class="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h3 class="font-semibold text-gray-900">Team Members</h3>
              <p class="text-sm text-gray-500">Manage your team roster</p>
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
});

export default app;
