import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  Calendar,
  Package,
  Bot,
  Code,
  Printer,
  ShoppingCart,
  Store,
  Users,
  Settings,
  ChevronUp,
  LogOut,
  Heart,
  Handshake,
  Megaphone,
  Trophy,
  DollarSign,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// OVERVIEW section - Team health at a glance
const overviewNavItems = [
  { title: "Dashboard", icon: Home, path: "" },
  { title: "Calendar", icon: Calendar, path: "/calendar" },
  { title: "Members", icon: Users, path: "/members" },
];

// BUILD section - Technical work (robot building)
const buildNavItems = [
  { title: "Robots", icon: Bot, path: "/robots" },
  { title: "Parts", icon: Package, path: "/parts" },
  { title: "Orders", icon: ShoppingCart, path: "/orders" },
  { title: "Software", icon: Code, path: "/software" },
  { title: "Fabrication", icon: Printer, path: "/fabrication" },
  { title: "Vendors", icon: Store, path: "/vendors" },
];

// OUTREACH section - Community engagement
const outreachNavItems = [
  { title: "Outreach", icon: Heart, path: "/outreach" },
];

// SPONSORSHIPS section - Funding relationships
const sponsorshipsNavItems = [
  { title: "Sponsors", icon: Handshake, path: "/sponsors" },
];

// MARKETING section - Team identity (configurable)
const marketingNavItems = [
  { title: "Marketing", icon: Megaphone, path: "/marketing" },
];

// OPERATIONS section - Team logistics
const operationsNavItems = [
  { title: "Operations", icon: Trophy, path: "/operations" },
];

// FINANCE section - Money management
const financeNavItems = [
  { title: "Finance", icon: DollarSign, path: "/finance" },
];

// SETTINGS section - Configuration
const settingsNavItems = [
  { title: "Settings", icon: Settings, path: "/settings" },
];

interface AppSidebarProps {
  user?: {
    name: string | null;
    email: string;
    image: string | null;
  };
  program?: string;
  teamNumber?: string;
}

export function AppSidebar({ user, program, teamNumber }: AppSidebarProps) {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  // Build team path using program/number format (no UUIDs)
  const getTeamPath = (path: string) => {
    if (!program || !teamNumber) return "/dashboard";
    return `/team/${program}/${teamNumber}${path}`;
  };

  const isActive = (path: string) => {
    const fullPath = getTeamPath(path);
    if (path === "") {
      // Dashboard - exact match for team root
      return (
        currentPath === `/team/${program}/${teamNumber}` ||
        currentPath === `/team/${program}/${teamNumber}/`
      );
    }
    return currentPath.startsWith(fullPath);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <span className="font-bold text-sm">BS</span>
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">BuildSeason</span>
                  <span className="text-xs text-muted-foreground">
                    Team Hub
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* OVERVIEW Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Overview
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {overviewNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.path)}
                    tooltip={item.title}
                  >
                    <Link to={getTeamPath(item.path)}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* BUILD Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Build
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {buildNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.path)}
                    tooltip={item.title}
                  >
                    <Link to={getTeamPath(item.path)}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* OUTREACH Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Outreach
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {outreachNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.path)}
                    tooltip={item.title}
                  >
                    <Link to={getTeamPath(item.path)}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* SPONSORSHIPS Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Sponsorships
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sponsorshipsNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.path)}
                    tooltip={item.title}
                  >
                    <Link to={getTeamPath(item.path)}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* MARKETING Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Marketing
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {marketingNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.path)}
                    tooltip={item.title}
                  >
                    <Link to={getTeamPath(item.path)}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* OPERATIONS Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Operations
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {operationsNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.path)}
                    tooltip={item.title}
                  >
                    <Link to={getTeamPath(item.path)}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* FINANCE Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Finance
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {financeNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.path)}
                    tooltip={item.title}
                  >
                    <Link to={getTeamPath(item.path)}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* SETTINGS Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Settings
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.path)}
                    tooltip={item.title}
                  >
                    <Link to={getTeamPath(item.path)}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={user?.image || undefined}
                      alt={user?.name || "User"}
                    />
                    <AvatarFallback className="rounded-lg">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {user?.name || "User"}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.email || ""}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="top"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem asChild>
                  <Link to="/dashboard">
                    <Home className="mr-2 h-4 w-4" />
                    Switch Team
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    await fetch("/api/auth/sign-out", {
                      method: "POST",
                      credentials: "include",
                    });
                    window.location.href = "/login";
                  }}
                  className="cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
