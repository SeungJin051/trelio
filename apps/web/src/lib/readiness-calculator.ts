import { TravelTodo } from '@/types/travel';

/**
 * 블록 완성도 평가를 위한 블록 인터페이스
 */
interface Block {
  id: string;
  title?: string;
  time?: string;
  location?: string;
  description?: string;
  block_type: string;
}

/**
 * 여행 준비율 계산 함수
 * @param blocks - 여행 블록 배열
 * @param todos - 투두 리스트 배열
 * @param tripDays - 여행 일수
 * @returns 0-100 사이의 준비율 점수
 */
export const calculateReadinessScore = (
  blocks: Block[],
  todos: TravelTodo[],
  tripDays: number
): number => {
  // 1. 블록 완성도 계산 (60% 가중치)
  const blockScore = calculateBlockCompleteness(blocks, tripDays);

  // 2. 투두 완료율 계산 (40% 가중치)
  const todoScore = calculateTodoCompleteness(todos);

  // 3. 가중 평균으로 최종 점수 계산
  const finalScore = Math.round(blockScore * 0.6 + todoScore * 0.4);

  return Math.min(100, Math.max(0, finalScore));
};

/**
 * 블록 완성도 계산
 * @param blocks - 여행 블록 배열
 * @param tripDays - 여행 일수
 * @returns 0-100 사이의 블록 완성도 점수
 */
const calculateBlockCompleteness = (
  blocks: Block[],
  tripDays: number
): number => {
  if (tripDays <= 0) return 0;

  // 권장 블록 수: 여행 일수 * 2.5개 (하루 평균 2-3개 활동)
  const recommendedBlocks = tripDays * 2.5;

  // 완성된 블록 수 계산
  const completedBlocks = blocks.filter((block) =>
    isBlockComplete(block)
  ).length;

  // 완성도 비율 계산 (최대 100%)
  const completionRatio = Math.min(1, completedBlocks / recommendedBlocks);

  return completionRatio * 100;
};

/**
 * 개별 블록이 완성되었는지 확인
 * @param block - 검사할 블록
 * @returns 완성 여부
 */
const isBlockComplete = (block: Block): boolean => {
  // 기본 필수 정보: 제목, 시간, 위치
  const hasBasicInfo = !!(
    block.title?.trim() &&
    block.time &&
    block.location?.trim()
  );

  // 블록 타입별 추가 요구사항
  switch (block.block_type) {
    case 'accommodation':
      // 숙소: 기본 정보만 있으면 완성
      return hasBasicInfo;

    case 'flight':
      // 항공편: 기본 정보 + 상세 정보 필요
      return hasBasicInfo && !!block.description?.trim();

    case 'activity':
      // 활동: 기본 정보만 있으면 완성
      return hasBasicInfo;

    case 'restaurant':
      // 식당: 기본 정보만 있으면 완성
      return hasBasicInfo;

    case 'transportation':
      // 교통: 기본 정보 + 상세 정보 필요
      return hasBasicInfo && !!block.description?.trim();

    default:
      // 기타: 기본 정보만 있으면 완성
      return hasBasicInfo;
  }
};

/**
 * 투두 완료율 계산
 * @param todos - 투두 리스트 배열
 * @returns 0-100 사이의 투두 완료율 점수
 */
const calculateTodoCompleteness = (todos: TravelTodo[]): number => {
  if (todos.length === 0) {
    // 투두가 없으면 기본 점수 50점 (계획은 있지만 세부 준비 항목이 없는 상태)
    return 50;
  }

  const completedTodos = todos.filter((todo) => todo.is_completed).length;
  const completionRatio = completedTodos / todos.length;

  return completionRatio * 100;
};

/**
 * 준비율에 따른 상태 메시지 반환
 * @param score - 준비율 점수 (0-100)
 * @returns 상태 메시지와 색상 정보
 */
export const getReadinessStatus = (
  score: number
): {
  message: string;
  color: 'red' | 'yellow' | 'blue' | 'green';
  emoji: string;
} => {
  if (score >= 90) {
    return {
      message: '완벽한 준비 상태입니다!',
      color: 'green',
      emoji: '🎉',
    };
  } else if (score >= 75) {
    return {
      message: '거의 다 준비되었어요',
      color: 'blue',
      emoji: '✨',
    };
  } else if (score >= 50) {
    return {
      message: '준비가 절반 정도 되었어요',
      color: 'yellow',
      emoji: '⚡',
    };
  } else if (score >= 25) {
    return {
      message: '아직 준비할 것이 많아요',
      color: 'yellow',
      emoji: '📝',
    };
  } else {
    return {
      message: '계획을 더 구체화해보세요',
      color: 'red',
      emoji: '🚀',
    };
  }
};

/**
 * 준비율 향상을 위한 추천 액션 반환
 * @param blocks - 여행 블록 배열
 * @param todos - 투두 리스트 배열
 * @param tripDays - 여행 일수
 * @returns 추천 액션 리스트
 */
export const getReadinessRecommendations = (
  blocks: Block[],
  todos: TravelTodo[],
  tripDays: number
): string[] => {
  const recommendations: string[] = [];

  // 블록 관련 추천
  const completedBlocks = blocks.filter((block) =>
    isBlockComplete(block)
  ).length;
  const recommendedBlocks = tripDays * 2.5;

  if (completedBlocks < recommendedBlocks) {
    const missingBlocks = Math.ceil(recommendedBlocks - completedBlocks);
    recommendations.push(`${missingBlocks}개의 활동을 더 계획해보세요`);
  }

  // 불완전한 블록 체크
  const incompleteBlocks = blocks.filter((block) => !isBlockComplete(block));
  if (incompleteBlocks.length > 0) {
    recommendations.push(
      `${incompleteBlocks.length}개 블록의 세부 정보를 완성해보세요`
    );
  }

  // 투두 관련 추천
  const pendingTodos = todos.filter((todo) => !todo.is_completed);
  if (pendingTodos.length > 0) {
    recommendations.push(`${pendingTodos.length}개의 할 일을 완료해보세요`);
  }

  if (todos.length === 0) {
    recommendations.push('여행 준비 체크리스트를 만들어보세요');
  }

  // 기본 추천사항
  if (recommendations.length === 0) {
    recommendations.push('완벽한 준비 상태입니다! 즐거운 여행 되세요 🎉');
  }

  return recommendations.slice(0, 3); // 최대 3개까지만 표시
};
