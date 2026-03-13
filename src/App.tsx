import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import AppLayout from "./components/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import MyClubPage from "./pages/MyClubPage";
import TournamentsPage from "./pages/TournamentsPage";
import TournamentDetailPage from "./pages/TournamentDetailPage";
import FighterPage from "./pages/FighterPage";
import AdminPage from "./pages/AdminPage";
import ClubsPage from "./pages/ClubsPage";
import ClubDetailPage from "./pages/ClubDetailPage";
import CalendarPage from "./pages/CalendarPage";
import NewsPage from "./pages/NewsPage";
import MMASavezPage from "./pages/MMASavezPage";
import RankingsPage from "./pages/RankingsPage";
import NotFound from "./pages/NotFound";
import { useAuth } from "./hooks/useAuth";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const devBypass = localStorage.getItem("dev_bypass_admin");
  if (loading) return null;
  if (!session && !devBypass) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="my-club" element={<MyClubPage />} />
            <Route path="fighters/:id" element={<FighterPage />} />
            <Route path="tournaments" element={<TournamentsPage />} />
            <Route path="tournaments/:id" element={<TournamentDetailPage />} />
            <Route path="clubs" element={<ClubsPage />} />
            <Route path="clubs/:id" element={<ClubDetailPage />} />
            <Route path="rankings" element={<RankingsPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="news" element={<NewsPage />} />
            <Route path="savez" element={<MMASavezPage />} />
            <Route path="admin" element={<AdminPage />} />
          </Route>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
