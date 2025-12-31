import { createFileRoute } from "@tanstack/react-router";
import { Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/team/$program/$number/calendar/")({
  component: CalendarPage,
});

function CalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display">Calendar</h1>
        <p className="text-muted-foreground">
          Unified timeline of events, deadlines, and deliveries
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
          <p className="text-muted-foreground text-center max-w-md">
            The team calendar will show competitions, outreach events, build
            sessions, deadlines, and order deliveries all in one place.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
