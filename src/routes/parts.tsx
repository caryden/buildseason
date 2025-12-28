import { Hono } from "hono";
import { Layout } from "../components/Layout";
import {
  requireAuth,
  teamMiddleware,
  type AuthVariables,
  type TeamVariables,
} from "../middleware/auth";
import { db } from "../db";
import { parts, teams } from "../db/schema";
import { eq, asc, desc, sql, like, or } from "drizzle-orm";

const app = new Hono<{ Variables: AuthVariables & TeamVariables }>();

// Apply auth middleware
app.use("*", requireAuth);

// Parts list page
app.get("/teams/:teamId/parts", teamMiddleware, async (c) => {
  const user = c.get("user")!;
  const teamId = c.get("teamId");
  const teamRole = c.get("teamRole");

  const team = await db.query.teams.findFirst({
    where: eq(teams.id, teamId),
  });

  if (!team) {
    return c.redirect("/dashboard?error=team_not_found");
  }

  // Query params for sorting and filtering
  const sort = c.req.query("sort") || "name";
  const order = c.req.query("order") || "asc";
  const search = c.req.query("search") || "";
  const lowStock = c.req.query("lowStock") === "true";

  // Build query
  let query = db
    .select()
    .from(parts)
    .where(eq(parts.teamId, teamId))
    .$dynamic();

  // Add search filter
  if (search) {
    query = query.where(
      or(
        like(parts.name, `%${search}%`),
        like(parts.sku, `%${search}%`),
        like(parts.location, `%${search}%`)
      )
    );
  }

  // Add low stock filter
  if (lowStock) {
    query = query.where(
      sql`${parts.quantity} <= ${parts.reorderPoint} AND ${parts.reorderPoint} > 0`
    );
  }

  // Add sorting
  const sortColumn =
    sort === "quantity"
      ? parts.quantity
      : sort === "location"
        ? parts.location
        : sort === "sku"
          ? parts.sku
          : parts.name;

  query = query.orderBy(order === "desc" ? desc(sortColumn) : asc(sortColumn));

  const partsList = await query;

  // Get vendors for display
  const partsWithVendors = await Promise.all(
    partsList.map(async (part) => {
      if (part.vendorId) {
        const vendor = await db.query.vendors.findFirst({
          where: (v, { eq }) => eq(v.id, part.vendorId!),
        });
        return { ...part, vendor };
      }
      return { ...part, vendor: null };
    })
  );

  // Count low stock items
  const lowStockCount = partsList.filter(
    (p) => p.reorderPoint && p.quantity <= p.reorderPoint
  ).length;

  const canEdit = teamRole === "admin" || teamRole === "mentor";

  return c.html(
    <Layout title={`Parts - ${team.name}`}>
      <div class="min-h-screen bg-gray-50">
        <nav class="bg-white shadow-sm">
          <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div class="flex items-center gap-4">
              <a href="/dashboard" class="text-xl font-bold text-gray-900">
                BuildSeason
              </a>
              <span class="text-gray-300">/</span>
              <a
                href={`/teams/${team.id}`}
                class="text-gray-600 hover:text-gray-900"
              >
                {team.name}
              </a>
              <span class="text-gray-300">/</span>
              <span class="text-gray-600">Parts</span>
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
          <div class="flex justify-between items-center mb-6">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Parts Inventory</h1>
              <p class="text-gray-600">
                {partsList.length} parts
                {lowStockCount > 0 && (
                  <span class="text-orange-600 ml-2">
                    ({lowStockCount} low stock)
                  </span>
                )}
              </p>
            </div>
            {canEdit && (
              <a
                href={`/teams/${team.id}/parts/new`}
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Add Part
              </a>
            )}
          </div>

          {/* Filters */}
          <div class="bg-white rounded-lg shadow p-4 mb-6">
            <form class="flex flex-wrap gap-4 items-end">
              <div class="flex-1 min-w-[200px]">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  name="search"
                  value={search}
                  placeholder="Name, SKU, or location..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Sort by
                </label>
                <select
                  name="sort"
                  class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="name" selected={sort === "name"}>
                    Name
                  </option>
                  <option value="sku" selected={sort === "sku"}>
                    SKU
                  </option>
                  <option value="quantity" selected={sort === "quantity"}>
                    Quantity
                  </option>
                  <option value="location" selected={sort === "location"}>
                    Location
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Order
                </label>
                <select
                  name="order"
                  class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="asc" selected={order === "asc"}>
                    Ascending
                  </option>
                  <option value="desc" selected={order === "desc"}>
                    Descending
                  </option>
                </select>
              </div>
              <div class="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="lowStock"
                  name="lowStock"
                  value="true"
                  checked={lowStock}
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label for="lowStock" class="text-sm text-gray-700">
                  Low stock only
                </label>
              </div>
              <button
                type="submit"
                class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
              >
                Filter
              </button>
            </form>
          </div>

          {/* Parts table */}
          {partsList.length === 0 ? (
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
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <h2 class="text-xl font-semibold text-gray-900 mb-2">
                No parts yet
              </h2>
              <p class="text-gray-600 mb-6">
                {search || lowStock
                  ? "No parts match your filters."
                  : "Start by adding parts to your inventory."}
              </p>
              {canEdit && !search && !lowStock && (
                <a
                  href={`/teams/${team.id}/parts/new`}
                  class="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Add Your First Part
                </a>
              )}
            </div>
          ) : (
            <div class="bg-white rounded-lg shadow overflow-hidden">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Part
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SKU
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  {partsWithVendors.map((part) => {
                    const isLowStock =
                      part.reorderPoint && part.quantity <= part.reorderPoint;
                    return (
                      <tr
                        class={isLowStock ? "bg-orange-50" : "hover:bg-gray-50"}
                      >
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="flex items-center">
                            <div>
                              <div class="text-sm font-medium text-gray-900">
                                {part.name}
                              </div>
                              {part.description && (
                                <div class="text-sm text-gray-500">
                                  {part.description.substring(0, 50)}
                                  {part.description.length > 50 ? "..." : ""}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {part.sku || "-"}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {part.vendor?.name || "-"}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="flex items-center gap-2">
                            <span
                              class={`text-sm font-medium ${isLowStock ? "text-orange-600" : "text-gray-900"}`}
                            >
                              {part.quantity}
                            </span>
                            {isLowStock && (
                              <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                                Low
                              </span>
                            )}
                          </div>
                          {part.reorderPoint && (
                            <div class="text-xs text-gray-400">
                              Reorder at {part.reorderPoint}
                            </div>
                          )}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {part.location || "-"}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <a
                            href={`/teams/${team.id}/parts/${part.id}`}
                            class="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
});

export default app;
