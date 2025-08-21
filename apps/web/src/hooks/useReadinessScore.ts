import { useCallback, useEffect, useState } from 'react';

import {
  calculateReadinessScore,
  getReadinessRecommendations,
  getReadinessStatus,
} from '@/lib/readiness-calculator';
import { TravelTodo } from '@/types/travel';

interface Block {
  id: string;
  title?: string;
  time?: string;
  location?: string;
  description?: string;
  block_type: string;
}

interface UseReadinessScoreProps {
  planId: string;
  startDate: string;
  endDate: string;
}

interface UseReadinessScoreReturn {
  score: number;
  status: {
    message: string;
    color: 'red' | 'yellow' | 'blue' | 'green';
    emoji: string;
  };
  recommendations: string[];
  isLoading: boolean;
  refresh: () => void;
}

/**
 * 여행 준비율을 실시간으로 계산하고 관리하는 훅
 */
export const useReadinessScore = ({
  planId,
  startDate,
  endDate,
}: UseReadinessScoreProps): UseReadinessScoreReturn => {
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [todos, setTodos] = useState<TravelTodo[]>([]);

  // 여행 일수 계산
  const getTripDays = useCallback(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }, [startDate, endDate]);

  // 블록 데이터 가져오기
  const fetchBlocks = useCallback(async () => {
    try {
      const response = await fetch(`/api/blocks?planId=${planId}`);
      if (response.ok) {
        const data = await response.json();
        setBlocks(data.blocks || []);
      }
    } catch (error) {
      console.error('블록 데이터 가져오기 실패:', error);
    }
  }, [planId]);

  // 투두 데이터 가져오기
  const fetchTodos = useCallback(async () => {
    try {
      const response = await fetch(`/api/todos?planId=${planId}`);
      if (response.ok) {
        const data = await response.json();
        setTodos(data.todos || []);
      }
    } catch (error) {
      console.error('투두 데이터 가져오기 실패:', error);
    }
  }, [planId]);

  // 모든 데이터 새로고침
  const refresh = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchBlocks(), fetchTodos()]);
    setIsLoading(false);
  }, [fetchBlocks, fetchTodos]);

  // 준비율 계산
  const calculateScore = useCallback(() => {
    const tripDays = getTripDays();
    const newScore = calculateReadinessScore(blocks, todos, tripDays);
    setScore(newScore);
  }, [blocks, todos, getTripDays]);

  // 초기 데이터 로드
  useEffect(() => {
    refresh();
  }, [refresh]);

  // 데이터 변경 시 준비율 재계산
  useEffect(() => {
    if (!isLoading) {
      calculateScore();
    }
  }, [blocks, todos, isLoading, calculateScore]);

  // 상태 메시지와 추천사항 계산
  const status = getReadinessStatus(score);
  const recommendations = getReadinessRecommendations(
    blocks,
    todos,
    getTripDays()
  );

  return {
    score,
    status,
    recommendations,
    isLoading,
    refresh,
  };
};
