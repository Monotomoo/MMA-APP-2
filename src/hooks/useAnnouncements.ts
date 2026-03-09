import { useState } from "react";
import {
  ANNOUNCEMENTS, PROFILES, Announcement,
  createAnnouncement as createData,
  updateAnnouncementStatus as updateStatusData,
} from "@/lib/demo-data";

export function useAnnouncements() {
  const [local, setLocal] = useState<Announcement[]>(() => [...ANNOUNCEMENTS]);

  const announcements = local
    .filter((a) => a.status === "approved")
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((a) => ({
      ...a,
      author_name: PROFILES.find((p) => p.id === a.author_id)?.full_name ?? "Unknown",
    }));

  const pending = local
    .filter((a) => a.status === "pending")
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((a) => ({
      ...a,
      author_name: PROFILES.find((p) => p.id === a.author_id)?.full_name ?? "Unknown",
    }));

  function create(data: { title: string; body: string; author_id: string; club_id: string | null }) {
    const a = createData({ ...data, status: "pending" });
    setLocal((prev) => [...prev, a]);
  }

  function approve(id: string, approvedBy: string) {
    updateStatusData(id, "approved", approvedBy);
    setLocal((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: "approved" as const, approved_by: approvedBy, approved_at: new Date().toISOString() }
          : a,
      ),
    );
  }

  function reject(id: string, approvedBy: string) {
    updateStatusData(id, "rejected", approvedBy);
    setLocal((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: "rejected" as const, approved_by: approvedBy, approved_at: new Date().toISOString() }
          : a,
      ),
    );
  }

  return { announcements, pending, create, approve, reject };
}
