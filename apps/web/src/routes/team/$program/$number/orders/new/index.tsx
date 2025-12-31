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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/team/$program/$number/orders/new/")({
  component: NewOrderPage,
});

type Vendor = {
  id: string;
  name: string;
};

type Part = {
  id: string;
  name: string;
  sku: string | null;
  unitPriceCents: number | null;
};

type LineItem = {
  id: string;
  partId: string;
  quantity: number;
  unitPriceCents: number;
};

function NewOrderPage() {
  const { program, number } = Route.useParams();
  const navigate = useNavigate();

  const [vendorId, setVendorId] = useState("");
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: crypto.randomUUID(), partId: "", quantity: 1, unitPriceCents: 0 },
  ]);

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

  // Fetch vendors
  const { data: vendors } = useQuery({
    queryKey: queryKeys.vendors.forTeam(teamId || ""),
    queryFn: async () => {
      const res = await fetch(`/api/teams/${teamId}/vendors`);
      if (!res.ok) throw new Error("Failed to fetch vendors");
      return res.json() as Promise<Vendor[]>;
    },
    enabled: !!teamId,
  });

  // Fetch parts
  const { data: parts } = useQuery({
    queryKey: queryKeys.parts.list(teamId || ""),
    queryFn: async () => {
      const res = await fetch(`/api/teams/${teamId}/parts`);
      if (!res.ok) throw new Error("Failed to fetch parts");
      return res.json() as Promise<Part[]>;
    },
    enabled: !!teamId,
  });

  // Create order mutation
  const createMutation = useMutation({
    mutationFn: async (asDraft: boolean) => {
      const res = await fetch(`/api/teams/${teamId}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId: vendorId || null,
          notes: notes || null,
          items: lineItems
            .filter((item) => item.partId)
            .map((item) => ({
              partId: item.partId,
              quantity: item.quantity,
              unitPriceCents: item.unitPriceCents,
            })),
          submitForApproval: !asDraft,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create order");
      }
      return res.json() as Promise<{ id: string }>;
    },
    onSuccess: (data, asDraft) => {
      toast.success(
        asDraft ? "Order saved as draft" : "Order submitted for approval"
      );
      navigate({
        to: "/team/$program/$number/orders/$orderId",
        params: { program, number, orderId: data.id },
      });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { id: crypto.randomUUID(), partId: "", quantity: 1, unitPriceCents: 0 },
    ]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((item) => item.id !== id));
    }
  };

  const updateLineItem = (id: string, updates: Partial<LineItem>) => {
    setLineItems(
      lineItems.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handlePartChange = (lineItemId: string, partId: string) => {
    const part = parts?.find((p) => p.id === partId);
    updateLineItem(lineItemId, {
      partId,
      unitPriceCents: part?.unitPriceCents || 0,
    });
  };

  const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const orderTotal = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPriceCents,
    0
  );

  const hasValidItems = lineItems.some(
    (item) => item.partId && item.quantity > 0
  );

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back Link */}
      <Link
        to="/team/$program/$number/orders"
        params={{ program, number }}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to Orders
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Create New Order</CardTitle>
          <CardDescription>
            Add parts to your order and submit for approval
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Vendor Selection */}
          <div className="space-y-2">
            <Label htmlFor="vendor">Vendor</Label>
            <Select value={vendorId} onValueChange={setVendorId}>
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

          {/* Line Items */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Line Items</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addLineItem}
              >
                <Plus className="mr-1 h-4 w-4" />
                Add Item
              </Button>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Part</TableHead>
                    <TableHead className="w-[15%]">Qty</TableHead>
                    <TableHead className="w-[20%]">Unit Price</TableHead>
                    <TableHead className="w-[15%] text-right">Total</TableHead>
                    <TableHead className="w-[10%]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Select
                          value={item.partId}
                          onValueChange={(value) =>
                            handlePartChange(item.id, value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select part..." />
                          </SelectTrigger>
                          <SelectContent>
                            {parts?.map((part) => (
                              <SelectItem key={part.id} value={part.id}>
                                {part.name}
                                {part.sku && (
                                  <span className="text-muted-foreground ml-2">
                                    ({part.sku})
                                  </span>
                                )}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateLineItem(item.id, {
                              quantity: parseInt(e.target.value) || 1,
                            })
                          }
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={(item.unitPriceCents / 100).toFixed(2)}
                          onChange={(e) =>
                            updateLineItem(item.id, {
                              unitPriceCents:
                                Math.round(parseFloat(e.target.value) * 100) ||
                                0,
                            })
                          }
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.quantity * item.unitPriceCents)}
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeLineItem(item.id)}
                          disabled={lineItems.length === 1}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-semibold">
                      Order Total
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(orderTotal)}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </Card>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes or special instructions..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button
              onClick={() => createMutation.mutate(false)}
              disabled={!hasValidItems || createMutation.isPending}
              className="flex-1"
            >
              {createMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Submit for Approval
            </Button>
            <Button
              variant="outline"
              onClick={() => createMutation.mutate(true)}
              disabled={!hasValidItems || createMutation.isPending}
            >
              Save as Draft
            </Button>
            <Button variant="outline" asChild>
              <Link
                to="/team/$program/$number/orders"
                params={{ program, number }}
              >
                Cancel
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
