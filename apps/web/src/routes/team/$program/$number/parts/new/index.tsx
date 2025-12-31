import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
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
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/team/$program/$number/parts/new/")({
  component: NewPartPage,
});

type Vendor = {
  id: string;
  name: string;
};

function NewPartPage() {
  const { program, number } = Route.useParams();
  const navigate = useNavigate();

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

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch(`/api/teams/${teamId}/parts`, {
        method: "POST",
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
        throw new Error(error.error || "Failed to create part");
      }
      return res.json() as Promise<{ id: string; name: string }>;
    },
    onSuccess: (data) => {
      toast.success(`Part "${data.name}" created`);
      navigate({
        to: "/team/$program/$number/parts/$partId",
        params: { program, number, partId: data.id },
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
        to="/team/$program/$number/parts"
        params={{ program, number }}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to Parts
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Add New Part</CardTitle>
          <CardDescription>
            Add a new part to your team's inventory
          </CardDescription>
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
                disabled={createMutation.isPending}
                className="flex-1"
              >
                {createMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Part
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link
                  to="/team/$program/$number/parts"
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
