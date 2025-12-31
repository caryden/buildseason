import { createFileRoute } from "@tanstack/react-router";
import { DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/team/$program/$number/finance/")({
  component: FinancePage,
});

function FinancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display">Finance</h1>
        <p className="text-muted-foreground">
          Budget tracking, expenses, and grant compliance
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Track your team budget, manage expenses with receipt capture, and
            ensure grant compliance for restricted funds.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
