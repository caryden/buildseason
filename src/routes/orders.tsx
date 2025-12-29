import { Hono } from "hono";
import { Layout } from "../components/Layout";
import { SignOutButton } from "../components/SocialAuth";
import {
  requireAuth,
  teamMiddleware,
  type AuthVariables,
  type TeamVariables,
} from "../middleware/auth";
import { db } from "../db";
import { orders, teams, vendors, users, parts, orderItems } from "../db/schema";
import type { OrderStatus } from "../db/schema";
import { eq, desc, and, count, or, asc } from "drizzle-orm";
import { requireMentor } from "../middleware/auth";

const app = new Hono<{ Variables: AuthVariables & TeamVariables }>();

// Apply auth middleware
app.use("*", requireAuth);

const statusColors: Record<OrderStatus, { bg: string; text: string }> = {
  draft: { bg: "bg-gray-100", text: "text-gray-800" },
  pending: { bg: "bg-yellow-100", text: "text-yellow-800" },
  approved: { bg: "bg-blue-100", text: "text-blue-800" },
  rejected: { bg: "bg-red-100", text: "text-red-800" },
  ordered: { bg: "bg-purple-100", text: "text-purple-800" },
  received: { bg: "bg-green-100", text: "text-green-800" },
};

const statusLabels: Record<OrderStatus, string> = {
  draft: "Draft",
  pending: "Pending Approval",
  approved: "Approved",
  rejected: "Rejected",
  ordered: "Ordered",
  received: "Received",
};

// Orders list page
app.get("/teams/:teamId/orders", teamMiddleware, async (c) => {
  const user = c.get("user")!;
  const teamId = c.get("teamId");
  const teamRole = c.get("teamRole");

  const team = await db.query.teams.findFirst({
    where: eq(teams.id, teamId),
  });

  if (!team) {
    return c.redirect("/dashboard?error=team_not_found");
  }

  // Filter by status
  const statusFilter = c.req.query("status") as OrderStatus | undefined;

  // Get orders with vendor info
  let orderQuery = db
    .select({
      order: orders,
      vendor: vendors,
      createdBy: users,
    })
    .from(orders)
    .leftJoin(vendors, eq(orders.vendorId, vendors.id))
    .leftJoin(users, eq(orders.createdById, users.id))
    .where(eq(orders.teamId, teamId))
    .orderBy(desc(orders.createdAt))
    .$dynamic();

  if (statusFilter) {
    orderQuery = orderQuery.where(
      and(eq(orders.teamId, teamId), eq(orders.status, statusFilter))
    );
  }

  const ordersList = await orderQuery;

  // Get order counts by status
  const statusCounts = await db
    .select({
      status: orders.status,
      count: count(),
    })
    .from(orders)
    .where(eq(orders.teamId, teamId))
    .groupBy(orders.status);

  const countsByStatus = Object.fromEntries(
    statusCounts.map((s) => [s.status, s.count])
  ) as Record<OrderStatus, number>;

  // Calculate totals
  const totalValue = ordersList.reduce(
    (sum, o) => sum + (o.order.totalCents || 0),
    0
  );

  const canCreate = teamRole === "admin" || teamRole === "mentor";

  return c.html(
    <Layout title={`Orders - ${team.name}`}>
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
              <span class="text-gray-600">Orders</span>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-sm text-gray-600">{user.name}</span>
              <SignOutButton class="text-sm text-gray-500 hover:text-gray-700" />
            </div>
          </div>
        </nav>

        <div class="max-w-7xl mx-auto py-8 px-4">
          <div class="flex justify-between items-center mb-6">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Orders</h1>
              <p class="text-gray-600">
                {ordersList.length} orders &middot; $
                {(totalValue / 100).toFixed(2)} total
              </p>
            </div>
            {canCreate && (
              <a
                href={`/teams/${team.id}/orders/new`}
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                New Order
              </a>
            )}
          </div>

          {/* Status filter tabs */}
          <div class="bg-white rounded-lg shadow mb-6">
            <div class="border-b border-gray-200">
              <nav class="flex -mb-px overflow-x-auto">
                <a
                  href={`/teams/${team.id}/orders`}
                  class={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                    !statusFilter
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  All ({ordersList.length})
                </a>
                {(
                  [
                    "draft",
                    "pending",
                    "approved",
                    "rejected",
                    "ordered",
                    "received",
                  ] as OrderStatus[]
                ).map((status) => (
                  <a
                    href={`/teams/${team.id}/orders?status=${status}`}
                    class={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                      statusFilter === status
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {statusLabels[status]} ({countsByStatus[status] || 0})
                  </a>
                ))}
              </nav>
            </div>
          </div>

          {/* Orders list */}
          {ordersList.length === 0 ? (
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
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
              </div>
              <h2 class="text-xl font-semibold text-gray-900 mb-2">
                No orders yet
              </h2>
              <p class="text-gray-600 mb-6">
                {statusFilter
                  ? `No ${statusLabels[statusFilter].toLowerCase()} orders.`
                  : "Create your first order to get started."}
              </p>
              {canCreate && !statusFilter && (
                <a
                  href={`/teams/${team.id}/orders/new`}
                  class="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Create Your First Order
                </a>
              )}
            </div>
          ) : (
            <div class="bg-white rounded-lg shadow overflow-hidden">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  {ordersList.map(({ order, vendor, createdBy }) => {
                    const colors = statusColors[order.status];
                    return (
                      <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="text-sm font-medium text-gray-900">
                            Order #{order.id.substring(0, 8)}
                          </div>
                          <div class="text-sm text-gray-500">
                            by {createdBy?.name || "Unknown"}
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {vendor?.name || "-"}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span
                            class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}
                          >
                            {statusLabels[order.status]}
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${(order.totalCents / 100).toFixed(2)}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.createdAt.toLocaleDateString()}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <a
                            href={`/teams/${team.id}/orders/${order.id}`}
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

// Create order form - Step 1: Select vendor
app.get(
  "/teams/:teamId/orders/new",
  teamMiddleware,
  requireMentor,
  async (c) => {
    const user = c.get("user")!;
    const teamId = c.get("teamId");

    const team = await db.query.teams.findFirst({
      where: eq(teams.id, teamId),
    });

    if (!team) {
      return c.redirect("/dashboard?error=team_not_found");
    }

    // Get available vendors
    const availableVendors = await db.query.vendors.findMany({
      where: or(eq(vendors.isGlobal, true), eq(vendors.teamId, teamId)),
      orderBy: asc(vendors.name),
    });

    return c.html(
      <Layout title={`New Order - ${team.name}`}>
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
                <a
                  href={`/teams/${team.id}/orders`}
                  class="text-gray-600 hover:text-gray-900"
                >
                  Orders
                </a>
              </div>
              <div class="flex items-center gap-4">
                <span class="text-sm text-gray-600">{user.name}</span>
                <SignOutButton class="text-sm text-gray-500 hover:text-gray-700" />
              </div>
            </div>
          </nav>

          <div class="max-w-2xl mx-auto py-8 px-4">
            <div class="mb-6">
              <a
                href={`/teams/${team.id}/orders`}
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
                Back to Orders
              </a>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
              <h1 class="text-2xl font-bold text-gray-900 mb-6">
                Create New Order
              </h1>

              <form
                hx-post={`/teams/${team.id}/orders`}
                hx-target="#form-result"
                hx-swap="innerHTML"
                class="space-y-6"
              >
                <div>
                  <label
                    for="vendorId"
                    class="block text-sm font-medium text-gray-700"
                  >
                    Vendor *
                  </label>
                  <select
                    id="vendorId"
                    name="vendorId"
                    required
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a vendor...</option>
                    {availableVendors.map((v) => (
                      <option value={v.id}>{v.name}</option>
                    ))}
                  </select>
                  <p class="mt-1 text-sm text-gray-500">
                    Choose the vendor for this order
                  </p>
                </div>

                <div>
                  <label
                    for="notes"
                    class="block text-sm font-medium text-gray-700"
                  >
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    placeholder="Optional notes about this order..."
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  ></textarea>
                </div>

                <div id="form-result"></div>

                <div class="flex gap-4">
                  <button
                    type="submit"
                    class="flex-1 flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <span>Create Draft Order</span>
                    <span class="htmx-indicator">
                      <svg
                        class="animate-spin h-4 w-4"
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
                  <a
                    href={`/teams/${team.id}/orders`}
                    class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
);

// Create order POST handler
app.post("/teams/:teamId/orders", teamMiddleware, requireMentor, async (c) => {
  const user = c.get("user")!;
  const teamId = c.get("teamId");
  const body = await c.req.parseBody();

  const vendorId = body.vendorId as string;
  const notes = (body.notes as string)?.trim() || null;

  if (!vendorId) {
    return c.html(
      <div class="p-3 bg-red-50 border border-red-200 rounded-md">
        <p class="text-sm text-red-600">Please select a vendor.</p>
      </div>
    );
  }

  try {
    const orderId = crypto.randomUUID();

    await db.insert(orders).values({
      id: orderId,
      teamId,
      vendorId,
      status: "draft",
      totalCents: 0,
      notes,
      createdById: user.id,
    });

    c.header("HX-Redirect", `/teams/${teamId}/orders/${orderId}`);
    return c.html(<div>Redirecting...</div>);
  } catch (error) {
    console.error("Failed to create order:", error);
    return c.html(
      <div class="p-3 bg-red-50 border border-red-200 rounded-md">
        <p class="text-sm text-red-600">
          Failed to create order. Please try again.
        </p>
      </div>
    );
  }
});

// Order detail page
app.get("/teams/:teamId/orders/:orderId", teamMiddleware, async (c) => {
  const user = c.get("user")!;
  const teamId = c.get("teamId");
  const teamRole = c.get("teamRole");
  const orderId = c.req.param("orderId");

  const team = await db.query.teams.findFirst({
    where: eq(teams.id, teamId),
  });

  const order = await db.query.orders.findFirst({
    where: and(eq(orders.id, orderId), eq(orders.teamId, teamId)),
  });

  if (!team || !order) {
    return c.redirect(`/teams/${teamId}/orders?error=not_found`);
  }

  const vendor = await db.query.vendors.findFirst({
    where: eq(vendors.id, order.vendorId),
  });

  const createdBy = await db.query.users.findFirst({
    where: eq(users.id, order.createdById),
  });

  // Get order items with part info
  const items = await db
    .select({
      item: orderItems,
      part: parts,
    })
    .from(orderItems)
    .leftJoin(parts, eq(orderItems.partId, parts.id))
    .where(eq(orderItems.orderId, orderId));

  const canEdit =
    (teamRole === "admin" || teamRole === "mentor") && order.status === "draft";
  const _canApprove = teamRole === "admin" && order.status === "pending";
  const canSubmit =
    (teamRole === "admin" || teamRole === "mentor") && order.status === "draft";

  const colors = statusColors[order.status];

  return c.html(
    <Layout title={`Order #${order.id.substring(0, 8)} - ${team.name}`}>
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
              <a
                href={`/teams/${team.id}/orders`}
                class="text-gray-600 hover:text-gray-900"
              >
                Orders
              </a>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-sm text-gray-600">{user.name}</span>
              <SignOutButton class="text-sm text-gray-500 hover:text-gray-700" />
            </div>
          </div>
        </nav>

        <div class="max-w-4xl mx-auto py-8 px-4">
          <div class="mb-6">
            <a
              href={`/teams/${team.id}/orders`}
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
              Back to Orders
            </a>
          </div>

          <div class="bg-white rounded-lg shadow">
            <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-start">
              <div>
                <div class="flex items-center gap-3">
                  <h1 class="text-2xl font-bold text-gray-900">
                    Order #{order.id.substring(0, 8)}
                  </h1>
                  <span
                    class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}
                  >
                    {statusLabels[order.status]}
                  </span>
                </div>
                <p class="text-gray-500">
                  {vendor?.name} &middot; Created by {createdBy?.name} on{" "}
                  {order.createdAt.toLocaleDateString()}
                </p>
              </div>
              <div class="flex gap-2">
                {canSubmit && items.length > 0 && (
                  <form
                    hx-post={`/teams/${team.id}/orders/${order.id}/submit`}
                    hx-swap="none"
                  >
                    <button
                      type="submit"
                      class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                    >
                      Submit for Approval
                    </button>
                  </form>
                )}
              </div>
            </div>

            <div class="p-6">
              {/* Order Items */}
              <div class="mb-6">
                <div class="flex justify-between items-center mb-4">
                  <h2 class="text-lg font-semibold text-gray-900">
                    Order Items
                  </h2>
                  {canEdit && (
                    <a
                      href={`/teams/${team.id}/orders/${order.id}/add-item`}
                      class="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition"
                    >
                      Add Item
                    </a>
                  )}
                </div>

                {items.length === 0 ? (
                  <div class="text-center py-8 bg-gray-50 rounded-lg">
                    <p class="text-gray-500 mb-4">
                      No items in this order yet.
                    </p>
                    {canEdit && (
                      <a
                        href={`/teams/${team.id}/orders/${order.id}/add-item`}
                        class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                      >
                        Add First Item
                      </a>
                    )}
                  </div>
                ) : (
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Part
                        </th>
                        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Qty
                        </th>
                        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Unit Price
                        </th>
                        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                      {items.map(({ item, part }) => (
                        <tr>
                          <td class="px-4 py-3">
                            <div class="text-sm font-medium text-gray-900">
                              {part?.name || "Unknown Part"}
                            </div>
                            {part?.sku && (
                              <div class="text-sm text-gray-500">
                                SKU: {part.sku}
                              </div>
                            )}
                          </td>
                          <td class="px-4 py-3 text-right text-sm text-gray-900">
                            {item.quantity}
                          </td>
                          <td class="px-4 py-3 text-right text-sm text-gray-900">
                            ${(item.unitPriceCents / 100).toFixed(2)}
                          </td>
                          <td class="px-4 py-3 text-right text-sm font-medium text-gray-900">
                            $
                            {(
                              (item.quantity * item.unitPriceCents) /
                              100
                            ).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot class="bg-gray-50">
                      <tr>
                        <td
                          colspan={3}
                          class="px-4 py-3 text-right text-sm font-semibold text-gray-900"
                        >
                          Total
                        </td>
                        <td class="px-4 py-3 text-right text-lg font-bold text-gray-900">
                          ${(order.totalCents / 100).toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                )}
              </div>

              {/* Notes */}
              {order.notes && (
                <div class="border-t pt-4">
                  <h3 class="text-sm font-medium text-gray-500 mb-2">Notes</h3>
                  <p class="text-gray-900">{order.notes}</p>
                </div>
              )}

              {/* Rejection reason */}
              {order.status === "rejected" && order.rejectionReason && (
                <div class="border-t pt-4 mt-4">
                  <h3 class="text-sm font-medium text-red-500 mb-2">
                    Rejection Reason
                  </h3>
                  <p class="text-gray-900">{order.rejectionReason}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
});

// Add item to order form
app.get(
  "/teams/:teamId/orders/:orderId/add-item",
  teamMiddleware,
  requireMentor,
  async (c) => {
    const user = c.get("user")!;
    const teamId = c.get("teamId");
    const orderId = c.req.param("orderId");

    const team = await db.query.teams.findFirst({
      where: eq(teams.id, teamId),
    });

    const order = await db.query.orders.findFirst({
      where: and(
        eq(orders.id, orderId),
        eq(orders.teamId, teamId),
        eq(orders.status, "draft")
      ),
    });

    if (!team || !order) {
      return c.redirect(`/teams/${teamId}/orders?error=not_found`);
    }

    const vendor = await db.query.vendors.findFirst({
      where: eq(vendors.id, order.vendorId),
    });

    // Get parts from this vendor
    const vendorParts = await db.query.parts.findMany({
      where: and(eq(parts.teamId, teamId), eq(parts.vendorId, order.vendorId)),
      orderBy: asc(parts.name),
    });

    return c.html(
      <Layout title={`Add Item - Order #${order.id.substring(0, 8)}`}>
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
                <a
                  href={`/teams/${team.id}/orders`}
                  class="text-gray-600 hover:text-gray-900"
                >
                  Orders
                </a>
              </div>
              <div class="flex items-center gap-4">
                <span class="text-sm text-gray-600">{user.name}</span>
                <SignOutButton class="text-sm text-gray-500 hover:text-gray-700" />
              </div>
            </div>
          </nav>

          <div class="max-w-2xl mx-auto py-8 px-4">
            <div class="mb-6">
              <a
                href={`/teams/${team.id}/orders/${order.id}`}
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
                Back to Order
              </a>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
              <h1 class="text-2xl font-bold text-gray-900 mb-2">
                Add Item to Order
              </h1>
              <p class="text-gray-500 mb-6">Ordering from {vendor?.name}</p>

              {vendorParts.length === 0 ? (
                <div class="text-center py-8 bg-gray-50 rounded-lg">
                  <p class="text-gray-500 mb-4">
                    No parts found from this vendor.
                  </p>
                  <a
                    href={`/teams/${team.id}/parts/new`}
                    class="text-blue-600 hover:text-blue-500"
                  >
                    Add a part from {vendor?.name}
                  </a>
                </div>
              ) : (
                <form
                  hx-post={`/teams/${team.id}/orders/${order.id}/items`}
                  hx-target="#form-result"
                  hx-swap="innerHTML"
                  class="space-y-6"
                >
                  <div>
                    <label
                      for="partId"
                      class="block text-sm font-medium text-gray-700"
                    >
                      Part *
                    </label>
                    <select
                      id="partId"
                      name="partId"
                      required
                      class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a part...</option>
                      {vendorParts.map((p) => (
                        <option value={p.id} data-price={p.unitPriceCents || 0}>
                          {p.name} {p.sku ? `(${p.sku})` : ""} - $
                          {((p.unitPriceCents || 0) / 100).toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        for="quantity"
                        class="block text-sm font-medium text-gray-700"
                      >
                        Quantity *
                      </label>
                      <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        required
                        min="1"
                        value="1"
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label
                        for="unitPrice"
                        class="block text-sm font-medium text-gray-700"
                      >
                        Unit Price ($) *
                      </label>
                      <input
                        type="number"
                        id="unitPrice"
                        name="unitPrice"
                        required
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div id="form-result"></div>

                  <div class="flex gap-4">
                    <button
                      type="submit"
                      class="flex-1 flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Add Item
                    </button>
                    <a
                      href={`/teams/${team.id}/orders/${order.id}`}
                      class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </a>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </Layout>
    );
  }
);

// Add item POST handler
app.post(
  "/teams/:teamId/orders/:orderId/items",
  teamMiddleware,
  requireMentor,
  async (c) => {
    const teamId = c.get("teamId");
    const orderId = c.req.param("orderId");
    const body = await c.req.parseBody();

    const partId = body.partId as string;
    const quantity = parseInt(body.quantity as string) || 0;
    const unitPrice = parseFloat(body.unitPrice as string) || 0;

    if (!partId || quantity < 1 || unitPrice < 0) {
      return c.html(
        <div class="p-3 bg-red-50 border border-red-200 rounded-md">
          <p class="text-sm text-red-600">
            Please fill in all required fields.
          </p>
        </div>
      );
    }

    // Verify order is draft and belongs to team
    const order = await db.query.orders.findFirst({
      where: and(
        eq(orders.id, orderId),
        eq(orders.teamId, teamId),
        eq(orders.status, "draft")
      ),
    });

    if (!order) {
      return c.html(
        <div class="p-3 bg-red-50 border border-red-200 rounded-md">
          <p class="text-sm text-red-600">Order not found or not editable.</p>
        </div>
      );
    }

    try {
      const itemId = crypto.randomUUID();
      const unitPriceCents = Math.round(unitPrice * 100);

      await db.insert(orderItems).values({
        id: itemId,
        orderId,
        partId,
        quantity,
        unitPriceCents,
      });

      // Update order total
      const newTotal = order.totalCents + quantity * unitPriceCents;
      await db
        .update(orders)
        .set({ totalCents: newTotal, updatedAt: new Date() })
        .where(eq(orders.id, orderId));

      c.header("HX-Redirect", `/teams/${teamId}/orders/${orderId}`);
      return c.html(<div>Redirecting...</div>);
    } catch (error) {
      console.error("Failed to add item:", error);
      return c.html(
        <div class="p-3 bg-red-50 border border-red-200 rounded-md">
          <p class="text-sm text-red-600">
            Failed to add item. Please try again.
          </p>
        </div>
      );
    }
  }
);

// Submit order for approval
app.post(
  "/teams/:teamId/orders/:orderId/submit",
  teamMiddleware,
  requireMentor,
  async (c) => {
    const teamId = c.get("teamId");
    const orderId = c.req.param("orderId");

    const order = await db.query.orders.findFirst({
      where: and(
        eq(orders.id, orderId),
        eq(orders.teamId, teamId),
        eq(orders.status, "draft")
      ),
    });

    if (!order) {
      return c.redirect(`/teams/${teamId}/orders?error=not_found`);
    }

    await db
      .update(orders)
      .set({
        status: "pending",
        submittedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    return c.redirect(`/teams/${teamId}/orders/${orderId}`);
  }
);

export default app;
