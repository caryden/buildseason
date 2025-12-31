import { createFileRoute } from "@tanstack/react-router";
import { Store } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/team/$program/$number/vendors/")({
  component: VendorsPage,
});

function VendorsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display">Vendors</h1>
        <p className="text-muted-foreground">
          Parts suppliers and vendor information
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Store className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Browse robotics parts vendors, compare prices, and track stock
            availability for the parts your team needs.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
