// Query key factories for cache management
// See: https://tkdodo.eu/blog/effective-react-query-keys

export const queryKeys = {
  // User
  user: {
    all: ["user"] as const,
    current: () => [...queryKeys.user.all, "current"] as const,
  },

  // Teams
  teams: {
    all: ["teams"] as const,
    list: () => [...queryKeys.teams.all, "list"] as const,
    detail: (teamId: string) => [...queryKeys.teams.all, teamId] as const,
  },

  // Team members
  members: {
    all: (teamId: string) => ["teams", teamId, "members"] as const,
    list: (teamId: string) =>
      [...queryKeys.members.all(teamId), "list"] as const,
  },

  // Parts
  parts: {
    all: (teamId: string) => ["teams", teamId, "parts"] as const,
    list: (teamId: string, filters?: { search?: string; lowStock?: boolean }) =>
      [...queryKeys.parts.all(teamId), "list", filters] as const,
    detail: (teamId: string, partId: string) =>
      [...queryKeys.parts.all(teamId), partId] as const,
  },

  // Orders
  orders: {
    all: (teamId: string) => ["teams", teamId, "orders"] as const,
    list: (teamId: string, status?: string) =>
      [...queryKeys.orders.all(teamId), "list", { status }] as const,
    detail: (teamId: string, orderId: string) =>
      [...queryKeys.orders.all(teamId), orderId] as const,
  },

  // BOM
  bom: {
    all: (teamId: string) => ["teams", teamId, "bom"] as const,
    list: (teamId: string) => [...queryKeys.bom.all(teamId), "list"] as const,
  },

  // Vendors
  vendors: {
    all: ["vendors"] as const,
    list: () => [...queryKeys.vendors.all, "list"] as const,
    detail: (vendorId: string) => [...queryKeys.vendors.all, vendorId] as const,
    forTeam: (teamId: string) => ["teams", teamId, "vendors", "list"] as const,
  },
} as const;
