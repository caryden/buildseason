import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, Users, Settings2, ChevronRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/team/$program/$number/settings/")({
  component: SettingsPage,
});

function SettingsPage() {
  const { program, number } = Route.useParams();

  const settingsLinks = [
    {
      title: "Seasons",
      description: "Manage competition seasons and set the active season",
      icon: Calendar,
      href: `/team/${program}/${number}/settings/seasons`,
    },
    {
      title: "Team Info",
      description: "Update team name, number, and program",
      icon: Settings2,
      href: `/team/${program}/${number}/settings/info`,
      disabled: true,
    },
    {
      title: "Members",
      description: "Manage team member roles and permissions",
      icon: Users,
      href: `/team/${program}/${number}/members`,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display">Team Settings</h1>
        <p className="text-muted-foreground">
          Configure your team's settings and preferences
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {settingsLinks.map((link) => (
          <Card
            key={link.title}
            className={
              link.disabled
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-muted/50 transition-colors cursor-pointer"
            }
          >
            {link.disabled ? (
              <div className="p-6">
                <CardHeader className="p-0 pb-2">
                  <div className="flex items-center justify-between">
                    <link.icon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Coming Soon
                    </span>
                  </div>
                  <CardTitle className="text-lg mt-2">{link.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <CardDescription>{link.description}</CardDescription>
                </CardContent>
              </div>
            ) : (
              <Link to={link.href}>
                <div className="p-6">
                  <CardHeader className="p-0 pb-2">
                    <div className="flex items-center justify-between">
                      <link.icon className="h-5 w-5 text-muted-foreground" />
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-lg mt-2">{link.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <CardDescription>{link.description}</CardDescription>
                  </CardContent>
                </div>
              </Link>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
