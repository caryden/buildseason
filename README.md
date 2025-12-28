# BuildSeason

Open-source team management platform for FTC robotics teams. Track parts, manage orders, coordinate with vendors, and build better robots.

## Features

- **Team Management** - Create teams, invite members, assign roles
- **Parts Inventory** - Track parts, quantities, locations, and costs
- **Vendor Directory** - Browse FTC-approved vendors with contact info
- **Bill of Materials** - Create BOMs for robot subsystems
- **Order Management** - Track orders from request to delivery
- **Dashboard** - Team overview with key metrics

## Tech Stack

- **Runtime:** [Bun](https://bun.sh)
- **Server:** [Hono](https://hono.dev) with JSX templates
- **Database:** [Turso](https://turso.tech) (libSQL) + [Drizzle ORM](https://orm.drizzle.team)
- **Interactivity:** [HTMX](https://htmx.org) + [Alpine.js](https://alpinejs.dev)
- **Styling:** [Tailwind CSS](https://tailwindcss.com)
- **Auth:** [Better-Auth](https://better-auth.com)

## Quick Start

```bash
# Install dependencies
bun install

# Set up environment
cp .env.example .env
# Edit .env with your settings

# Initialize database
bun run db:push
bun run db:seed  # optional sample data

# Start dev server
bun run dev
```

Visit http://localhost:3000

## Documentation

- [Deployment Guide](docs/deployment.md) - Local dev, Turso, Fly.io, domain setup
- [Agent Instructions](AGENTS.md) - For AI assistants working on this codebase

## Project Management

This project uses [beads](https://github.com/beads-project/beads) for issue tracking:

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --status in_progress  # Claim work
bd close <id>         # Complete work
```

## Development

```bash
bun run dev           # Start development server
bun run typecheck     # TypeScript type checking
bun run lint          # ESLint
bun test              # Run tests
bun run db:push       # Push schema changes
bun run db:studio     # Open Drizzle Studio
```

## License

MIT
