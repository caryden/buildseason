import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { queryKeys } from "@/lib/query-keys";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MoreHorizontal,
  UserPlus,
  Copy,
  Check,
  Trash2,
  Shield,
  GraduationCap,
  User,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/team/$program/$number/members/")({
  component: MembersPage,
});

type Member = {
  id: string;
  userId: string;
  role: "admin" | "mentor" | "student";
  joinedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
};

type Invite = {
  id: string;
  token: string;
  role: string;
  expiresAt: string;
  createdBy: string;
};

const ROLE_LABELS = {
  admin: "Admin",
  mentor: "Mentor",
  student: "Student",
} as const;

const ROLE_ICONS = {
  admin: Shield,
  mentor: GraduationCap,
  student: User,
} as const;

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function MembersPage() {
  const { program, number } = Route.useParams();
  const queryClient = useQueryClient();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteRole, setInviteRole] = useState<string>("student");
  const [generatedInvite, setGeneratedInvite] = useState<{
    token: string;
    url: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Get team info from the teams list
  const { data: teams } = useQuery({
    queryKey: queryKeys.teams.list(),
    queryFn: async () => {
      const res = await fetch("/api/teams");
      if (!res.ok) throw new Error("Failed to fetch teams");
      return res.json() as Promise<
        Array<{ id: string; program: string; number: string; role: string }>
      >;
    },
  });

  const currentTeam = teams?.find(
    (t) => t.program === program && t.number === number
  );
  const teamId = currentTeam?.id;
  const userRole = currentTeam?.role;
  const canManage = userRole === "admin" || userRole === "mentor";

  // Fetch members
  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: queryKeys.teams.members(teamId || ""),
    queryFn: async () => {
      const res = await fetch(`/api/teams/${teamId}/members`);
      if (!res.ok) throw new Error("Failed to fetch members");
      return res.json() as Promise<Member[]>;
    },
    enabled: !!teamId,
  });

  // Fetch pending invites
  const { data: invites } = useQuery({
    queryKey: queryKeys.teams.invites(teamId || ""),
    queryFn: async () => {
      const res = await fetch(`/api/teams/${teamId}/members/invites`);
      if (!res.ok) return [];
      return res.json() as Promise<Invite[]>;
    },
    enabled: !!teamId && canManage,
  });

  // Create invite mutation
  const createInviteMutation = useMutation({
    mutationFn: async (role: string) => {
      const res = await fetch(`/api/teams/${teamId}/members/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error("Failed to create invite");
      return res.json() as Promise<{ token: string }>;
    },
    onSuccess: (data) => {
      const url = `${window.location.origin}/teams/join?code=${data.token}`;
      setGeneratedInvite({ token: data.token, url });
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.invites(teamId || ""),
      });
    },
    onError: () => {
      toast.error("Failed to create invite");
    },
  });

  // Change role mutation
  const changeRoleMutation = useMutation({
    mutationFn: async ({
      memberId,
      newRole,
    }: {
      memberId: string;
      newRole: string;
    }) => {
      const res = await fetch(`/api/teams/${teamId}/members/${memberId}/role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to change role");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.members(teamId || ""),
      });
      toast.success("Role updated");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const res = await fetch(`/api/teams/${teamId}/members/${memberId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to remove member");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.members(teamId || ""),
      });
      toast.success("Member removed");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  // Delete invite mutation
  const deleteInviteMutation = useMutation({
    mutationFn: async (inviteId: string) => {
      const res = await fetch(
        `/api/teams/${teamId}/members/invites/${inviteId}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) throw new Error("Failed to delete invite");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.invites(teamId || ""),
      });
      toast.success("Invite revoked");
    },
  });

  const handleCreateInvite = () => {
    createInviteMutation.mutate(inviteRole);
  };

  const handleCopyInvite = async () => {
    if (generatedInvite) {
      await navigator.clipboard.writeText(generatedInvite.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCloseInviteDialog = () => {
    setIsInviteOpen(false);
    setGeneratedInvite(null);
    setInviteRole("student");
  };

  // Group members by role
  const membersByRole = {
    admin: members?.filter((m) => m.role === "admin") || [],
    mentor: members?.filter((m) => m.role === "mentor") || [],
    student: members?.filter((m) => m.role === "student") || [],
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold font-display">Team Members</h1>
          <p className="text-muted-foreground">
            {members?.length || 0} member{members?.length !== 1 ? "s" : ""}
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setIsInviteOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        )}
      </div>

      {membersLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pending Invites */}
          {canManage && invites && invites.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pending Invites</CardTitle>
                <CardDescription>
                  {invites.length} pending invite
                  {invites.length !== 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {invites.map((invite) => (
                    <div
                      key={invite.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium capitalize">
                          {invite.role} invite
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Created by {invite.createdBy} · Expires{" "}
                          {new Date(invite.expiresAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteInviteMutation.mutate(invite.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Members by Role */}
          {(["admin", "mentor", "student"] as const).map((role) => {
            const roleMembers = membersByRole[role];
            if (roleMembers.length === 0) return null;

            const RoleIcon = ROLE_ICONS[role];

            return (
              <Card key={role}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <RoleIcon className="h-5 w-5" />
                    {ROLE_LABELS[role]}s
                  </CardTitle>
                  <CardDescription>
                    {roleMembers.length} {ROLE_LABELS[role].toLowerCase()}
                    {roleMembers.length !== 1 ? "s" : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {roleMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={member.user.image || undefined} />
                            <AvatarFallback>
                              {getInitials(member.user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {member.user.name || "Unknown"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {member.user.email}
                            </p>
                          </div>
                        </div>
                        {userRole === "admin" && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  changeRoleMutation.mutate({
                                    memberId: member.id,
                                    newRole: "admin",
                                  })
                                }
                                disabled={member.role === "admin"}
                              >
                                <Shield className="mr-2 h-4 w-4" />
                                Make Admin
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  changeRoleMutation.mutate({
                                    memberId: member.id,
                                    newRole: "mentor",
                                  })
                                }
                                disabled={member.role === "mentor"}
                              >
                                <GraduationCap className="mr-2 h-4 w-4" />
                                Make Mentor
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  changeRoleMutation.mutate({
                                    memberId: member.id,
                                    newRole: "student",
                                  })
                                }
                                disabled={member.role === "student"}
                              >
                                <User className="mr-2 h-4 w-4" />
                                Make Student
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() =>
                                  removeMemberMutation.mutate(member.id)
                                }
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Invite Dialog */}
      <Dialog open={isInviteOpen} onOpenChange={handleCloseInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Create an invite link to share with new team members.
            </DialogDescription>
          </DialogHeader>

          {!generatedInvite ? (
            <>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="mentor">Mentor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    The invited user will join with this role.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleCloseInviteDialog}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateInvite}
                  disabled={createInviteMutation.isPending}
                >
                  Generate Invite
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <div className="space-y-4 py-4">
                <p className="text-sm text-muted-foreground">
                  Share this link with the new team member. It expires in 7
                  days.
                </p>
                <div className="flex gap-2">
                  <Input value={generatedInvite.url} readOnly />
                  <Button variant="outline" onClick={handleCopyInvite}>
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Invite code: <code>{generatedInvite.token}</code>
                </p>
              </div>
              <DialogFooter>
                <Button onClick={handleCloseInviteDialog}>Done</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
