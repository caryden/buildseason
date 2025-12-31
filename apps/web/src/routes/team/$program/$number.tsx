import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api, handleResponse, ApiError } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/team/$program/$number")({
  component: TeamLayout,
});

// Program labels for display
const programLabels: Record<string, string> = {
  ftc: "FTC",
  frc: "FRC",
  mate: "MATE",
  vex: "VEX",
  tarc: "TARC",
  other: "Other",
};

function TeamLayout() {
  const { program, number } = Route.useParams();

  // Try to fetch current user (will fail if not logged in)
  const {
    data: user,
    isLoading: userLoading,
    isError: userError,
  } = useQuery({
    queryKey: queryKeys.user.current(),
    queryFn: async () => {
      const res = await api.api.user.$get();
      return handleResponse<{
        id: string;
        name: string | null;
        email: string;
        image: string | null;
      }>(res);
    },
    retry: false,
  });

  // Fetch user's teams (only if logged in)
  const { data: teams } = useQuery({
    queryKey: queryKeys.teams.list(),
    queryFn: async () => {
      const res = await api.api.teams.$get();
      return handleResponse<
        Array<{
          id: string;
          program: string;
          name: string;
          number: string;
          season: string;
          role: string;
          stats: {
            partsCount: number;
            lowStockCount: number;
            pendingOrdersCount: number;
            activeOrdersCount: number;
          };
        }>
      >(res);
    },
    enabled: !!user,
  });

  // Fetch public team info (no auth required)
  const {
    data: publicTeam,
    isLoading: publicTeamLoading,
    isError: publicTeamError,
  } = useQuery({
    queryKey: queryKeys.publicTeam.byProgramNumber(program, number),
    queryFn: async () => {
      const res = await fetch(`/api/public/team/${program}/${number}`);
      if (!res.ok) {
        const data = await res.json();
        throw new ApiError(
          data.error || "Team not found",
          res.status,
          data.code
        );
      }
      return res.json() as Promise<{
        program: string;
        name: string;
        number: string;
        season: string;
      }>;
    },
  });

  // Check if user is a member of this team
  const currentTeam = teams?.find(
    (t) => t.program === program && t.number === number
  );
  const isTeamMember = !!currentTeam;
  const isAuthenticated = !!user && !userError;

  // Loading state
  if (userLoading || publicTeamLoading) {
    return <PublicTeamPageSkeleton />;
  }

  // 404 - Team not found
  if (publicTeamError) {
    return <TeamNotFound program={program} number={number} />;
  }

  // If user is authenticated AND is a team member, show the authenticated layout
  if (isAuthenticated && isTeamMember) {
    return (
      <AppLayout
        user={user}
        teams={teams}
        currentTeamId={currentTeam?.id}
        currentProgram={program}
        currentTeamNumber={number}
        teamName={
          currentTeam ? `#${currentTeam.number} ${currentTeam.name}` : undefined
        }
      >
        <Outlet />
      </AppLayout>
    );
  }

  // Show public team page for visitors (not logged in or not a team member)
  return (
    <PublicTeamPage team={publicTeam!} isAuthenticated={isAuthenticated} />
  );
}

// Public team page component (no auth required)
function PublicTeamPage({
  team,
  isAuthenticated,
}: {
  team: { program: string; name: string; number: string; season: string };
  isAuthenticated: boolean;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="text-xl font-bold font-display">
              BuildSeason
            </Link>
            <div className="flex items-center gap-4">
              {!isAuthenticated ? (
                <>
                  <Link to="/login">
                    <Button variant="ghost">Login</Button>
                  </Link>
                  <Link to="/login">
                    <Button>Get Started</Button>
                  </Link>
                </>
              ) : (
                <Link to="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Team Header */}
      <div className="bg-card border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Team Logo Placeholder */}
            <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center text-4xl font-bold text-muted-foreground">
              {team.number.slice(0, 2)}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold font-display">{team.name}</h1>
                <Badge variant="secondary">
                  {programLabels[team.program] || team.program.toUpperCase()}
                </Badge>
              </div>
              <p className="text-xl text-muted-foreground mb-4">
                Team #{team.number}
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {team.season}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* About Card */}
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
              <CardDescription>Team information</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {team.name} is a {programLabels[team.program] || team.program}{" "}
                robotics team competing in the {team.season} season.
              </p>
            </CardContent>
          </Card>

          {/* Season Card */}
          <Card>
            <CardHeader>
              <CardTitle>Current Season</CardTitle>
              <CardDescription>Competition status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{team.season}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events Placeholder */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Competition schedule</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              No upcoming events scheduled.
            </p>
          </CardContent>
        </Card>

        {/* Competition Stats Placeholder */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Competition Stats</CardTitle>
            <CardDescription>Performance data (coming soon)</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Competition statistics will be available in a future update.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Footer CTA */}
      <div className="border-t bg-muted/50 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-medium">This team uses BuildSeason</p>
              <p className="text-sm text-muted-foreground">
                Team management, parts tracking, and more for robotics teams.
              </p>
            </div>
            <Link to="/">
              <Button variant="outline" className="gap-2">
                Learn more about BuildSeason
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// 404 Team Not Found
function TeamNotFound({
  program,
  number,
}: {
  program: string;
  number: string;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="text-xl font-bold font-display">
              BuildSeason
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/login">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 404 Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h1 className="text-6xl font-bold text-muted-foreground mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Team Not Found</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          We couldn't find {programLabels[program] || program.toUpperCase()}{" "}
          team #{number}. The team may not exist or hasn't registered with
          BuildSeason yet.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/">
            <Button variant="outline">Go Home</Button>
          </Link>
          <Link to="/login">
            <Button>Create Your Team</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Loading skeleton for public team page
function PublicTeamPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <span className="text-xl font-bold font-display">BuildSeason</span>
            <div className="flex items-center gap-4">
              <Skeleton className="h-9 w-16" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        </div>
      </nav>

      {/* Team Header Skeleton */}
      <div className="bg-card border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <Skeleton className="w-24 h-24 rounded-lg" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-9 w-64" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
        <Skeleton className="h-32 mt-6" />
        <Skeleton className="h-32 mt-6" />
      </div>
    </div>
  );
}
