import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { queryKeys } from "@/lib/query-keys";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge, type RobotStatus } from "@/components/ui/status-badge";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/team/$program/$number/robots/new/")({
  component: NewRobotPage,
});

type Season = {
  id: string;
  name: string;
  year: number;
  isCurrent: boolean;
};

const statusOptions: {
  value: RobotStatus;
  label: string;
  description: string;
}[] = [
  {
    value: "planning",
    label: "Planning",
    description: "Robot is in the design and planning phase",
  },
  {
    value: "building",
    label: "Building",
    description: "Robot is actively being built",
  },
  {
    value: "competition_ready",
    label: "Competition Ready",
    description: "Robot is complete and ready for competition",
  },
];

function NewRobotPage() {
  const { program, number } = Route.useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "planning" as RobotStatus,
    seasonId: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get team info
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

  // Fetch seasons
  const { data: seasons } = useQuery({
    queryKey: ["teams", teamId, "seasons"],
    queryFn: async () => {
      const res = await fetch(`/api/teams/${teamId}/seasons`);
      if (!res.ok) throw new Error("Failed to fetch seasons");
      return res.json() as Promise<Season[]>;
    },
    enabled: !!teamId,
  });

  // Default to current season when seasons load
  useEffect(() => {
    if (seasons && !formData.seasonId) {
      const currentSeason = seasons.find((s) => s.isCurrent);
      if (currentSeason) {
        setFormData((prev) => ({ ...prev, seasonId: currentSeason.id }));
      }
    }
  }, [seasons, formData.seasonId]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch(`/api/teams/${teamId}/robots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          description: data.description || null,
          status: data.status,
          seasonId: data.seasonId,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create robot");
      }
      return res.json() as Promise<{ id: string; name: string }>;
    },
    onSuccess: (data) => {
      toast.success(`Robot "${data.name}" created`);
      navigate({
        to: "/team/$program/$number/robots",
        params: { program, number },
      });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Robot name is required";
    }

    if (!formData.seasonId) {
      newErrors.seasonId = "Please select a season";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      createMutation.mutate(formData);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Back Link */}
      <Link
        to="/team/$program/$number/robots"
        params={{ program, number }}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to Robots
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Create New Robot</CardTitle>
          <CardDescription>
            Add a new robot to your team's season
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Season */}
            <div className="space-y-2">
              <Label htmlFor="seasonId">
                Season <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.seasonId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, seasonId: value }))
                }
              >
                <SelectTrigger
                  className={errors.seasonId ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select season..." />
                </SelectTrigger>
                <SelectContent>
                  {seasons?.map((season) => (
                    <SelectItem key={season.id} value={season.id}>
                      {season.name} ({season.year})
                      {season.isCurrent && " - Current"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.seasonId && (
                <p className="text-sm text-red-500">{errors.seasonId}</p>
              )}
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Robot Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Cheddar, V1, Competition Bot"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Optional notes about this robot..."
                rows={3}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="grid gap-3">
                {statusOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.status === option.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={option.value}
                      checked={formData.status === option.value}
                      onChange={() =>
                        setFormData((prev) => ({
                          ...prev,
                          status: option.value,
                        }))
                      }
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{option.label}</span>
                        <StatusBadge status={option.value} />
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {option.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="flex-1"
              >
                {createMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Robot
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link
                  to="/team/$program/$number/robots"
                  params={{ program, number }}
                >
                  Cancel
                </Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
