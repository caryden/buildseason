---
name: api-response-patterns
description: >-
  API response structure patterns and frontend consumption.
  Use when creating API endpoints that return lists, working with
  API responses in frontend code, or debugging data fetching issues.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# API Response Patterns

Patterns for API response structures learned from Wave 0.

## The Problem (Wave 0 Learning)

**Issue:** Robots page crashed with `seasons?.find is not a function`

**Root cause:** API returned wrapped object `{seasons: [...], activeSeasonId: ...}` but frontend expected raw array.

```typescript
// API returned:
{ seasons: [...], activeSeasonId: "abc" }

// Frontend expected:
[...]  // raw array
```

## The Rule

**Lists with metadata MUST be wrapped. Frontend MUST extract.**

### API Side

```typescript
// GOOD: Wrapped response with metadata
app.get("/teams/:id/seasons", async (c) => {
  const seasons = await db.query.seasons.findMany({...});
  const active = seasons.find(s => s.isActive);
  return c.json({
    seasons: seasons,           // Always named array
    activeSeasonId: active?.id  // Metadata alongside
  });
});

// BAD: Raw array (no room for metadata)
app.get("/teams/:id/seasons", async (c) => {
  const seasons = await db.query.seasons.findMany({...});
  return c.json(seasons);  // Can't add metadata later without breaking
});
```

### Frontend Side

```typescript
// GOOD: Extract array from wrapper, map fields if needed
const { data: seasons } = useQuery({
  queryKey: ["teams", teamId, "seasons"],
  queryFn: async () => {
    const res = await fetch(`/api/teams/${teamId}/seasons`);
    const data = (await res.json()) as {
      seasons: ApiSeason[];
      activeSeasonId: string | null;
    };
    // Extract and transform
    return data.seasons.map((s) => ({
      id: s.id,
      name: s.seasonName, // Map API field to component field
      year: s.seasonYear,
      isCurrent: s.isActive,
    }));
  },
});

// BAD: Assume raw array
const { data: seasons } = useQuery({
  queryFn: async () => {
    const res = await fetch(`/api/teams/${teamId}/seasons`);
    return res.json() as Season[]; // Breaks if API wraps
  },
});
```

## Field Mapping Pattern

When API field names differ from component needs:

```typescript
// Define both types
type ApiSeason = {
  id: string;
  seasonName: string; // API naming
  seasonYear: number;
  isActive: boolean;
};

type Season = {
  id: string;
  name: string; // Component naming
  year: number;
  isCurrent: boolean;
};

// Map in fetch
return data.seasons.map(
  (s): Season => ({
    id: s.id,
    name: s.seasonName,
    year: s.seasonYear,
    isCurrent: s.isActive,
  })
);
```

## Checklist

When creating list endpoints:

- [ ] Wrap array in object: `{ items: [...] }`
- [ ] Include pagination if applicable: `{ items, total, page, limit }`
- [ ] Include related metadata: `{ items, activeId, lastUpdated }`

When consuming list endpoints:

- [ ] Check API response shape (wrapped vs raw)
- [ ] Define API type AND component type if fields differ
- [ ] Extract array from wrapper
- [ ] Map fields if naming differs

## Anti-Patterns

- **Assuming response shape** - Always check actual API response
- **Casting without extraction** - `as Season[]` on wrapped response fails
- **Mixing API/component types** - Keep them separate, map explicitly
