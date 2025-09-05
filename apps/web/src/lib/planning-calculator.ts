export type PlanningColor = 'red' | 'orange' | 'blue' | 'green';

export interface PlanningConfig {
  blocksPerDayTarget?: number; // 기본 2.2 (완만화)
  todosPerDayTarget?: number; // 기본 0.8 (완만화)
  blockWeight?: number; // 기본 0.85 (블록 비중 상향)
  todoWeight?: number; // 기본 0.15
}

export function calculatePlanningScore(
  blocksCount: number,
  todosCount: number,
  tripDays: number,
  config?: PlanningConfig
): number {
  const {
    blocksPerDayTarget = 2.2,
    todosPerDayTarget = 0.8,
    blockWeight = 0.85,
    todoWeight = 0.15,
  } = config || {};

  const safeDays = Math.max(1, Math.floor(tripDays) || 1);
  const blockTarget = safeDays * blocksPerDayTarget;
  const todoTarget = safeDays * todosPerDayTarget;

  // 1) 블록: 일차 커버리지(블록이 존재하는 날짜 비율)와 개수 비율을 결합
  const coveredDays = Math.min(blocksCount || 0, safeDays);
  const coverageRatio = coveredDays / safeDays; // 0~1
  const blockCountRatio = Math.min(
    1,
    (blocksCount || 0) / Math.max(1, blockTarget)
  );
  const blockRatio = 0.6 * coverageRatio + 0.4 * blockCountRatio; // 커버리지를 더 중요하게

  // 2) 투두: 체감효과(sqrt) 적용해 완만하게
  const todoLinear = Math.min(1, (todosCount || 0) / Math.max(1, todoTarget));
  const todoRatio = Math.sqrt(todoLinear);

  const raw = blockWeight * blockRatio + todoWeight * todoRatio;
  const score = Math.round(Math.min(1, Math.max(0, raw)) * 100);
  return score;
}

export function getPlanningStatus(score: number): {
  message: string;
  color: PlanningColor;
  emoji: string;
} {
  if (score <= 0) {
    return {
      message: '시작해볼까요? 블록과 할 일을 추가하면 계획율이 올라가요.',
      color: 'red',
      emoji: '🌱',
    };
  }
  if (score < 30) {
    return {
      message: '좋은 출발이에요. 오늘 1–2개만 더 추가해볼까요?',
      color: 'red',
      emoji: '🚀',
    };
  }
  if (score < 70) {
    return {
      message: '탄력 받았어요. 남은 일차에 핵심 활동을 채워봐요.',
      color: 'orange',
      emoji: '💪',
    };
  }
  if (score < 90) {
    return {
      message: '거의 다 됐어요. 이동/숙소만 확인하면 충분해요.',
      color: 'blue',
      emoji: '✨',
    };
  }
  return {
    message: '완벽에 가까워요. 세부만 다듬으면 끝!',
    color: 'green',
    emoji: '🎉',
  };
}
