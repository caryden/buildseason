import { createFileRoute } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/team/$program/$number/outreach/")({
  component: OutreachPage,
});

function OutreachPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display">Outreach</h1>
        <p className="text-muted-foreground">
          Community engagement, volunteer hours, and impact tracking
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Heart className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Track outreach events, log volunteer hours, and measure your
            community impact. Essential for grants and awards submissions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
