import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Loader2,
  Check,
  ChevronsUpDown,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute(
  "/team/$program/$number/robots/$robotId/bom/new/"
)({
  component: NewBomItemPage,
});

type Part = {
  id: string;
  name: string;
  sku: string | null;
  quantity: number;
  vendor: { id: string; name: string } | null;
};

type Robot = {
  id: string;
  name: string;
};

const subsystemOptions = [
  {
    value: "drivetrain",
    label: "Drivetrain",
    color: "bg-blue-100 text-blue-700",
  },
  { value: "intake", label: "Intake", color: "bg-green-100 text-green-700" },
  { value: "lift", label: "Lift", color: "bg-purple-100 text-purple-700" },
  {
    value: "scoring",
    label: "Scoring",
    color: "bg-orange-100 text-orange-700",
  },
  {
    value: "electronics",
    label: "Electronics",
    color: "bg-yellow-100 text-yellow-700",
  },
  { value: "hardware", label: "Hardware", color: "bg-gray-100 text-gray-700" },
  { value: "other", label: "Other", color: "bg-slate-100 text-slate-700" },
];

function NewBomItemPage() {
  const { program, number, robotId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    partId: "",
    subsystem: "",
    quantityNeeded: 1,
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [partSearchOpen, setPartSearchOpen] = useState(false);
  const [partSearch, setPartSearch] = useState("");

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

  // Fetch robot data
  const { data: robot, isLoading: robotLoading } = useQuery({
    queryKey: ["teams", teamId, "robots", robotId],
    queryFn: async () => {
      const res = await fetch(`/api/teams/${teamId}/robots/${robotId}`);
      if (!res.ok) throw new Error("Failed to fetch robot");
      return res.json() as Promise<Robot>;
    },
    enabled: !!teamId,
  });

  // Fetch team parts for selector
  const { data: parts } = useQuery({
    queryKey: queryKeys.parts.list(teamId || ""),
    queryFn: async () => {
      const res = await fetch(`/api/teams/${teamId}/parts`);
      if (!res.ok) throw new Error("Failed to fetch parts");
      return res.json() as Promise<Part[]>;
    },
    enabled: !!teamId,
  });

  // Filter parts based on search
  const filteredParts = useMemo(() => {
    if (!parts) return [];
    if (!partSearch) return parts;
    const search = partSearch.toLowerCase();
    return parts.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        (p.sku && p.sku.toLowerCase().includes(search))
    );
  }, [parts, partSearch]);

  // Selected part details
  const selectedPart = parts?.find((p) => p.id === formData.partId);

  // Check if requesting more than available
  const insufficientStock =
    selectedPart && formData.quantityNeeded > selectedPart.quantity;

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch(`/api/teams/${teamId}/robots/${robotId}/bom`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partId: data.partId,
          subsystem: data.subsystem || null,
          quantityNeeded: data.quantityNeeded,
          notes: data.notes || null,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to add to BOM");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Part added to BOM");
      queryClient.invalidateQueries({
        queryKey: ["teams", teamId, "robots", robotId, "bom"],
      });
      navigate({
        to: "/team/$program/$number/robots/$robotId/bom",
        params: { program, number, robotId },
      });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.partId) {
      newErrors.partId = "Please select a part";
    }

    if (formData.quantityNeeded < 1) {
      newErrors.quantityNeeded = "Quantity must be at least 1";
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

  if (robotLoading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Back Link */}
      <Link
        to="/team/$program/$number/robots/$robotId/bom"
        params={{ program, number, robotId }}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to {robot?.name || "Robot"} BOM
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Add to BOM</CardTitle>
          <CardDescription>
            Add a part to {robot?.name || "this robot"}'s bill of materials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Part Selector */}
            <div className="space-y-2">
              <Label>
                Part <span className="text-red-500">*</span>
              </Label>
              <Popover open={partSearchOpen} onOpenChange={setPartSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={partSearchOpen}
                    className={cn(
                      "w-full justify-between",
                      errors.partId && "border-red-500"
                    )}
                  >
                    {selectedPart ? selectedPart.name : "Select a part..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Search parts..."
                      value={partSearch}
                      onValueChange={setPartSearch}
                    />
                    <CommandList>
                      <CommandEmpty>No parts found.</CommandEmpty>
                      <CommandGroup>
                        {filteredParts.map((part) => (
                          <CommandItem
                            key={part.id}
                            value={part.id}
                            onSelect={() => {
                              setFormData((prev) => ({
                                ...prev,
                                partId: part.id,
                              }));
                              setPartSearchOpen(false);
                              setPartSearch("");
                              if (errors.partId) {
                                setErrors((prev) => ({ ...prev, partId: "" }));
                              }
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.partId === part.id
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            <div className="flex-1">
                              <p className="font-medium">{part.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {part.sku || "No SKU"} • Stock: {part.quantity}
                                {part.vendor && ` • ${part.vendor.name}`}
                              </p>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {errors.partId && (
                <p className="text-sm text-red-500">{errors.partId}</p>
              )}

              {/* Selected Part Details */}
              {selectedPart && (
                <Card className="mt-2 bg-muted/50">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Current Stock</p>
                        <p className="font-medium">{selectedPart.quantity}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">SKU</p>
                        <p className="font-medium">{selectedPart.sku || "-"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Vendor</p>
                        <p className="font-medium">
                          {selectedPart.vendor?.name || "-"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Subsystem */}
            <div className="space-y-2">
              <Label htmlFor="subsystem">Subsystem</Label>
              <Select
                value={formData.subsystem}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, subsystem: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subsystem (optional)..." />
                </SelectTrigger>
                <SelectContent>
                  {subsystemOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn("text-xs", option.color)}
                        >
                          {option.label}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity Needed */}
            <div className="space-y-2">
              <Label htmlFor="quantityNeeded">
                Quantity Needed <span className="text-red-500">*</span>
              </Label>
              <Input
                id="quantityNeeded"
                type="number"
                min={1}
                value={formData.quantityNeeded}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    quantityNeeded: parseInt(e.target.value) || 0,
                  }))
                }
                className={errors.quantityNeeded ? "border-red-500" : ""}
              />
              {errors.quantityNeeded && (
                <p className="text-sm text-red-500">{errors.quantityNeeded}</p>
              )}

              {/* Insufficient Stock Warning */}
              {insufficientStock && (
                <div className="flex items-center gap-2 p-3 rounded-md bg-yellow-500/10 border border-yellow-500/50">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <p className="text-sm text-yellow-600">
                    Requesting more than available in inventory (
                    {selectedPart?.quantity} in stock). You may need to order
                    more.
                  </p>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Optional notes about this BOM item..."
                rows={3}
              />
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
                Add to BOM
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link
                  to="/team/$program/$number/robots/$robotId/bom"
                  params={{ program, number, robotId }}
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
