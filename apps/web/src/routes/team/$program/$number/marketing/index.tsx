import { createFileRoute } from "@tanstack/react-router";
import { Megaphone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/team/$program/$number/marketing/")({
  component: MarketingPage,
});

function MarketingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display">Marketing</h1>
        <p className="text-muted-foreground">
          Branding, social media, and pit materials
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Manage your team brand identity, track social media presence, and
            organize pit materials like banners and giveaways.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
