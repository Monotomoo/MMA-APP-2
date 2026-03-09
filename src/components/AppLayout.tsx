import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DevToolbar } from "@/components/DevToolbar";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const AppLayout = () => {
  const { profile, signOut } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center justify-between border-b px-4 gap-3">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <span className="font-display text-lg font-bold tracking-wider">Hrvatski MMA Savez</span>
            </div>
            <div className="flex items-center gap-3">
              {profile && (
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {profile.full_name}
                </span>
              )}
              <Button variant="ghost" size="sm" onClick={signOut} className="gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Odjava</span>
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
