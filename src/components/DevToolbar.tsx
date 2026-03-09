import { useAuth } from "@/hooks/useAuth";
import { Role } from "@/lib/demo-data";

const ROLES: Role[] = ["admin", "coach", "fighter"];

export function DevToolbar() {
  const { isDevMode, role, setDevRole } = useAuth();
  if (!isDevMode) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center gap-3 border-t border-yellow-400 bg-yellow-50 px-4 py-2 text-xs">
      <span className="font-mono font-semibold text-yellow-700">DEV MODE</span>
      <span className="text-yellow-600">View as:</span>
      {ROLES.map((r) => (
        <button
          key={r}
          onClick={() => setDevRole(r)}
          className={`rounded px-3 py-1 font-mono transition-colors ${
            role === r
              ? "bg-yellow-500 font-bold text-white"
              : "bg-yellow-200 hover:bg-yellow-300 text-yellow-800"
          }`}
        >
          {r}
        </button>
      ))}
    </div>
  );
}
