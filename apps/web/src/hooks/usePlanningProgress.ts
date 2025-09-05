import { useCallback, useEffect, useState } from 'react';

import {
  calculatePlanningScore,
  getPlanningStatus,
} from '@/lib/planning-calculator';

type BlockLite = { id: string; block_type?: string };
type TodoLite = { id: string };

interface UsePlanningProgressProps {
  planId: string;
  startDate: string;
  endDate: string;
}

export const usePlanningProgress = ({
  planId,
  startDate,
  endDate,
}: UsePlanningProgressProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [blocksCount, setBlocksCount] = useState(0);
  const [todosCount, setTodosCount] = useState(0);
  const [score, setScore] = useState(0);

  const getTripDays = useCallback(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }, [startDate, endDate]);

  const fetchCounts = useCallback(async () => {
    if (!planId) return;
    try {
      const [blocksRes, todosRes] = await Promise.all([
        fetch(`/api/blocks?planId=${planId}`),
        fetch(`/api/todos?planId=${planId}`),
      ]);
      if (blocksRes.ok) {
        const json = await blocksRes.json();
        const blocks = (json?.blocks as BlockLite[] | undefined) || [];
        const counted = blocks.filter(
          (b) => (b?.block_type || '').toLowerCase() !== 'memo'
        ).length;
        setBlocksCount(counted);
      }
      if (todosRes.ok) {
        const json = await todosRes.json();
        setTodosCount((json?.todos as TodoLite[] | undefined)?.length || 0);
      }
    } catch {
      // ignore
    }
  }, [planId]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await fetchCounts();
    setIsLoading(false);
  }, [fetchCounts]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (isLoading) return;
    const days = getTripDays();
    const s = calculatePlanningScore(blocksCount, todosCount, days);
    setScore(s);
  }, [isLoading, blocksCount, todosCount, getTripDays]);

  const status = getPlanningStatus(score);

  return { score, status, isLoading, refresh };
};
