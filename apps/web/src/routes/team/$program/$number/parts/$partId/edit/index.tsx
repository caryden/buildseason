import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute(
  "/team/$program/$number/parts/$partId/edit/"
)({
  component: EditPartPage,
});

type Vendor = {
  id: string;
  name: string;
};

type Part = {
  id: string;
  name: string;
  sku: string | null;
  vendorId: string | null;
  description: string | null;
  quantity: number;
  reorderPoint: number | null;
  location: string | null;
  unitPriceCents: number | null;
};

function EditPartPage() {
  const { program, number, partId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    vendorId: "",
    description: "",
    quantity: "0",
    reorderPoint: "0",
    location: "",
    unitPrice: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get team info from teams list
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

  // Fetch part data
  const { data: part, isLoading: partLoading } = useQuery({
    queryKey: queryKeys.parts.detail(teamId || "", partId),
    queryFn: async () => {
      const res = await fetch(`/api/teams/${teamId}/parts/${partId}`);
      if (!res.ok) throw new Error("Failed to fetch part");
      return res.json() as Promise<Part>;
    },
    enabled: !!teamId,
  });

  // Populate form when part data loads
  useEffect(() => {
    if (part) {
      setFormData({
        name: part.name,
        sku: part.sku || "",
        vendorId: part.vendorId || "",
        description: part.description || "",
        quantity: part.quantity.toString(),
        reorderPoint: part.reorderPoint?.toString() || "0",
        location: part.location || "",
        unitPrice: part.unitPriceCents
          ? (part.unitPriceCents / 100).toFixed(2)
          : "",
      });
    }
  }, [part]);

  // Fetch vendors for dropdown
  const { data: vendors } = useQuery({
    queryKey: queryKeys.vendors.forTeam(teamId || ""),
    queryFn: async () => {
      const res = await fetch(`/api/teams/${teamId}/vendors`);
      if (!res.ok) throw new Error("Failed to fetch vendors");
      return res.json() as Promise<Vendor[]>;
    },
    enabled: !!teamId,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch(`/api/teams/${teamId}/parts/${partId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          sku: data.sku || null,
          vendorId: data.vendorId || null,
          description: data.description || null,
          quantity: parseInt(data.quantity) || 0,
          reorderPoint: parseInt(data.reorderPoint) || 0,
          location: data.location || null,
          unitPrice: parseFloat(data.unitPrice) || 0,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update part");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Part updated");
      queryClient.invalidateQueries({
        queryKey: queryKeys.parts.detail(teamId || "", partId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.parts.list(teamId || ""),
      });
      navigate({
        to: "/team/$program/$number/parts/$partId",
        params: { program, number, partId },
      });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Part name is required";
    }

    if (formData.quantity && parseInt(formData.quantity) < 0) {
      newErrors.quantity = "Quantity cannot be negative";
    }

    if (formData.reorderPoint && parseInt(formData.reorderPoint) < 0) {
      newErrors.reorderPoint = "Reorder point cannot be negative";
    }

    if (formData.unitPrice && parseFloat(formData.unitPrice) < 0) {
      newErrors.unitPrice = "Price cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      updateMutation.mutate(formData);
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

  if (partLoading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!part) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Part not found</h2>
        <Button asChild variant="outline">
          <Link to="/team/$program/$number/parts" params={{ program, number }}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Parts
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Back Link */}
      <Link
        to="/team/$program/$number/parts/$partId"
        params={{ program, number, partId }}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to Part
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Edit Part</CardTitle>
          <CardDescription>Update part information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Part Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., goBILDA 5202 Motor"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* SKU and Vendor */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU / Part Number</Label>
                <Input
                  id="sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="e.g., 5202-0002-0027"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendorId">Vendor</Label>
                <Select
                  value={formData.vendorId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, vendorId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor..." />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors?.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Optional notes about this part..."
                rows={3}
              />
            </div>

            {/* Quantity and Reorder Point */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={handleChange}
                  className={errors.quantity ? "border-red-500" : ""}
                />
                {errors.quantity && (
                  <p className="text-sm text-red-500">{errors.quantity}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="reorderPoint">Reorder Point</Label>
                <Input
                  id="reorderPoint"
                  name="reorderPoint"
                  type="number"
                  min="0"
                  value={formData.reorderPoint}
                  onChange={handleChange}
                  className={errors.reorderPoint ? "border-red-500" : ""}
                />
                <p className="text-xs text-muted-foreground">
                  Alert when quantity drops to this level
                </p>
                {errors.reorderPoint && (
                  <p className="text-sm text-red-500">{errors.reorderPoint}</p>
                )}
              </div>
            </div>

            {/* Location and Price */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Storage Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Bin A3"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unitPrice">Unit Price ($)</Label>
                <Input
                  id="unitPrice"
                  name="unitPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={handleChange}
                  placeholder="0.00"
                  className={errors.unitPrice ? "border-red-500" : ""}
                />
                {errors.unitPrice && (
                  <p className="text-sm text-red-500">{errors.unitPrice}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex-1"
              >
                {updateMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link
                  to="/team/$program/$number/parts/$partId"
                  params={{ program, number, partId }}
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
