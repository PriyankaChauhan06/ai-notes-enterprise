import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getAgentRuns } from "../services/analytics.service";
import type { AgentRun } from "../types/analytics";

function useAgentRuns() {
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadRuns = useCallback(async () => {
    try {
      setIsLoading(true);

      const result = await getAgentRuns();
      setRuns(result);
    } catch (error) {
      console.error("Failed to load agent runs:", error);
      toast.error("Failed to load agent runs.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRuns();
  }, [loadRuns]);

  return {
    runs,
    isLoading,
    loadRuns,
  };
}

export default useAgentRuns;
