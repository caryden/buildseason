import { createFileRoute } from "@tanstack/react-router";
import { Handshake } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/team/$program/$number/sponsors/")({
  component: SponsorsPage,
});

function SponsorsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display">Sponsors</h1>
        <p className="text-muted-foreground">
          Relationship nurturing, deliverables, and impact reporting
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Handshake className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Manage sponsor relationships, track deliverables, and share team
            achievements. Keep sponsors engaged with proactive updates.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
