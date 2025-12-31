import { createFileRoute } from "@tanstack/react-router";
import { Printer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/team/$program/$number/fabrication/")({
  component: FabricationPage,
});

function FabricationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display">Fabrication</h1>
        <p className="text-muted-foreground">
          3D print queue, laser cutting, and custom parts
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Printer className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Manage your fabrication queue including 3D prints, laser cutting
            jobs, and custom manufactured parts.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
