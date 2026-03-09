import { Newspaper, Users, Trophy, Settings, Building2, Calendar } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
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
    { title: "Početna",    url: "/app/dashboard",  icon: Newspaper,  show: true    },
    { title: "Moj klub",  url: "/app/my-club",     icon: Users,      show: isCoach },
    { title: "Svi klubovi", url: "/app/clubs",    icon: Building2,  show: true    },
    { title: "Turniri",   url: "/app/tournaments", icon: Trophy,     show: true    },
    { title: "Kalendar",  url: "/app/calendar",    icon: Calendar,   show: true    },
    { title: "Admin",     url: "/app/admin",       icon: Settings,   show: isAdmin },
  ].filter((i) => i.show);

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigacija</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold"
                    >
                      <item.icon className="mr-2 h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
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
