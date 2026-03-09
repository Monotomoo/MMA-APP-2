import { useState } from "react";
import {
  TRAINING_SESSIONS, TrainingSession,
  addTrainingSession as addSessionData,
  removeTrainingSession as removeSessionData,
} from "@/lib/demo-data";

const DAY_NAMES = ["Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"];

export function useTrainingSessions(clubId = "club-2") {
  const [localSessions, setLocalSessions] = useState<TrainingSession[]>(
    () => TRAINING_SESSIONS.filter((s) => s.club_id === clubId && s.is_active),
  );

  const sessions = [...localSessions]
    .sort((a, b) => a.day_of_week - b.day_of_week)
    .map((s) => ({
      ...s,
      day_name:   DAY_NAMES[s.day_of_week],
      time_range: `${s.start_time}–${s.end_time}`,
    }));

  function addSession(data: Omit<TrainingSession, "id">) {
    const session = addSessionData(data);
    setLocalSessions((prev) => [...prev, session]);
  }

  function removeSession(id: string) {
    removeSessionData(id);
    setLocalSessions((prev) => prev.filter((s) => s.id !== id));
  }

  return { sessions, addSession, removeSession };
}
