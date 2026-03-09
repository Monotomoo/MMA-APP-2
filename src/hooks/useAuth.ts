import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Role } from "@/lib/demo-data";

type Profile = Tables<"profiles">;

const DEV_BYPASS_KEY = "dev_bypass_admin";
const DEV_ROLE_KEY   = "dev_role";

const DEV_PROFILES: Record<Role, Profile> = {
  admin:   { id: "1", full_name: "Tomo (Admin)",  role: "admin",   avatar_url: null, created_at: "" },
  coach:   { id: "2", full_name: "Dejan Gunjavić", role: "coach",   avatar_url: null, created_at: "" },
  fighter: { id: "3", full_name: "Ivan Horvat",   role: "fighter", avatar_url: null, created_at: "" },
};

export function useAuth() {
  const [session,      setSession]      = useState<Session | null>(null);
  const [profile,      setProfile]      = useState<Profile | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [devRole,      setDevRoleState] = useState<Role>(
    () => (localStorage.getItem(DEV_ROLE_KEY) as Role) ?? "admin",
  );

  const isDevMode = !!localStorage.getItem(DEV_BYPASS_KEY);

  useEffect(() => {
    if (isDevMode) {
      setProfile(DEV_PROFILES[devRole]);
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else { setProfile(null); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, [devRole]); // re-runs when dev role switches

  async function fetchProfile(userId: string) {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    setProfile(data);
    setLoading(false);
  }

  async function signOut() {
    localStorage.removeItem(DEV_BYPASS_KEY);
    localStorage.removeItem(DEV_ROLE_KEY);
    await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
  }

  function setDevRole(role: Role) {
    localStorage.setItem(DEV_ROLE_KEY, role);
    setDevRoleState(role);
  }

  return {
    session,
    profile,
    role:      profile?.role ?? null,
    isAdmin:   profile?.role === "admin",
    isCoach:   profile?.role === "coach" || profile?.role === "admin",
    loading,
    isDevMode,
    signOut,
    setDevRole,
  };
}
