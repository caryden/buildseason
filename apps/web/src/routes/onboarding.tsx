import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api, handleResponse } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, UserPlus } from "lucide-react";
import { useEffect } from "react";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingPage,
});

function OnboardingPage() {
  const navigate = useNavigate();

  const { data: teams, isLoading } = useQuery({
    queryKey: queryKeys.teams.list(),
    queryFn: async () => {
      const res = await api.api.teams.$get();
      return handleResponse<Array<{ id: string }>>(res);
    },
  });

  // If user already has teams, redirect to dashboard
  useEffect(() => {
    if (!isLoading && teams && teams.length > 0) {
      navigate({ to: "/dashboard" });
    }
  }, [teams, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-display">
            Welcome to BuildSeason
          </h1>
          <p className="text-muted-foreground mt-2">
            Get started by creating a new team or joining an existing one
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Link to="/teams/new">
            <Card className="cursor-pointer hover:border-primary transition-colors h-full">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10">
                  <Plus className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-center">Create a Team</CardTitle>
                <CardDescription className="text-center">
                  Start a new team for your FTC or FRC robotics program
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Create Team</Button>
              </CardContent>
            </Card>
          </Link>

          <Link to="/teams/join">
            <Card className="cursor-pointer hover:border-primary transition-colors h-full">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 rounded-full bg-secondary">
                  <UserPlus className="h-8 w-8 text-secondary-foreground" />
                </div>
                <CardTitle className="text-center">Join a Team</CardTitle>
                <CardDescription className="text-center">
                  Enter an invite code to join an existing team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Join Team
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          You can join multiple teams or create more teams later from the
          dashboard.
        </p>
      </div>
    </div>
  );
}
