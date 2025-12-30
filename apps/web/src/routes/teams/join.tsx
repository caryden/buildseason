import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/teams/join")({
  component: JoinTeamPage,
});

type InviteResponse = {
  team: {
    program: string;
    name: string;
    number: string;
  };
  role?: string;
  alreadyMember?: boolean;
};

type JoinResponse = {
  success: boolean;
  team: {
    program: string;
    number: string;
  };
  alreadyMember?: boolean;
  error?: string;
};

function JoinTeamPage() {
  const navigate = useNavigate();
  const [inviteCode, setInviteCode] = useState("");
  const [inviteData, setInviteData] = useState<InviteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Validate invite code
  const validateMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await fetch(`/api/invite/${code}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid invite code");
      }
      return data as InviteResponse;
    },
    onSuccess: (data) => {
      setInviteData(data);
      setError(null);
    },
    onError: (err: Error) => {
      setError(err.message);
      setInviteData(null);
    },
  });

  // Join team
  const joinMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await fetch(`/api/invite/${code}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to join team");
      }
      return data as JoinResponse;
    },
    onSuccess: (data) => {
      // Navigate to the team page
      navigate({
        to: "/team/$program/$number",
        params: { program: data.team.program, number: data.team.number },
      });
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleValidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      setError("Please enter an invite code");
      return;
    }
    validateMutation.mutate(inviteCode.trim());
  };

  const handleJoin = () => {
    joinMutation.mutate(inviteCode.trim());
  };

  const isLoading = validateMutation.isPending || joinMutation.isPending;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-md mx-auto">
        <Link
          to="/onboarding"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-display">Join a Team</CardTitle>
            <CardDescription>
              Enter an invite code to join an existing team
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!inviteData ? (
              <form onSubmit={handleValidate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Invite Code</Label>
                  <Input
                    id="code"
                    placeholder="Enter invite code"
                    value={inviteCode}
                    onChange={(e) => {
                      setInviteCode(e.target.value);
                      setError(null);
                    }}
                    disabled={isLoading}
                  />
                  {error && <p className="text-sm text-destructive">{error}</p>}
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !inviteCode.trim()}
                >
                  {validateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    "Continue"
                  )}
                </Button>
              </form>
            ) : inviteData.alreadyMember ? (
              <div className="text-center py-4">
                <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
                <h3 className="font-semibold text-lg mb-2">
                  You're already a member!
                </h3>
                <p className="text-muted-foreground mb-4">
                  You are already a member of{" "}
                  <span className="font-medium">{inviteData.team.name}</span> (#
                  {inviteData.team.number})
                </p>
                <Button
                  onClick={() =>
                    navigate({
                      to: "/team/$program/$number",
                      params: {
                        program: inviteData.team.program,
                        number: inviteData.team.number,
                      },
                    })
                  }
                  className="w-full"
                >
                  Go to Team
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">
                    You're invited to join
                  </p>
                  <p className="font-semibold text-lg">
                    {inviteData.team.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Team #{inviteData.team.number} &middot; Role:{" "}
                    <span className="capitalize">{inviteData.role}</span>
                  </p>
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setInviteData(null);
                      setInviteCode("");
                      setError(null);
                    }}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleJoin}
                    disabled={isLoading}
                  >
                    {joinMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      "Join Team"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
