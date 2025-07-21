'use client';

import { useEffect, useState } from 'react';

import { useParams, useRouter } from 'next/navigation';

import {
  IoArrowBack,
  IoCalendarOutline,
  IoLocationOutline,
  IoPeopleOutline,
} from 'react-icons/io5';

import { Button, Typography } from '@ui/components';
import { Avatar } from '@ui/components';

import { useSession } from '@/hooks/useSession';
import { useToast } from '@/hooks/useToast';
import { createClient } from '@/lib/supabase/client/supabase';

interface TravelPlanDetail {
  id: string;
  title: string;
  location: string;
  start_date: string;
  end_date: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

interface Participant {
  id: string;
  role: 'owner' | 'editor' | 'viewer';
  joined_at: string;
  user_id: string;
}

const TravelDetailView = () => {
  const params = useParams();
  const router = useRouter();
  const { userProfile } = useSession();
  const toast = useToast();
  const supabase = createClient();

  const [travelPlan, setTravelPlan] = useState<TravelPlanDetail | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const travelId = params.id as string;

  // 여행 계획 상세 정보 가져오기
  const fetchTravelDetail = async () => {
    if (!userProfile || !travelId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // 여행 계획 기본 정보
      const { data: planData, error: planError } = await supabase
        .from('travel_plans')
        .select('*')
        .eq('id', travelId)
        .single();

      if (planError || !planData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      // 접근 권한 확인 (소유자만 일단)
      if (planData.owner_id !== userProfile.id) {
        toast.error('이 여행 계획에 접근할 권한이 없습니다.');
        router.push('/');
        return;
      }

      setTravelPlan(planData);

      // 참여자 정보
      const { data: participantsData, error: participantsError } =
        await supabase
          .from('travel_plan_participants')
          .select('*')
          .eq('plan_id', travelId);

      if (!participantsError && participantsData) {
        setParticipants(participantsData);
      }
    } catch (error) {
      toast.error('여행 정보를 불러오는 중 오류가 발생했습니다.');
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTravelDetail();
  }, [userProfile, travelId]);

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  };

  // 여행 기간 계산
  const calculateDays = () => {
    if (!travelPlan) return 0;
    const start = new Date(travelPlan.start_date);
    const end = new Date(travelPlan.end_date);
    return (
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    );
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent'></div>
          <Typography variant='body1' className='text-gray-600'>
            여행 정보를 불러오는 중...
          </Typography>
        </div>
      </div>
    );
  }

  // 404 상태
  if (notFound || !travelPlan) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <Typography variant='h3' className='mb-4 text-gray-900'>
            여행을 찾을 수 없습니다
          </Typography>
          <Typography variant='body1' className='mb-6 text-gray-600'>
            요청하신 여행 계획이 존재하지 않거나 접근 권한이 없습니다.
          </Typography>
          <Button onClick={() => router.push('/')} colorTheme='blue'>
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-full bg-gray-50'>
      <div className='border-b border-gray-200 bg-white'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between py-6'>
            <div className='flex items-center space-x-4'>
              <Button
                variant='ghost'
                size='small'
                onClick={() => router.back()}
                leftIcon={<IoArrowBack className='h-4 w-4' />}
              >
                뒤로가기
              </Button>
              <div>
                <Typography
                  variant='h5'
                  weight='semiBold'
                  className='text-gray-900'
                >
                  {travelPlan.title}
                </Typography>
                <Typography variant='caption' className='text-gray-500'>
                  {travelPlan.location}
                </Typography>
              </div>
            </div>

            <div className='flex items-center space-x-3'>
              <Button variant='outlined' size='small'>
                편집
              </Button>
              <Button colorTheme='blue' size='small'>
                공유
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className='mx-auto max-w-7xl px-4 pb-8 pt-8 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
          {/* 왼쪽: 여행 정보 */}
          <div className='space-y-6 lg:col-span-2'>
            {/* 여행 기본 정보 카드 */}
            <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
              <Typography
                variant='h6'
                weight='semiBold'
                className='mb-4 text-gray-900'
              >
                여행 정보
              </Typography>

              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div className='flex items-center space-x-3'>
                  <IoLocationOutline className='h-5 w-5 text-gray-400' />
                  <div>
                    <Typography variant='caption' className='text-gray-500'>
                      여행지
                    </Typography>
                    <Typography
                      variant='body2'
                      weight='medium'
                      className='text-gray-900'
                    >
                      {travelPlan.location}
                    </Typography>
                  </div>
                </div>

                <div className='flex items-center space-x-3'>
                  <IoCalendarOutline className='h-5 w-5 text-gray-400' />
                  <div>
                    <Typography variant='caption' className='text-gray-500'>
                      여행 기간
                    </Typography>
                    <Typography
                      variant='body2'
                      weight='medium'
                      className='text-gray-900'
                    >
                      {calculateDays()}일
                    </Typography>
                  </div>
                </div>
              </div>

              <div className='mt-6 border-t border-gray-100 pt-6'>
                <div className='space-y-3'>
                  <div>
                    <Typography variant='caption' className='text-gray-500'>
                      시작일
                    </Typography>
                    <Typography variant='body2' className='text-gray-900'>
                      {formatDate(travelPlan.start_date)}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant='caption' className='text-gray-500'>
                      종료일
                    </Typography>
                    <Typography variant='body2' className='text-gray-900'>
                      {formatDate(travelPlan.end_date)}
                    </Typography>
                  </div>
                </div>
              </div>
            </div>

            {/* 일정 계획 (나중에 구현) */}
            <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
              <Typography
                variant='h6'
                weight='semiBold'
                className='mb-4 text-gray-900'
              >
                여행 일정
              </Typography>
              <div className='py-12 text-center'>
                <Typography variant='body1' className='text-gray-500'>
                  여행 일정 기능은 곧 추가될 예정입니다.
                </Typography>
              </div>
            </div>
          </div>

          {/* 오른쪽: 참여자 및 부가 정보 */}
          <div className='space-y-6'>
            {/* 참여자 카드 */}
            <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
              <div className='mb-4 flex items-center space-x-2'>
                <IoPeopleOutline className='h-5 w-5 text-gray-400' />
                <Typography
                  variant='h6'
                  weight='semiBold'
                  className='text-gray-900'
                >
                  참여자 ({participants.length}명)
                </Typography>
              </div>

              <div className='space-y-3'>
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className='flex items-center justify-between'
                  >
                    <div className='flex items-center space-x-3'>
                      <Avatar
                        src={userProfile?.profile_image_url}
                        alt='참여자'
                        size='small'
                      />
                      <div>
                        <Typography
                          variant='body2'
                          weight='medium'
                          className='text-gray-900'
                        >
                          {participant.user_id === userProfile?.id
                            ? '나'
                            : '참여자'}
                        </Typography>
                        <Typography variant='caption' className='text-gray-500'>
                          {participant.role === 'owner'
                            ? '오너'
                            : participant.role === 'editor'
                              ? '편집자'
                              : '뷰어'}
                        </Typography>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button variant='outlined' className='mt-4 w-full' size='small'>
                참여자 초대하기
              </Button>
            </div>

            {/* 여행 통계 (나중에 구현) */}
            <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
              <Typography
                variant='h6'
                weight='semiBold'
                className='mb-4 text-gray-900'
              >
                여행 통계
              </Typography>
              <div className='py-8 text-center'>
                <Typography variant='body2' className='text-gray-500'>
                  여행 통계는 곧 추가될 예정입니다.
                </Typography>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelDetailView;
