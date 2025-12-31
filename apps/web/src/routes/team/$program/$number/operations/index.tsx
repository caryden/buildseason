import { createFileRoute } from "@tanstack/react-router";
import { Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/team/$program/$number/operations/")({
  component: OperationsPage,
});

function OperationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display">Operations</h1>
        <p className="text-muted-foreground">
          Competitions, travel, documents, and logistics
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Manage competitions, plan travel logistics, track permission forms,
            and organize non-parts orders like apparel and supplies.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
