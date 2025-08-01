/**
 * 여행 계획 관련 React Query 훅 모음
 *
 * 포함된 훅들:
 *
 * 1. useUpcomingTravel()
 *    - 사용자의 가장 가까운 예정된 여행 1개를 가져옴
 *    - 참여자 정보와 프로필까지 포함하여 반환
 *    - 사용처: NextTravelWidget 컴포넌트
 *
 * 2. useRecentActivities(limit)
 *    - 사용자가 참여한 여행의 최근 활동 내역을 가져옴
 *    - travel_activities 테이블이 필요 (현재 선택적)
 *    - 사용처: RecentActivitiesWidget 컴포넌트
 *
 *
 * 1. 로그인 후 대시보드 진입
 *    ├── NextTravelWidget: useUpcomingTravel() 호출
 *    │   └── 다가오는 여행 정보 표시 (D-Day, 참여자 등)
 *    └── RecentActivitiesWidget: useRecentActivities() 호출
 *        └── 최근 협업 활동 표시 (일정변경, 예산수정 등)
 *
 * 2. 여행 계획 목록 보기
 *    └── TravelPlansList: 자체 쿼리 사용
 *        └── 전체/진행중/완료 필터링, 검색, 정렬
 *
 */
import { useQuery } from '@tanstack/react-query';

import { createClient } from '@/lib/supabase/client/supabase';
import type { Activity, TravelPlan } from '@/types/travel';

import { useSession } from './useSession';

export const useUpcomingTravel = () => {
  const { userProfile } = useSession();
  const supabase = createClient();

  return useQuery({
    queryKey: ['upcoming-travel', userProfile?.id],
    queryFn: async (): Promise<TravelPlan | null> => {
      if (!userProfile?.id) {
        return null;
      }

      const today = new Date().toISOString().split('T')[0];

      // 1단계: 사용자가 참여한 여행 계획 ID들 가져오기
      const { data: participations, error: participationError } = await supabase
        .from('travel_plan_participants')
        .select('plan_id, role')
        .eq('user_id', userProfile.id);

      if (participationError) {
        throw participationError;
      }

      if (!participations || participations.length === 0) {
        return null;
      }

      const planIds = participations.map((p) => p.plan_id);

      // 2단계: 예정된 여행 계획 가져오기
      const { data: travelPlan, error: planError } = await supabase
        .from('travel_plans')
        .select('*')
        .in('id', planIds)
        .gte('start_date', today)
        .order('start_date', { ascending: true })
        .limit(5)
        .single();

      if (planError && planError.code !== 'PGRST116') {
        throw planError;
      }

      if (!travelPlan) {
        return null;
      }

      // 3단계: 참여자 정보 가져오기
      const { data: planParticipants, error: participantsError } =
        await supabase
          .from('travel_plan_participants')
          .select('id, user_id, role, joined_at')
          .eq('plan_id', travelPlan.id);

      if (participantsError) {
        throw participantsError;
      }

      // 4단계: 참여자의 프로필 정보 가져오기
      const participantsWithProfiles = [];
      if (planParticipants && planParticipants.length > 0) {
        for (const participant of planParticipants) {
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('id, nickname, email, profile_image_url')
            .eq('id', participant.user_id)
            .single();

          if (!profileError && profile) {
            participantsWithProfiles.push({
              id: participant.id,
              user_id: participant.user_id,
              role: participant.role,
              joined_at: participant.joined_at,
              user: profile,
            });
          } else {
            // 프로필이 없으면 기본 정보로 추가
            participantsWithProfiles.push({
              id: participant.id,
              user_id: participant.user_id,
              role: participant.role,
              joined_at: participant.joined_at,
              user: {
                id: participant.user_id,
                nickname: '사용자',
                email: 'unknown@example.com',
                profile_image_url: null,
              },
            });
          }
        }
      }

      return {
        ...travelPlan,
        participants: participantsWithProfiles,
      };
    },
    enabled: !!userProfile?.id,
    retry: 1,
  });
};

export const useRecentActivities = (limit: number = 10) => {
  const { userProfile } = useSession();
  const supabase = createClient();

  return useQuery({
    queryKey: ['recent-activities', userProfile?.id, limit],
    queryFn: async (): Promise<Activity[]> => {
      if (!userProfile?.id) return [];

      try {
        // 먼저 사용자가 참여한 여행 계획 ID들을 가져옵니다
        const { data: participantData } = await supabase
          .from('travel_plan_participants')
          .select('plan_id')
          .eq('user_id', userProfile.id);

        if (!participantData || participantData.length === 0) return [];

        const planIds = participantData.map((p) => p.plan_id);

        // travel_activities 테이블에서 활동 데이터 가져오기
        const { data, error } = await supabase
          .from('travel_activities')
          .select(
            `
            *,
            user_profiles(nickname, email),
            travel_plans(title)
          `
          )
          .in('travel_plan_id', planIds)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) {
          return [];
        }

        return (
          (data?.map((activity: Record<string, unknown>) => ({
            id: activity.id,
            travel_plan_id: activity.travel_plan_id,
            user_id: activity.user_id,
            action_type: activity.action_type,
            description: activity.description,
            metadata: activity.metadata,
            created_at: activity.created_at,
            updated_at: activity.updated_at,
            user: activity.user_profiles,
            travel_plan: activity.travel_plans,
          })) as Activity[]) || []
        );
      } catch (err) {
        return []; // 에러 발생 시 빈 배열 반환
      }
    },
    enabled: !!userProfile?.id,
  });
};
