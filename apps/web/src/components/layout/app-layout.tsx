import { ReactNode } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { AppHeader } from "./app-header";
import type { Team } from "@/components/team-switcher";

interface AppLayoutProps {
  children: ReactNode;
  user?: {
    name: string | null;
    email: string;
    image: string | null;
  };
  teamName?: string;
  currentTeamId?: string;
  currentProgram?: string;
  currentTeamNumber?: string;
  teams?: Team[];
}

export function AppLayout({
  children,
  user,
  teamName,
  currentTeamId,
  currentProgram,
  currentTeamNumber,
  teams,
}: AppLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar
        user={user}
        program={currentProgram}
        teamNumber={currentTeamNumber}
      />
      <SidebarInset>
        <AppHeader
          teamName={teamName}
          currentTeamId={currentTeamId}
          teams={teams}
        />
        <main className="flex-1 overflow-auto p-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
