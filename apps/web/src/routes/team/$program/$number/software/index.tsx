import { createFileRoute } from "@tanstack/react-router";
import { Code } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/team/$program/$number/software/")({
  component: SoftwarePage,
});

function SoftwarePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display">Software</h1>
        <p className="text-muted-foreground">
          GitHub integration, code progress, and pull requests
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Code className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Track your robot code development with GitHub integration. View PRs,
            commits, and code progress all in one place.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
