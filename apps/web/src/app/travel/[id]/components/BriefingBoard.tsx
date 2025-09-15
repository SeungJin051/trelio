'use client';

import {
  IoAddOutline,
  IoDownloadOutline,
  IoSettingsOutline,
  IoTimeOutline,
  IoWalletOutline,
} from 'react-icons/io5';

import {
  Avatar,
  Button,
  Progress,
  ProgressColorTheme,
  Typography,
} from '@ui/components';

import { useBudgetWithExchange } from '@/hooks/useBudgetWithExchange';
import { usePlanningProgress } from '@/hooks/usePlanningProgress';

// import { calculateDDayWithEnd } from '@/lib/travel-utils';

import { SharedTodoWidget } from './SharedTodoWidget';

// 로컬 타입 (API와 동일 스키마 사용)
interface ActivityItem {
  id: string;
  type:
    | 'block_add'
    | 'block_edit'
    | 'block_delete'
    | 'block_move'
    | 'comment'
    | 'participant_join';
  user: {
    id: string;
    nickname: string;
    profile_image_url?: string;
  };
  content: string;
  timestamp: string;
  blockId?: string;
  blockTitle?: string;
}

interface Participant {
  id: string;
  nickname: string;
  profile_image_url?: string;
  isOnline: boolean;
  currentActivity?: string;
}

interface BriefingBoardProps {
  planId: string; // 실제 여행 계획 ID 추가
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  participants: Participant[];
  activities: ActivityItem[];
  totalBudget: number;
  currency: string;
  destinationCountry?: string; // 목적지 국가 코드
  userNationality?: string; // 사용자 국적
  hotTopics: Array<{
    id: string;
    title: string;
    commentCount: number;
    blockId: string;
  }>;
  onInviteParticipants: () => void;
  onExport: () => void;
  onSettings: () => void;
  onBlockClick: (blockId: string) => void;
  onHotTopicClick: (blockId: string) => void;
  onBudgetClick?: () => void;
  onReadinessClick?: () => void;
}

export const BriefingBoard: React.FC<BriefingBoardProps> = ({
  planId,
  startDate,
  endDate,
  participants,
  activities,
  totalBudget,
  currency,
  destinationCountry,
  userNationality,
  onInviteParticipants,
  onExport,
  onSettings,
  onBudgetClick,
  onReadinessClick,
}) => {
  // 여행 계획율 계산
  const {
    score: planningScore,
    status: planningStatus,
    isLoading: planningLoading,
  } = usePlanningProgress({
    planId,
    startDate,
    endDate,
  });

  // 실시간 환율 적용 예산 계산
  const {
    budgetInfo,
    isLoading: budgetLoading,
    error: budgetError,
  } = useBudgetWithExchange({
    planId,
    targetBudget: totalBudget,
    budgetCurrency: currency,
    destinationCountry,
    userNationality,
  });
  // D-Day 관련 계산은 추후 배지 사용 시 활성화 예정
  // const ddayText = calculateDDayWithEnd(startDate, endDate);

  // 최근 활동: 상위 컴포넌트에서 전달받은 데이터를 사용

  return (
    <div className='min-h-full w-full overflow-x-hidden bg-gray-50 px-1 py-3 sm:px-3 md:px-6 lg:px-8'>
      <div className='mx-auto w-full max-w-6xl space-y-4 sm:space-y-5 md:space-y-6'>
        {/* 실시간 현황과 핵심 요약 그리드 */}
        <div className='flex w-full flex-col gap-4 md:flex-row md:gap-5 lg:gap-6'>
          {/* 좌측 컬럼 - 사람과 활동 */}
          <div className='w-full min-w-0 flex-1 space-y-4 md:space-y-5 lg:space-y-6'>
            {/* 참여자 섹션 */}
            <div className='w-full rounded-xl bg-white p-3 shadow-sm sm:rounded-2xl sm:p-4 md:p-5 lg:p-6'>
              <Typography
                variant='h6'
                className='mb-3 font-semibold text-gray-900 sm:mb-4'
              >
                참여자
              </Typography>

              {/* 참여자 아바타 목록 */}
              <div className='flex w-full flex-wrap items-center gap-2'>
                {participants.map((participant) => (
                  <div key={participant.id} className='group relative'>
                    <div className='relative'>
                      <Avatar
                        src={participant.profile_image_url}
                        alt={participant.nickname}
                        size='small'
                        className={`transition-all duration-200 hover:scale-110 sm:h-10 sm:w-10 ${
                          participant.isOnline
                            ? 'ring-1 ring-green-400 sm:ring-2'
                            : 'ring-1 ring-gray-200 sm:ring-2'
                        }`}
                      />
                      {participant.isOnline && (
                        <div className='absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border border-white bg-green-400 sm:-right-1 sm:-top-1 sm:h-3 sm:w-3 sm:border-2'></div>
                      )}
                    </div>
                    {/* 호버 툴팁 */}
                    <div className='absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 transform whitespace-nowrap rounded-lg bg-gray-800 px-3 py-2 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100'>
                      <div className='font-medium'>{participant.nickname}</div>
                      <div
                        className={`text-xs ${participant.isOnline ? 'text-green-400' : 'text-gray-400'}`}
                      >
                        {participant.isOnline ? '온라인' : '오프라인'}
                      </div>
                      {participant.currentActivity && (
                        <div className='mt-1 text-gray-300'>
                          {participant.currentActivity}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 빠른 액션 */}
            <div className='w-full rounded-xl bg-white p-3 shadow-sm sm:rounded-2xl sm:p-4 md:p-5 lg:p-6'>
              <Typography
                variant='h6'
                className='mb-3 font-semibold text-gray-900 sm:mb-4'
              >
                빠른 액션
              </Typography>
              <div className='grid w-full grid-cols-1 gap-2 sm:gap-3'>
                <Button
                  onClick={onInviteParticipants}
                  colorTheme='blue'
                  size='medium'
                  className='h-10 w-full justify-start rounded-lg shadow-sm transition-all duration-200 hover:shadow-md sm:h-11 sm:rounded-xl md:h-12 lg:h-14'
                  leftIcon={<IoAddOutline className='h-4 w-4 sm:h-5 sm:w-5' />}
                >
                  <div className='ml-2 text-left sm:ml-3'>
                    <Typography variant='h6' className='text-white'>
                      동반자 초대하기
                    </Typography>
                  </div>
                </Button>
                <div className='grid w-full grid-cols-2 gap-2 sm:gap-3'>
                  <Button
                    onClick={onExport}
                    colorTheme='gray'
                    size='medium'
                    className='h-9 w-full justify-start rounded-lg shadow-sm transition-all duration-200 hover:shadow-md sm:h-10 sm:rounded-xl md:h-11'
                    leftIcon={
                      <IoDownloadOutline className='h-3 w-3 sm:h-4 sm:w-4' />
                    }
                  >
                    <span className='ml-1 text-xs sm:ml-2 sm:text-sm'>
                      내보내기
                    </span>
                  </Button>
                  <Button
                    onClick={onSettings}
                    colorTheme='gray'
                    size='medium'
                    className='h-9 w-full justify-start rounded-lg shadow-sm transition-all duration-200 hover:shadow-md sm:h-10 sm:rounded-xl md:h-11'
                    leftIcon={
                      <IoSettingsOutline className='h-3 w-3 sm:h-4 sm:w-4' />
                    }
                  >
                    <span className='ml-1 text-xs sm:ml-2 sm:text-sm'>
                      설정
                    </span>
                  </Button>
                </div>
              </div>
            </div>

            {/* 최근 변경사항 */}
            <div className='w-full rounded-xl bg-white p-3 shadow-sm sm:rounded-2xl sm:p-4 md:p-5 lg:p-6'>
              <Typography
                variant='h6'
                className='mb-3 font-semibold text-gray-900 sm:mb-4'
              >
                최근 변경사항
              </Typography>
              <div className='space-y-2 sm:space-y-3'>
                {activities.map((activity: ActivityItem) => (
                  <div
                    key={activity.id}
                    className='rounded-lg border border-gray-200 p-3'
                  >
                    <div className='flex items-start space-x-3'>
                      <Avatar
                        src={activity.user.profile_image_url}
                        alt={activity.user.nickname}
                        size='small'
                      />
                      <div className='flex-1'>
                        <Typography
                          variant='body2'
                          className='font-medium text-gray-900'
                        >
                          {activity.user.nickname}
                        </Typography>
                        <Typography variant='body2' className='text-gray-600'>
                          {activity.content}
                        </Typography>
                        <div className='mt-1 flex items-center space-x-1'>
                          <IoTimeOutline className='h-3 w-3 text-gray-400' />
                          <Typography
                            variant='caption'
                            className='text-gray-400'
                          >
                            {activity.timestamp}
                          </Typography>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 우측 컬럼 - 진행상황 */}
          <div className='w-full min-w-0 flex-1 space-y-4 md:space-y-5 lg:space-y-6'>
            {/* 여행 계획율 */}
            <div className='w-full rounded-xl bg-white p-3 shadow-sm sm:rounded-2xl sm:p-4 md:p-5 lg:p-6'>
              <div className='mb-4 flex items-center justify-between'>
                <div className='flex items-center space-x-2'>
                  <Typography
                    variant='h6'
                    className='font-semibold text-gray-900'
                  >
                    여행 계획율
                  </Typography>
                  <span className='text-lg'>{planningStatus.emoji}</span>
                </div>
                {planningLoading ? (
                  <div className='h-6 w-12 animate-pulse rounded bg-gray-200'></div>
                ) : (
                  <Typography
                    variant='h6'
                    className={`font-bold text-${planningStatus.color}-600`}
                  >
                    {planningScore}%
                  </Typography>
                )}
              </div>

              <button
                onClick={onReadinessClick}
                className='w-full rounded-lg p-2 transition-all duration-200 sm:p-3'
                disabled={!onReadinessClick || planningLoading}
              >
                <Progress
                  value={planningScore}
                  size='medium'
                  colorTheme={planningStatus.color as ProgressColorTheme}
                />
              </button>
              {/* 한 줄 제안 (UX writing) */}
              {!planningLoading && (
                <div className='mt-3 rounded-lg bg-gray-50 p-3'>
                  <Typography variant='caption' className='text-gray-700'>
                    {planningScore <= 0 &&
                      '시작해볼까요? 블록과 할 일을 추가하면 계획율이 올라가요.'}
                    {planningScore > 0 &&
                      planningScore < 30 &&
                      '좋은 출발이에요. 오늘 1–2개만 더 추가해볼까요?'}
                    {planningScore >= 30 &&
                      planningScore < 70 &&
                      '탄력 받았어요. 남은 일차에 핵심 활동을 채워봐요.'}
                    {planningScore >= 70 &&
                      planningScore < 90 &&
                      '거의 다 됐어요. 이동/숙소만 확인하면 충분해요.'}
                    {planningScore >= 90 &&
                      '완벽에 가까워요. 세부만 다듬으면 끝!'}
                  </Typography>
                </div>
              )}
            </div>

            {/* 예산 현황 */}
            <div className='w-full rounded-xl bg-white p-3 shadow-sm sm:rounded-2xl sm:p-4 md:p-5 lg:p-6'>
              <div className='mb-4 flex items-center justify-between'>
                <Typography
                  variant='h6'
                  className='font-semibold text-gray-900'
                >
                  예산 현황
                </Typography>
                {budgetInfo.currency !== budgetInfo.originalCurrency && (
                  <div className='flex items-center space-x-1 rounded-full bg-blue-100 px-2 py-1'>
                    <Typography
                      variant='caption'
                      className='font-medium text-blue-700'
                    >
                      환율 적용
                    </Typography>
                  </div>
                )}
              </div>

              {budgetError ? (
                <div className='rounded-lg bg-red-50 p-4 text-center'>
                  <Typography variant='body2' className='text-red-600'>
                    {budgetError}
                  </Typography>
                </div>
              ) : (
                <button
                  onClick={onBudgetClick}
                  className='w-full rounded-xl bg-gray-50 p-3 transition-all duration-200 sm:p-4'
                  disabled={!onBudgetClick || budgetLoading}
                >
                  {budgetLoading ? (
                    <div className='space-y-3'>
                      <div className='h-8 w-32 animate-pulse rounded bg-gray-200'></div>
                      <div className='h-3 w-full animate-pulse rounded bg-gray-200'></div>
                      <div className='flex justify-between'>
                        <div className='h-4 w-20 animate-pulse rounded bg-gray-200'></div>
                        <div className='h-4 w-24 animate-pulse rounded bg-gray-200'></div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* 상단 요약: 사용/남음 (이중 통화 표시) */}
                      <div className='mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2'>
                        {/* 사용 */}
                        <div className='rounded-xl border border-gray-100 bg-white p-3'>
                          <Typography
                            variant='caption'
                            className='text-gray-500'
                          >
                            사용
                          </Typography>
                          <div className='mt-1 space-y-1'>
                            {/* 원래 통화 */}
                            <div className='flex flex-wrap items-baseline gap-1'>
                              <Typography
                                variant='h6'
                                className='break-all font-mono font-extrabold text-gray-900'
                              >
                                {
                                  budgetInfo.originalBudgetInfo
                                    .formattedSpentAmount
                                }
                              </Typography>
                              <span className='shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] text-gray-600'>
                                {budgetInfo.originalCurrency}
                              </span>
                            </div>
                            {/* 변환 통화 (다를 때만) */}
                            {budgetInfo.currency !==
                              budgetInfo.originalCurrency && (
                              <div className='flex flex-wrap items-baseline gap-1'>
                                <Typography
                                  variant='h6'
                                  className='break-all font-mono font-extrabold text-gray-900'
                                >
                                  {budgetInfo.formattedSpentAmount}
                                </Typography>
                                <span className='shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] text-gray-600'>
                                  {budgetInfo.currency}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        {/* 남음 */}
                        <div className='rounded-xl border border-gray-100 bg-white p-3'>
                          <Typography
                            variant='caption'
                            className='text-gray-500'
                          >
                            남음
                          </Typography>
                          <div className='mt-1 space-y-1'>
                            {/* 원래 통화 */}
                            <div className='flex flex-wrap items-baseline justify-end gap-1'>
                              <Typography
                                variant='h6'
                                className='break-all font-mono font-extrabold text-gray-900'
                              >
                                {
                                  budgetInfo.originalBudgetInfo
                                    .formattedRemainingBudget
                                }
                              </Typography>
                              <span className='shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] text-gray-600'>
                                {budgetInfo.originalCurrency}
                              </span>
                            </div>
                            {/* 변환 통화 (다를 때만) */}
                            {budgetInfo.currency !==
                              budgetInfo.originalCurrency && (
                              <div className='flex flex-wrap items-baseline justify-end gap-1'>
                                <Typography
                                  variant='h6'
                                  className='break-all font-mono font-extrabold text-gray-900'
                                >
                                  {budgetInfo.formattedRemainingBudget}
                                </Typography>
                                <span className='shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] text-gray-600'>
                                  {budgetInfo.currency}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 진행 바 */}
                      <div className='mb-2'>
                        <div className='h-3 w-full rounded-full bg-gray-200'>
                          <div
                            className='h-3 rounded-full bg-green-500 transition-all duration-300'
                            style={{
                              width: `${Math.min(budgetInfo.spentPercentage, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div className='mb-3 flex items-center justify-between text-xs text-gray-500'>
                        <span>0%</span>
                        <span>
                          {Math.min(budgetInfo.spentPercentage, 100).toFixed(0)}
                          %
                        </span>
                      </div>

                      {/* 총 예산: 우측 정렬 숫자, 하단 환율 안내 */}
                      <div className='flex items-start justify-between'>
                        <div className='flex items-center space-x-2'>
                          <IoWalletOutline className='h-4 w-4 text-green-600' />
                          <Typography variant='body2' className='text-gray-700'>
                            총 예산
                          </Typography>
                        </div>
                        <div className='text-right'>
                          <div className='flex flex-wrap items-baseline justify-end gap-1'>
                            <Typography
                              variant='h6'
                              className='break-all font-mono font-extrabold text-gray-900'
                            >
                              {
                                budgetInfo.originalBudgetInfo
                                  .formattedTargetBudget
                              }
                            </Typography>
                            <span className='shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] text-gray-600'>
                              {budgetInfo.originalCurrency}
                            </span>
                          </div>
                          {budgetInfo.currency !==
                            budgetInfo.originalCurrency && (
                            <div className='flex flex-wrap items-baseline justify-end gap-1'>
                              <Typography
                                variant='h6'
                                className='break-all font-mono font-extrabold text-gray-900'
                              >
                                {budgetInfo.formattedTargetBudget}
                              </Typography>
                              <span className='shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] text-gray-600'>
                                {budgetInfo.currency}
                              </span>
                            </div>
                          )}
                          {budgetInfo.currency !==
                            budgetInfo.originalCurrency && (
                            <Typography
                              variant='caption'
                              className='text-gray-400'
                            >
                              환율 기준: 1 {budgetInfo.originalCurrency} ≈{' '}
                              {budgetInfo.exchangeRate.toFixed(2)}{' '}
                              {budgetInfo.currency}
                            </Typography>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* 공동 할 일 */}
            <SharedTodoWidget planId={planId} participants={participants} />

            {/* 토론 중인 항목 */}
            {/* {hotTopics.length > 0 && (
              <div className='w-full p-3 bg-white shadow-sm rounded-xl sm:rounded-2xl sm:p-4 md:p-5 lg:p-6'>
                <div className='flex items-center mb-4 space-x-2'>
                  <IoChatbubbleOutline className='w-5 h-5 text-orange-500' />
                  <Typography
                    variant='h6'
                    className='font-semibold text-gray-900'
                  >
                    토론 중인 항목
                  </Typography>
                </div>
                <div className='space-y-2 sm:space-y-3'>
                  {hotTopics.map((topic) => (
                    <div
                      key={topic.id}
                      className='p-3 transition-all border border-orange-200 cursor-pointer rounded-xl bg-orange-50 hover:bg-orange-100 hover:shadow-sm sm:p-4'
                      onClick={() => onHotTopicClick(topic.blockId)}
                    >
                      <Typography
                        variant='body2'
                        className='mb-1 font-semibold text-orange-800'
                      >
                        {topic.title}
                      </Typography>
                      <div className='flex items-center space-x-2'>
                        <Badge colorTheme='red' size='small'>
                          댓글 {topic.commentCount}개
                        </Badge>
                        <Typography
                          variant='caption'
                          className='text-orange-600'
                        >
                          토론 참여하기 →
                        </Typography>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
};
