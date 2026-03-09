import { useState } from "react";
import {
  TOURNAMENTS, Tournament,
  createTournament as createData,
  updateTournament as updateData,
  deleteTournament as deleteData,
} from "@/lib/demo-data";

export function useTournaments() {
  const [local, setLocal] = useState<Tournament[]>(() => [...TOURNAMENTS]);

  const upcoming  = local.filter((t) => t.status === "upcoming");
  const active    = local.filter((t) => t.status === "active");
  const completed = local.filter((t) => t.status === "completed");

  function createTournament(data: Omit<Tournament, "id" | "created_at">) {
    const t = createData(data);
    setLocal((prev) => [...prev, t]);
  }

  function updateTournament(id: string, updates: Partial<Omit<Tournament, "id" | "created_at">>) {
    updateData(id, updates);
    setLocal((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  }

  function deleteTournament(id: string) {
    deleteData(id);
    setLocal((prev) => prev.filter((t) => t.id !== id));
  }

  return { tournaments: local, upcoming, active, completed, createTournament, updateTournament, deleteTournament };
}
