import { LayoutDashboard, Newspaper, Users, Trophy, Medal, Settings, Building2, Calendar, ShieldCheck } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const { state }            = useSidebar();
  const { isAdmin, isCoach } = useAuth();
  const collapsed            = state === "collapsed";

  const navItems = [
    { title: "Početna",     url: "/app/dashboard",  icon: LayoutDashboard, show: true    },
    { title: "Vijesti",     url: "/app/news",       icon: Newspaper,       show: true    },
    { title: "Savez",       url: "/app/savez",      icon: ShieldCheck,     show: true    },
    { title: "Moj klub",    url: "/app/my-club",    icon: Users,           show: isCoach },
    { title: "Svi klubovi", url: "/app/clubs",      icon: Building2,       show: true    },
    { title: "Turniri",     url: "/app/tournaments", icon: Trophy,         show: true    },
    { title: "Rang lista",  url: "/app/rankings",   icon: Medal,           show: true    },
    { title: "Kalendar",    url: "/app/calendar",   icon: Calendar,        show: true    },
    { title: "Admin",       url: "/app/admin",      icon: Settings,        show: isAdmin },
  ].filter((i) => i.show);

  return (
    <Sidebar collapsible="icon">
      {/* Brand mark */}
      <SidebarHeader className="border-b border-sidebar-border px-3 py-3">
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          <img
            src="/assets/hrvatski_mma_savez_logo.png"
            alt="Hrvatski MMA Savez"
            className="h-9 w-9 shrink-0 object-contain"
          />
          {!collapsed && (
            <div className="leading-tight">
              <p className="font-display text-sm font-black tracking-widest text-sidebar-accent-foreground uppercase">
                Hrvatski MMA
              </p>
              <p className="text-[10px] text-sidebar-foreground/60 uppercase tracking-wider">
                Savez
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="pt-2">
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-sidebar-foreground/35 px-4 pb-1">
              Navigacija
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5 px-2">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="group relative flex items-center gap-3 rounded-lg px-3 py-3 text-base text-sidebar-foreground transition-all duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-bold border-l-accent-glow"
                    >
                      <item.icon className="h-5 w-5 shrink-0 transition-colors duration-150 group-hover:text-primary" />
                      {!collapsed && (
                        <span className="font-display tracking-wide text-[15px] uppercase font-semibold">
                          {item.title}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
