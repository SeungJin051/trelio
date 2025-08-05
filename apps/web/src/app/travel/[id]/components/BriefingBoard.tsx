'use client';

import { useEffect, useState } from 'react';

import {
  IoAddOutline,
  IoCalendarOutline,
  IoChatbubbleOutline,
  IoCheckmarkCircleOutline,
  IoDownloadOutline,
  IoLocationOutline,
  IoPeopleOutline,
  IoSettingsOutline,
  IoTimeOutline,
  IoWalletOutline,
} from 'react-icons/io5';

import { Avatar, Badge, Button, Progress, Typography } from '@ui/components';

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
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  participants: Participant[];
  totalBudget: number;
  currency: string;
  readinessScore: number;
  hotTopics: Array<{
    id: string;
    title: string;
    commentCount: number;
    blockId: string;
  }>;
  todos: Array<{
    id: string;
    title: string;
    isCompleted: boolean;
    assigneeId?: string;
    assigneeName?: string;
    assigneeAvatar?: string;
    createdAt: string;
  }>;
  onInviteParticipants: () => void;
  onExport: () => void;
  onSettings: () => void;
  onBlockClick: (blockId: string) => void;
  onHotTopicClick: (blockId: string) => void;
  onBudgetClick?: () => void;
  onReadinessClick?: () => void;
  onAddTodo: (title: string) => void;
  onToggleTodo: (id: string) => void;
  onAssignTodo: (todoId: string, assigneeId: string) => void;
  onDeleteTodo: (id: string) => void;
}

export const BriefingBoard: React.FC<BriefingBoardProps> = ({
  title,
  location,
  startDate,
  endDate,
  participants,
  totalBudget,
  currency,
  readinessScore,
  hotTopics,
  todos,
  onInviteParticipants,
  onExport,
  onSettings,
  onBlockClick,
  onHotTopicClick,
  onBudgetClick,
  onReadinessClick,
  onAddTodo,
  onToggleTodo,
  onAssignTodo,
  onDeleteTodo,
}) => {
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
    <div className='h-full overflow-y-auto bg-gray-50 p-6'>
      <div className='mx-auto max-w-4xl space-y-6'>
        {/* 헤더 섹션 */}
        <div className='rounded-2xl bg-white p-6 shadow-sm'>
          <div className='flex items-start justify-between'>
            <div className='space-y-2'>
              <Typography variant='h4' className='font-bold text-gray-900'>
                {title}
              </Typography>
              <div className='flex items-center space-x-4 text-sm text-gray-600'>
                <div className='flex items-center space-x-1'>
                  <IoCalendarOutline className='h-4 w-4' />
                  <span>
                    {getTripDuration()} {location}
                  </span>
                </div>
                <div className='flex items-center space-x-1'>
                  <IoTimeOutline className='h-4 w-4' />
                  <span>
                    {new Date(startDate).toLocaleDateString()} -{' '}
                    {new Date(endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* D-Day 카운터 */}
            <div className='rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 text-white shadow-lg'>
              <Typography variant='h3' className='font-bold'>
                {getDDay()}
              </Typography>
              <Typography variant='caption' className='text-blue-100'>
                여행까지 남은 시간
              </Typography>
            </div>
          </div>

          {/* 날씨 정보 */}
          {/* Removed weather display */}
        </div>

        {/* 실시간 현황과 핵심 요약 그리드 */}
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          {/* 좌측 컬럼 - 사람과 활동 */}
          <div className='space-y-6'>
            {/* 참여자 섹션 */}
            <div className='rounded-2xl bg-white p-6 shadow-sm'>
              <Typography
                variant='h6'
                className='mb-4 font-semibold text-gray-900'
              >
                참여자
              </Typography>

              {/* 참여자 아바타 목록 */}
              <div className='flex items-center gap-2'>
                {participants.map((participant, index) => (
                  <div key={participant.id} className='group relative'>
                    <div className='relative'>
                      <Avatar
                        src={participant.profile_image_url}
                        alt={participant.nickname}
                        size='medium'
                        className={`transition-all duration-200 hover:scale-110 ${
                          participant.isOnline
                            ? 'ring-2 ring-green-400'
                            : 'ring-2 ring-gray-200'
                        }`}
                      />
                      {participant.isOnline && (
                        <div className='absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-green-400'></div>
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
              <div className='mt-3 flex flex-wrap gap-2'>
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
            <div className='rounded-2xl bg-white p-6 shadow-sm'>
              <Typography
                variant='h6'
                className='mb-4 font-semibold text-gray-900'
              >
                빠른 액션
              </Typography>
              <div className='grid grid-cols-1 gap-3'>
                <Button
                  onClick={onInviteParticipants}
                  colorTheme='blue'
                  size='medium'
                  className='h-14 w-full justify-start rounded-xl shadow-sm transition-all duration-200 hover:shadow-md'
                  leftIcon={<IoAddOutline className='h-5 w-5' />}
                >
                  <div className='ml-3 text-left'>
                    <div className='font-semibold'>동반자 초대하기</div>
                    <div className='text-xs text-blue-100'>
                      새로운 여행 친구를 초대하세요
                    </div>
                  </div>
                </Button>
                <div className='grid grid-cols-2 gap-3'>
                  <Button
                    onClick={onExport}
                    colorTheme='gray'
                    size='medium'
                    className='h-12 w-full justify-start rounded-xl shadow-sm transition-all duration-200 hover:shadow-md'
                    leftIcon={<IoDownloadOutline className='h-4 w-4' />}
                  >
                    <span className='ml-2 text-sm'>내보내기</span>
                  </Button>
                  <Button
                    onClick={onSettings}
                    colorTheme='gray'
                    size='medium'
                    className='h-12 w-full justify-start rounded-xl shadow-sm transition-all duration-200 hover:shadow-md'
                    leftIcon={<IoSettingsOutline className='h-4 w-4' />}
                  >
                    <span className='ml-2 text-sm'>설정</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* 최근 변경사항 */}
            <div className='rounded-2xl bg-white p-6 shadow-sm'>
              <Typography
                variant='h6'
                className='mb-4 font-semibold text-gray-900'
              >
                최근 변경사항
              </Typography>
              <div className='space-y-3'>
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
          <div className='space-y-6'>
            {/* 여행 준비율 */}
            <div className='rounded-2xl bg-white p-6 shadow-sm'>
              <div className='mb-4 flex items-center justify-between'>
                <Typography
                  variant='h6'
                  className='font-semibold text-gray-900'
                >
                  여행 준비율
                </Typography>
                <Typography variant='h6' className='font-bold text-blue-600'>
                  {readinessScore}%
                </Typography>
              </div>
              <button
                onClick={onReadinessClick}
                className='w-full cursor-pointer rounded-lg p-3 transition-all duration-200 hover:bg-gray-50'
                disabled={!onReadinessClick}
              >
                <Progress
                  value={readinessScore}
                  size='medium'
                  colorTheme='blue'
                />
                <div className='mt-2 flex items-center space-x-2 text-sm text-gray-500'>
                  <IoCheckmarkCircleOutline className='h-4 w-4' />
                  <span>체크리스트 {readinessScore}% 완료</span>
                  {onReadinessClick && (
                    <span className='ml-auto text-xs text-blue-500'>
                      상세보기 →
                    </span>
                  )}
                </div>
              </button>
            </div>

            {/* 예산 현황 */}
            <div className='rounded-2xl bg-white p-6 shadow-sm'>
              <Typography
                variant='h6'
                className='mb-4 font-semibold text-gray-900'
              >
                예산 현황
              </Typography>
              <button
                onClick={onBudgetClick}
                className='w-full cursor-pointer rounded-xl bg-gradient-to-r from-green-50 to-blue-50 p-4 transition-all duration-200 hover:from-green-100 hover:to-blue-100'
                disabled={!onBudgetClick}
              >
                <div className='mb-3 flex items-center justify-between'>
                  <Typography variant='h5' className='font-bold text-gray-900'>
                    {formatCurrency(totalBudget, currency as any)}
                  </Typography>
                  <IoWalletOutline className='h-5 w-5 text-green-600' />
                </div>

                {/* 프로그레스 바 */}
                <div className='mb-3'>
                  <div className='h-3 w-full rounded-full bg-gray-200'>
                    <div
                      className='h-3 rounded-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-300'
                      style={{
                        width: `${Math.min((totalBudget / 2000000) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* 예산 정보 */}
                <div className='flex items-center justify-between'>
                  <Typography
                    variant='body2'
                    className='font-medium text-gray-700'
                  >
                    {Math.round((totalBudget / 2000000) * 100)}% 사용
                  </Typography>
                  <div className='flex items-center gap-2'>
                    <Typography variant='body2' className='text-gray-600'>
                      목표: {formatCurrency(2000000, currency as any)}
                    </Typography>
                    {onBudgetClick && (
                      <span className='text-xs text-blue-500'>상세보기 →</span>
                    )}
                  </div>
                </div>
              </button>
            </div>

            {/* 공동 할 일 */}
            <SharedTodoWidget
              todos={todos}
              participants={participants}
              onAddTodo={onAddTodo}
              onToggleTodo={onToggleTodo}
              onAssignTodo={onAssignTodo}
              onDeleteTodo={onDeleteTodo}
            />

            {/* 토론 중인 항목 */}
            {hotTopics.length > 0 && (
              <div className='rounded-2xl bg-white p-6 shadow-sm'>
                <div className='mb-4 flex items-center space-x-2'>
                  <IoChatbubbleOutline className='h-5 w-5 text-orange-500' />
                  <Typography
                    variant='h6'
                    className='font-semibold text-gray-900'
                  >
                    토론 중인 항목
                  </Typography>
                </div>
                <div className='space-y-3'>
                  {hotTopics.map((topic) => (
                    <div
                      key={topic.id}
                      className='cursor-pointer rounded-xl border border-orange-200 bg-orange-50 p-4 transition-all hover:bg-orange-100 hover:shadow-sm'
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
