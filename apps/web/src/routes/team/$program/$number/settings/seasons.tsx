import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, handleResponse } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Calendar,
  Plus,
  MoreHorizontal,
  Archive,
  Trash2,
  Check,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/team/$program/$number/settings/seasons")(
  {
    component: SeasonsSettingsPage,
  }
);

interface Season {
  id: string;
  seasonYear: string;
  seasonName: string;
  startDate: string | null;
  endDate: string | null;
  isArchived: boolean;
  isActive: boolean;
  createdAt: string;
}

interface SeasonsResponse {
  seasons: Season[];
  activeSeasonId: string | null;
}

function SeasonsSettingsPage() {
  const { program, number } = Route.useParams();
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [seasonToDelete, setSeasonToDelete] = useState<Season | null>(null);

  // Form state for creating a new season
  const [newSeason, setNewSeason] = useState({
    seasonYear: "",
    seasonName: "",
    startDate: "",
    endDate: "",
    copyMembers: false,
  });

  // Get team ID first
  const { data: team } = useQuery({
    queryKey: ["team-lookup", program, number],
    queryFn: async () => {
      const res = await api.api.teams.lookup[":program"][":number"].$get({
        param: { program, number },
      });
      return handleResponse<{ id: string }>(res);
    },
  });

  // Get seasons
  const { data: seasonsData, isLoading } = useQuery({
    queryKey: ["seasons", team?.id],
    queryFn: async () => {
      if (!team?.id) throw new Error("Team not found");
      const res = await api.api.teams[":teamId"].seasons.$get({
        param: { teamId: team.id },
      });
      return handleResponse<SeasonsResponse>(res);
    },
    enabled: !!team?.id,
  });

  // Create season mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof newSeason) => {
      if (!team?.id) throw new Error("Team not found");
      const res = await fetch(`/api/teams/${team.id}/seasons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seasonYear: data.seasonYear,
          seasonName: data.seasonName,
          startDate: data.startDate
            ? new Date(data.startDate).toISOString()
            : undefined,
          endDate: data.endDate
            ? new Date(data.endDate).toISOString()
            : undefined,
          copyMembers: data.copyMembers,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create season");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seasons", team?.id] });
      setCreateDialogOpen(false);
      setNewSeason({
        seasonYear: "",
        seasonName: "",
        startDate: "",
        endDate: "",
        copyMembers: false,
      });
      toast.success("Season created successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create season");
    },
  });

  // Activate season mutation
  const activateMutation = useMutation({
    mutationFn: async (seasonId: string) => {
      if (!team?.id) throw new Error("Team not found");
      const res = await api.api.teams[":teamId"].seasons[
        ":seasonId"
      ].activate.$put({
        param: { teamId: team.id, seasonId },
      });
      return handleResponse(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seasons", team?.id] });
      toast.success("Season activated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to activate season");
    },
  });

  // Archive season mutation
  const archiveMutation = useMutation({
    mutationFn: async (seasonId: string) => {
      if (!team?.id) throw new Error("Team not found");
      const res = await api.api.teams[":teamId"].seasons[
        ":seasonId"
      ].archive.$put({
        param: { teamId: team.id, seasonId },
      });
      return handleResponse(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seasons", team?.id] });
      toast.success("Season archived successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to archive season");
    },
  });

  // Delete season mutation
  const deleteMutation = useMutation({
    mutationFn: async (seasonId: string) => {
      if (!team?.id) throw new Error("Team not found");
      const res = await api.api.teams[":teamId"].seasons[":seasonId"].$delete({
        param: { teamId: team.id, seasonId },
      });
      return handleResponse(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seasons", team?.id] });
      setDeleteDialogOpen(false);
      setSeasonToDelete(null);
      toast.success("Season deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete season");
    },
  });

  const handleCreateSeason = () => {
    createMutation.mutate(newSeason);
  };

  const handleDeleteClick = (season: Season) => {
    setSeasonToDelete(season);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (seasonToDelete) {
      deleteMutation.mutate(seasonToDelete.id);
    }
  };

  // Generate suggested season year based on current date
  const getSuggestedSeasonYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    // If we're in the second half of the year, suggest next year's season
    if (month >= 6) {
      return `${year}-${year + 1}`;
    }
    return `${year - 1}-${year}`;
  };

  const seasons = seasonsData?.seasons || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display">Seasons</h1>
          <p className="text-muted-foreground">
            Manage your team's competition seasons
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setNewSeason((prev) => ({
                  ...prev,
                  seasonYear: getSuggestedSeasonYear(),
                }));
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Season
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Season</DialogTitle>
              <DialogDescription>
                Start a new competition season for your team.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="seasonYear">Season Year</Label>
                <Input
                  id="seasonYear"
                  placeholder="2024-2025"
                  value={newSeason.seasonYear}
                  onChange={(e) =>
                    setNewSeason({ ...newSeason, seasonYear: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Format: YYYY-YYYY (e.g., 2024-2025)
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="seasonName">Season Name</Label>
                <Input
                  id="seasonName"
                  placeholder="Into The Deep"
                  value={newSeason.seasonName}
                  onChange={(e) =>
                    setNewSeason({ ...newSeason, seasonName: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  The official competition name from FIRST
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startDate">Start Date (Optional)</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newSeason.startDate}
                    onChange={(e) =>
                      setNewSeason({ ...newSeason, startDate: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endDate">End Date (Optional)</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newSeason.endDate}
                    onChange={(e) =>
                      setNewSeason({ ...newSeason, endDate: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="copyMembers"
                  checked={newSeason.copyMembers}
                  onCheckedChange={(checked) =>
                    setNewSeason({
                      ...newSeason,
                      copyMembers: checked === true,
                    })
                  }
                />
                <Label htmlFor="copyMembers" className="text-sm">
                  Carry over team members to new season
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateSeason}
                disabled={
                  createMutation.isPending ||
                  !newSeason.seasonYear ||
                  !newSeason.seasonName
                }
              >
                {createMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Season
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Team Seasons
          </CardTitle>
          <CardDescription>
            View and manage all seasons for your team. The active season is used
            for current team operations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : seasons.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No seasons yet</h3>
              <p className="text-muted-foreground">
                Create your first season to get started.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Season</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {seasons.map((season) => (
                  <TableRow key={season.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{season.seasonYear}</span>
                        <span className="text-sm text-muted-foreground">
                          {season.seasonName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {season.startDate
                          ? new Date(season.startDate).toLocaleDateString()
                          : "-"}
                        {season.endDate &&
                          ` - ${new Date(season.endDate).toLocaleDateString()}`}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {season.isActive && (
                          <Badge variant="default">Active</Badge>
                        )}
                        {season.isArchived && (
                          <Badge variant="secondary">Archived</Badge>
                        )}
                        {!season.isActive && !season.isArchived && (
                          <Badge variant="outline">Inactive</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!season.isActive && !season.isArchived && (
                            <DropdownMenuItem
                              onClick={() => activateMutation.mutate(season.id)}
                              disabled={activateMutation.isPending}
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Set as Active
                            </DropdownMenuItem>
                          )}
                          {!season.isArchived && !season.isActive && (
                            <DropdownMenuItem
                              onClick={() => archiveMutation.mutate(season.id)}
                              disabled={archiveMutation.isPending}
                            >
                              <Archive className="mr-2 h-4 w-4" />
                              Archive
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(season)}
                            disabled={season.isActive}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Season</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the{" "}
              <strong>
                {seasonToDelete?.seasonYear} {seasonToDelete?.seasonName}
              </strong>{" "}
              season? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
