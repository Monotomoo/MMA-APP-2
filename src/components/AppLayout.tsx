import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DevToolbar } from "@/components/DevToolbar";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  coach: "Trener",
  fighter: "Borac",
};

const ROLE_COLOR: Record<string, string> = {
  admin:   "text-yellow-400 border-yellow-500/40 bg-yellow-500/10",
  coach:   "text-blue-400  border-blue-500/40  bg-blue-500/10",
  fighter: "text-primary   border-primary/40   bg-primary/10",
};

const AppLayout = () => {
  const { profile, signOut } = useAuth();
  const roleClass = ROLE_COLOR[profile?.role ?? "fighter"];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center justify-between border-b border-border/60 bg-background/95 backdrop-blur px-4 gap-3 sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <span className="font-display text-base font-bold tracking-widest uppercase text-gradient-primary hidden sm:block">
                Hrvatski MMA Savez
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* User chip */}
              {profile && (
                <div className="hidden sm:flex items-center gap-2 rounded-lg border border-border/50 bg-secondary/60 px-3 py-1.5">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/20 border border-primary/30">
                    <User className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-xs font-semibold text-foreground/90 tracking-wide">
                    {profile.full_name}
                  </span>
                  <span className={`text-[10px] font-display font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border ${roleClass}`}>
                    {ROLE_LABEL[profile.role] ?? profile.role}
                  </span>
                </div>
              )}

              {/* Logout button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="h-8 w-8 p-0 sm:h-auto sm:w-auto sm:px-3 sm:gap-2 rounded-lg border border-transparent hover:border-primary/30 hover:text-primary hover:bg-primary/10 cursor-pointer transition-all duration-150"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline text-xs font-semibold tracking-wide">Odjava</span>
              </Button>
            </div>
          </header>
          <main className="flex-1 px-10 py-6 pb-16">
            <Outlet />
          </main>
        </div>
      </div>
      <DevToolbar />
    </SidebarProvider>
  );
};

export default AppLayout;
