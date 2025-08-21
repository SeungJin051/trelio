'use client';

import {
  IoAddOutline,
  IoCalendarOutline,
  IoChatbubbleOutline,
  IoCheckmarkCircleOutline,
  IoDownloadOutline,
  IoInformationCircleOutline,
  IoSettingsOutline,
  IoTimeOutline,
  IoWalletOutline,
} from 'react-icons/io5';

import {
  Avatar,
  Badge,
  Button,
  Progress,
  ProgressColorTheme,
  Typography,
} from '@ui/components';

import { useBudgetWithExchange } from '@/hooks/useBudgetWithExchange';
import { useReadinessScore } from '@/hooks/useReadinessScore';
import { formatCurrency } from '@/lib/currency';

import { SharedTodoWidget } from './SharedTodoWidget';

interface ActivityItem {
  id: string;
  type: 'block_add' | 'block_edit' | 'comment' | 'participant_join';
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
  title,
  location,
  startDate,
  endDate,
  participants,
  totalBudget,
  currency,
  destinationCountry,
  userNationality,
  hotTopics,
  onInviteParticipants,
  onExport,
  onSettings,
  onBlockClick,
  onHotTopicClick,
  onBudgetClick,
  onReadinessClick,
}) => {
  // 실시간 준비율 계산
  const {
    score: readinessScore,
    status,
    recommendations,
    isLoading: readinessLoading,
  } = useReadinessScore({
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
  // D-Day 계산
  const getDDay = () => {
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    startDateObj.setHours(0, 0, 0, 0);
    endDateObj.setHours(0, 0, 0, 0);

    const diffTime = startDateObj.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // 여행 시작 전
    if (diffDays > 0) return `D-${diffDays}`;

    // 여행 시작일
    if (diffDays === 0) return 'D-Day';

    // 여행 중
    if (today >= startDateObj && today <= endDateObj) {
      const daysSinceStart = Math.ceil(
        (today.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)
      );
      return `D+${daysSinceStart}`;
    }

    // 여행 종료 후
    const daysSinceEnd = Math.ceil(
      (today.getTime() - endDateObj.getTime()) / (1000 * 60 * 60 * 24)
    );
    return `여행 종료 ${daysSinceEnd}일`;
  };

  // 여행 기간 계산
  const getTripDuration = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return `${diffDays - 1}박 ${diffDays}일`;
  };

  // 최근 활동 데이터 (실제로는 API에서 가져옴)
  const recentActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'block_add',
      user: { id: '1', nickname: '지혜', profile_image_url: undefined },
      content: '돼지국밥 블록을 추가했습니다',
      timestamp: '방금 전',
      blockId: 'block-1',
      blockTitle: '돼지국밥',
    },
    {
      id: '2',
      type: 'block_edit',
      user: { id: '2', nickname: '민준', profile_image_url: undefined },
      content: '해운대 숙소 시간을 15:00으로 변경했습니다',
      timestamp: '5분 전',
      blockId: 'block-2',
      blockTitle: '해운대 숙소',
    },
    {
      id: '3',
      type: 'comment',
      user: { id: '3', nickname: '현수', profile_image_url: undefined },
      content: '광안리 드론쇼 블록에 댓글을 남겼습니다',
      timestamp: '1시간 전',
      blockId: 'block-3',
      blockTitle: '광안리 드론쇼',
    },
  ];

  return (
    <div className='min-h-full w-full overflow-x-hidden bg-gray-50 px-1 py-3 sm:px-3 md:px-6 lg:px-8'>
      <div className='mx-auto w-full max-w-6xl space-y-4 sm:space-y-5 md:space-y-6'>
        {/* 헤더 섹션 */}
        <div className='w-full rounded-2xl bg-white p-3 shadow-sm sm:p-4 md:p-5 lg:p-6'>
          <div className='flex w-full flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-0'>
            <div className='min-w-0 flex-1 space-y-2'>
              <Typography
                variant='h4'
                className='break-words text-lg font-bold text-gray-900 sm:text-xl md:text-2xl lg:text-3xl'
              >
                {title}
              </Typography>
              <div className='flex flex-col space-y-1 text-xs text-gray-600 sm:text-sm lg:flex-row lg:items-center lg:space-x-4 lg:space-y-0'>
                <div className='flex items-center space-x-1'>
                  <IoCalendarOutline className='h-3 w-3 sm:h-4 sm:w-4' />
                  <span>
                    {getTripDuration()} {location}
                  </span>
                </div>
                <div className='flex items-center space-x-1'>
                  <IoTimeOutline className='h-3 w-3 sm:h-4 sm:w-4' />
                  <span className='text-xs sm:text-sm'>
                    {new Date(startDate).toLocaleDateString()} -{' '}
                    {new Date(endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* D-Day 카운터 */}
            <div className='w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-2 text-center text-white shadow-lg sm:w-auto sm:px-4 sm:py-3 sm:text-left md:px-5 md:py-4'>
              <Typography
                variant='h3'
                className='text-lg font-bold sm:text-xl md:text-2xl lg:text-3xl'
              >
                {getDDay()}
              </Typography>
              <Typography
                variant='caption'
                className='text-xs text-blue-100 sm:text-sm'
              >
                여행까지 남은 시간
              </Typography>
            </div>
          </div>

          {/* 날씨 정보 */}
          {/* Removed weather display */}
        </div>

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
                {participants.map((participant, index) => (
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

                {/* 초대 버튼 */}
                <button
                  onClick={onInviteParticipants}
                  className='flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500 transition-all duration-200 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-500'
                  title='참여자 초대하기'
                >
                  <IoAddOutline className='h-5 w-5' />
                </button>
              </div>

              {/* 참여자 이름 목록 (모바일용) */}
              <div className='mt-3 flex w-full flex-wrap gap-2'>
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className='flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1'
                  >
                    <div
                      className={`h-2 w-2 rounded-full ${
                        participant.isOnline ? 'bg-green-400' : 'bg-gray-400'
                      }`}
                    ></div>
                    <Typography variant='caption' className='text-gray-700'>
                      {participant.nickname}
                    </Typography>
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
                    <div className='text-sm font-semibold sm:text-base'>
                      동반자 초대하기
                    </div>
                    <div className='text-xs text-blue-100'>
                      새로운 여행 친구를 초대하세요
                    </div>
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
                {recentActivities.map((activity) => (
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
            {/* 여행 준비율 */}
            <div className='w-full rounded-xl bg-white p-3 shadow-sm sm:rounded-2xl sm:p-4 md:p-5 lg:p-6'>
              <div className='mb-4 flex items-center justify-between'>
                <div className='flex items-center space-x-2'>
                  <Typography
                    variant='h6'
                    className='font-semibold text-gray-900'
                  >
                    여행 준비율
                  </Typography>
                  <span className='text-lg'>{status.emoji}</span>
                </div>
                {readinessLoading ? (
                  <div className='h-6 w-12 animate-pulse rounded bg-gray-200'></div>
                ) : (
                  <Typography
                    variant='h6'
                    className={`font-bold text-${status.color}-600`}
                  >
                    {readinessScore}%
                  </Typography>
                )}
              </div>

              <button
                onClick={onReadinessClick}
                className='w-full cursor-pointer rounded-lg p-2 transition-all duration-200 hover:bg-gray-50 sm:p-3'
                disabled={!onReadinessClick || readinessLoading}
              >
                <Progress
                  value={readinessScore}
                  size='medium'
                  colorTheme={status.color as ProgressColorTheme}
                />
                <div className='mt-2 flex items-center space-x-2 text-sm text-gray-500'>
                  <IoCheckmarkCircleOutline className='h-4 w-4' />
                  <span>{status.message}</span>
                  {onReadinessClick && (
                    <span className='ml-auto text-xs text-blue-500'>
                      상세보기 →
                    </span>
                  )}
                </div>
              </button>

              {/* 추천사항 */}
              {recommendations.length > 0 && !readinessLoading && (
                <div className='mt-4 rounded-lg bg-gray-50 p-3'>
                  <div className='mb-2 flex items-center space-x-2'>
                    <IoInformationCircleOutline className='h-4 w-4 text-blue-500' />
                    <Typography
                      variant='caption'
                      className='font-medium text-gray-700'
                    >
                      추천사항
                    </Typography>
                  </div>
                  <div className='space-y-1'>
                    {recommendations.map((recommendation, index) => (
                      <Typography
                        key={index}
                        variant='caption'
                        className='block text-gray-600'
                      >
                        • {recommendation}
                      </Typography>
                    ))}
                  </div>
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
                  className='w-full cursor-pointer rounded-xl bg-gradient-to-r from-green-50 to-blue-50 p-3 transition-all duration-200 hover:from-green-100 hover:to-blue-100 sm:p-4'
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
                      <div className='mb-3 flex items-center justify-between'>
                        <div className='flex-1'>
                          <div className='flex items-center justify-between'>
                            <div>
                              <Typography
                                variant='h5'
                                className='font-bold text-gray-900'
                              >
                                {budgetInfo.formattedTargetBudget}
                              </Typography>
                              {budgetInfo.currency !==
                                budgetInfo.originalCurrency && (
                                <Typography
                                  variant='caption'
                                  className='text-gray-500'
                                >
                                  (환율: 1{budgetInfo.originalCurrency} ={' '}
                                  {budgetInfo.exchangeRate.toFixed(2)}
                                  {budgetInfo.currency})
                                </Typography>
                              )}
                            </div>
                            {/* 원래 통화로 표시 */}
                            {budgetInfo.currency !==
                              budgetInfo.originalCurrency && (
                              <div className='text-right'>
                                <Typography
                                  variant='h6'
                                  className='font-bold text-blue-600'
                                >
                                  {
                                    budgetInfo.originalBudgetInfo
                                      .formattedRemainingBudget
                                  }
                                </Typography>
                                <Typography
                                  variant='caption'
                                  className='text-blue-500'
                                >
                                  {
                                    budgetInfo.originalBudgetInfo
                                      .formattedTargetBudget
                                  }{' '}
                                  중 남음
                                </Typography>
                              </div>
                            )}
                          </div>
                        </div>
                        <IoWalletOutline className='ml-3 h-5 w-5 text-green-600' />
                      </div>

                      {/* 프로그레스 바 */}
                      <div className='mb-3'>
                        <div className='h-3 w-full rounded-full bg-gray-200'>
                          <div
                            className='h-3 rounded-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-300'
                            style={{
                              width: `${Math.min(budgetInfo.spentPercentage, 100)}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* 예산 정보 */}
                      <div className='space-y-3'>
                        <div className='flex items-center justify-between'>
                          <Typography
                            variant='body2'
                            className='font-medium text-gray-700'
                          >
                            {budgetInfo.spentPercentage.toFixed(1)}% 사용
                          </Typography>
                          <Typography variant='body2' className='text-gray-600'>
                            사용: {budgetInfo.formattedSpentAmount}
                          </Typography>
                        </div>

                        {/* 원래 통화로 사용 금액 표시 */}
                        {budgetInfo.currency !==
                          budgetInfo.originalCurrency && (
                          <div className='flex items-center justify-between rounded-lg bg-blue-50 p-2'>
                            <Typography
                              variant='body2'
                              className='font-medium text-blue-700'
                            >
                              {budgetInfo.originalCurrency} 사용량
                            </Typography>
                            <Typography
                              variant='body2'
                              className='text-blue-600'
                            >
                              {
                                budgetInfo.originalBudgetInfo
                                  .formattedSpentAmount
                              }{' '}
                              /{' '}
                              {
                                budgetInfo.originalBudgetInfo
                                  .formattedTargetBudget
                              }
                            </Typography>
                          </div>
                        )}

                        <div className='flex items-center justify-between'>
                          <Typography variant='body2' className='text-gray-600'>
                            남은 예산: {budgetInfo.formattedRemainingBudget}
                          </Typography>
                          {onBudgetClick && (
                            <span className='text-xs text-blue-500'>
                              상세보기 →
                            </span>
                          )}
                        </div>

                        {/* 현지 통화별 사용 내역 */}
                        {budgetInfo.localSpending.breakdownByCurrency.length >
                          0 && (
                          <div className='mt-4 rounded-lg bg-white/50 p-3'>
                            <Typography
                              variant='caption'
                              className='mb-2 block font-medium text-gray-700'
                            >
                              현지 통화별 사용 내역
                            </Typography>
                            <div className='space-y-2'>
                              {budgetInfo.localSpending.breakdownByCurrency.map(
                                (item, index) => (
                                  <div
                                    key={item.currency}
                                    className='flex items-center justify-between'
                                  >
                                    <div className='flex items-center space-x-2'>
                                      <div
                                        className={`h-2 w-2 rounded-full ${
                                          [
                                            'bg-blue-500',
                                            'bg-green-500',
                                            'bg-purple-500',
                                            'bg-orange-500',
                                          ][index % 4]
                                        }`}
                                      ></div>
                                      <Typography
                                        variant='caption'
                                        className='font-medium text-gray-700'
                                      >
                                        {item.formattedAmount}
                                      </Typography>
                                    </div>
                                    <Typography
                                      variant='caption'
                                      className='text-gray-500'
                                    >
                                      = {item.formattedConvertedAmount}
                                    </Typography>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* 공동 할 일 */}
            <SharedTodoWidget planId={planId} participants={participants} />

            {/* 토론 중인 항목 */}
            {hotTopics.length > 0 && (
              <div className='w-full rounded-xl bg-white p-3 shadow-sm sm:rounded-2xl sm:p-4 md:p-5 lg:p-6'>
                <div className='mb-4 flex items-center space-x-2'>
                  <IoChatbubbleOutline className='h-5 w-5 text-orange-500' />
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
                      className='cursor-pointer rounded-xl border border-orange-200 bg-orange-50 p-3 transition-all hover:bg-orange-100 hover:shadow-sm sm:p-4'
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
