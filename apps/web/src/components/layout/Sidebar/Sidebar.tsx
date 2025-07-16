'use client';

import { useState } from 'react';

import Link from 'next/link';

import { AnimatePresence, motion } from 'framer-motion';
import { HiOutlineMenu, HiOutlineMenuAlt2 } from 'react-icons/hi';
import { IoSearch } from 'react-icons/io5';
import {
  MdOutlineAccessTime,
  MdOutlineCheckCircle,
  MdOutlineDateRange,
  MdOutlineList,
} from 'react-icons/md';

import { Avatar, Badge, Icon } from '@ui/components';
import { Typography } from '@ui/components/typography';

interface TravelPlan {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  status: 'all' | 'in-progress' | 'completed';
  participantAvatars: string[];
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

// 임시 여행 계획 데이터
const mockTravelPlans: TravelPlan[] = [
  {
    id: '1',
    title: '제주도 여행',
    startDate: '2024-03-15',
    endDate: '2024-03-18',
    status: 'in-progress',
    participantAvatars: ['/avatar1.jpg', '/avatar2.jpg'],
  },
  {
    id: '2',
    title: '부산 바다 여행',
    startDate: '2024-02-10',
    endDate: '2024-02-13',
    status: 'completed',
    participantAvatars: ['/avatar1.jpg'],
  },
  {
    id: '3',
    title: '강릉 겨울 여행',
    startDate: '2024-04-01',
    endDate: '2024-04-03',
    status: 'all',
    participantAvatars: ['/avatar1.jpg', '/avatar2.jpg', '/avatar3.jpg'],
  },
];

const filterOptions = [
  { key: 'all', label: '전체', icon: MdOutlineList },
  { key: 'in-progress', label: '진행 중', icon: MdOutlineAccessTime },
  { key: 'completed', label: '완료', icon: MdOutlineCheckCircle },
] as const;

// Claude 스타일 애니메이션 설정
const sidebarVariants = {
  open: {
    width: 320,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 40,
      mass: 1,
    },
  },
  closed: {
    width: 64,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 40,
      mass: 1,
    },
  },
};

const contentVariants = {
  open: {
    opacity: 1,
    x: 0,
    transition: {
      delay: 0.15,
      duration: 0.25,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  closed: {
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.15,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const mobileVariants = {
  open: {
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  closed: {
    x: '-100%',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
};

const overlayVariants = {
  open: {
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
  closed: {
    opacity: 0,
    transition: {
      duration: 0.15,
    },
  },
};

export const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'in-progress' | 'completed'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 필터링된 여행 계획
  const filteredPlans = mockTravelPlans.filter((plan) => {
    const matchesFilter =
      activeFilter === 'all' || plan.status === activeFilter;
    const matchesSearch = plan.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      {/* 모바일 오버레이 (사이드바가 열렸을 때만) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={overlayVariants}
            initial='closed'
            animate='open'
            exit='closed'
            className='fixed inset-0 z-30 bg-black/20 backdrop-blur-sm sm:hidden'
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* 사이드바 (모바일 + 데스크톱) */}
      <div>
        <motion.div
          variants={sidebarVariants}
          initial={false}
          animate={isOpen ? 'open' : 'closed'}
          className='fixed left-0 top-0 z-40 h-screen overflow-hidden border-r border-gray-200 bg-white shadow-lg'
        >
          <AnimatePresence mode='wait'>
            {isOpen ? (
              <motion.div
                key='open'
                variants={contentVariants}
                initial='closed'
                animate='open'
                exit='closed'
                className='flex h-full w-80 flex-col'
              >
                {/* 헤더 */}
                <div className='flex items-center justify-between border-b border-gray-200 px-6 py-6'>
                  <Typography
                    variant='h6'
                    weight='semiBold'
                    className='text-gray-900'
                  >
                    내 여행 계획
                  </Typography>
                  <button
                    onClick={onToggle}
                    className='rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100'
                    title='사이드바 닫기'
                  >
                    <Icon as={HiOutlineMenuAlt2} size={18} />
                  </button>
                </div>

                {/* 필터 */}
                <div className='border-b border-gray-200 px-6 py-4'>
                  <div className='flex space-x-2'>
                    {filterOptions.map((option) => (
                      <motion.button
                        key={option.key}
                        onClick={() => setActiveFilter(option.key)}
                        className='flex-1'
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Badge
                          colorTheme={
                            activeFilter === option.key ? 'blue' : 'gray'
                          }
                          size='medium'
                          variant={
                            activeFilter === option.key ? 'filled' : 'outlined'
                          }
                        >
                          <div className='flex items-center space-x-1'>
                            <Icon as={option.icon} size={14} />
                            <span>{option.label}</span>
                          </div>
                        </Badge>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* 검색 */}
                <div className='border-b border-gray-200 px-6 py-4'>
                  <div className='relative'>
                    <Icon
                      as={IoSearch}
                      size={18}
                      className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
                    />
                    <input
                      type='text'
                      placeholder='여행 계획 검색...'
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className='w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-[#3182F6] focus:bg-white focus:outline-none'
                    />
                  </div>
                </div>

                {/* 여행 계획 목록 */}
                <div className='flex-1 overflow-y-auto px-6 py-4'>
                  <div className='space-y-3'>
                    {filteredPlans.length > 0 ? (
                      filteredPlans.map((plan, index) => (
                        <motion.div
                          key={plan.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Link
                            href={`/travel/${plan.id}`}
                            className='block rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50 hover:shadow-sm'
                          >
                            <div className='mb-3'>
                              <Typography
                                variant='body1'
                                weight='semiBold'
                                className='line-clamp-1 text-gray-900'
                              >
                                {plan.title}
                              </Typography>
                            </div>

                            <div className='mb-3 flex items-center space-x-2 text-gray-600'>
                              <Icon as={MdOutlineDateRange} size={16} />
                              <Typography
                                variant='body2'
                                className='text-gray-600'
                              >
                                {formatDate(plan.startDate)} -{' '}
                                {formatDate(plan.endDate)}
                              </Typography>
                            </div>

                            <div className='flex items-center justify-between'>
                              {/* 참여자 아바타 */}
                              <div className='flex -space-x-2'>
                                {plan.participantAvatars
                                  .slice(0, 3)
                                  .map((avatar, index) => (
                                    <Avatar
                                      key={index}
                                      src={avatar}
                                      alt={`참여자 ${index + 1}`}
                                      size='small'
                                    />
                                  ))}
                                {plan.participantAvatars.length > 3 && (
                                  <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600 ring-2 ring-white'>
                                    +{plan.participantAvatars.length - 3}
                                  </div>
                                )}
                              </div>

                              {/* 상태 뱃지 */}
                              <div
                                className={`rounded-full px-2 py-1 text-xs font-medium ${
                                  plan.status === 'completed'
                                    ? 'bg-green-100 text-green-700'
                                    : plan.status === 'in-progress'
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {plan.status === 'completed'
                                  ? '완료'
                                  : plan.status === 'in-progress'
                                    ? '진행 중'
                                    : '예정'}
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      ))
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='flex flex-col items-center justify-center py-12 text-center'
                      >
                        <div className='mb-4 rounded-full bg-gray-100 p-6'>
                          <Icon
                            as={MdOutlineList}
                            size={32}
                            className='text-gray-400'
                          />
                        </div>
                        <Typography
                          variant='body1'
                          weight='medium'
                          className='mb-2 text-gray-500'
                        >
                          여행 계획이 없습니다
                        </Typography>
                        <Typography variant='body2' className='text-gray-400'>
                          새로운 여행 계획을 만들어보세요
                        </Typography>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key='closed'
                className='flex h-full w-16 flex-col items-center py-4'
              >
                <button
                  onClick={onToggle}
                  className='rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100'
                  title='사이드바 열기'
                >
                  <Icon as={HiOutlineMenu} size={24} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
};

Sidebar.displayName = 'Sidebar';
