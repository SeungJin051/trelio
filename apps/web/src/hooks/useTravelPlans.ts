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

export type InvitedTravelPlanItem = {
  id: string;
  title: string;
  location: string;
  start_date: string;
  end_date: string;
  created_at: string;
  role: 'editor' | 'viewer' | 'owner';
  participantCount: number;
};

// 링크 초대 방식으로 전환: pending 초대 타입 제거

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

        // travel_activities 테이블에서 활동 데이터 가져오기 (관계 없이)
        const { data: activities, error: activitiesError } = await supabase
          .from('travel_activities')
          .select('*')
          .in('plan_id', planIds)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (activitiesError) {
          console.error('Recent activities 조회 오류:', activitiesError);
          return [];
        }

        if (!activities || activities.length === 0) return [];

        // 각 활동에 대해 사용자 프로필과 여행 계획 정보를 별도로 가져오기
        const activitiesWithDetails = await Promise.all(
          activities.map(async (activity) => {
            // 사용자 프로필 정보 가져오기
            const { data: userProfile } = await supabase
              .from('user_profiles')
              .select('nickname, email')
              .eq('id', activity.user_id)
              .single();

            // 여행 계획 정보 가져오기
            const { data: travelPlan } = await supabase
              .from('travel_plans')
              .select('title')
              .eq('id', activity.plan_id)
              .single();

            return {
              id: activity.id,
              travel_plan_id: activity.plan_id, // plan_id를 travel_plan_id로 매핑
              user_id: activity.user_id,
              action_type: activity.type, // type을 action_type으로 매핑
              description: activity.content, // content를 description으로 매핑
              metadata: undefined, // metadata 컬럼이 없으므로 undefined로 정규화
              created_at: activity.created_at,
              updated_at: activity.created_at, // updated_at 컬럼이 없으므로 created_at 사용
              user: userProfile || {
                nickname: '사용자',
                email: 'unknown@example.com',
              },
              travel_plan: travelPlan || { title: '알 수 없는 여행' },
            };
          })
        );

        return activitiesWithDetails;
      } catch (err) {
        console.error('Recent activities 조회 중 예외 발생:', err);
        return []; // 에러 발생 시 빈 배열 반환
      }
    },
    enabled: !!userProfile?.id,
  });
};

export const useInvitedTravelPlans = (limit: number = 5) => {
  const { userProfile } = useSession();
  const supabase = createClient();

  return useQuery({
    queryKey: ['invited-travel-plans', userProfile?.id, limit],
    queryFn: async (): Promise<InvitedTravelPlanItem[]> => {
      if (!userProfile?.id) return [];

      // 1) 내가 참여 중이며 소유자가 아닌(plan의 참가자) 레코드 조회
      const { data: participationRows, error: participationError } =
        await supabase
          .from('travel_plan_participants')
          .select('plan_id, role')
          .eq('user_id', userProfile.id)
          .neq('role', 'owner');

      if (participationError) {
        console.error('Invited plans 참여 조회 오류:', participationError);
        return [];
      }

      if (!participationRows || participationRows.length === 0) return [];

      const planIds = Array.from(
        new Set(participationRows.map((p) => p.plan_id))
      );

      // 2) 해당 계획들의 메타 정보 조회
      const { data: plans, error: plansError } = await supabase
        .from('travel_plans')
        .select('id, title, location, start_date, end_date, created_at')
        .in('id', planIds)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (plansError) {
        console.error('Invited plans 메타 조회 오류:', plansError);
        return [];
      }

      if (!plans || plans.length === 0) return [];

      // 3) 참가자 수 계산을 위해 동일한 plan_id에 대한 참가자 전체 조회 후 집계
      const { data: allParticipants, error: allParticipantsError } =
        await supabase
          .from('travel_plan_participants')
          .select('plan_id')
          .in(
            'plan_id',
            plans.map((p) => p.id)
          );

      if (allParticipantsError) {
        console.warn('참가자 수 조회 경고:', allParticipantsError);
      }

      const participantCountMap = new Map<string, number>();
      (allParticipants || []).forEach((row) => {
        participantCountMap.set(
          row.plan_id,
          (participantCountMap.get(row.plan_id) || 0) + 1
        );
      });

      // 사용자 역할 매핑 (plan 별 내 역할)
      const roleMap = new Map<string, InvitedTravelPlanItem['role']>();
      participationRows.forEach((r) => {
        if (!roleMap.has(r.plan_id)) {
          roleMap.set(r.plan_id, r.role as InvitedTravelPlanItem['role']);
        }
      });

      return plans.map((p) => ({
        id: p.id,
        title: p.title,
        location: p.location,
        start_date: p.start_date,
        end_date: p.end_date,
        created_at: p.created_at,
        role: roleMap.get(p.id) || 'viewer',
        participantCount: participantCountMap.get(p.id) || 1,
      }));
    },
    enabled: !!userProfile?.id,
  });
};
export type AccessibleTravelPlan = {
  id: string;
  title: string;
  location: string;
  start_date: string;
  end_date: string;
  created_at: string;
};

// RLS 재귀를 피하기 위해 SECURITY DEFINER RPC 사용
export const useAccessibleTravelPlans = (limit: number = 100) => {
  const { userProfile } = useSession();
  const supabase = createClient();

  return useQuery({
    queryKey: ['accessible-travel-plans', userProfile?.id, limit],
    queryFn: async (): Promise<AccessibleTravelPlan[]> => {
      if (!userProfile?.id) return [];
      const { data, error } = await supabase.rpc(
        'fn_list_accessible_travel_plans',
        { p_user_id: userProfile.id, p_limit: limit }
      );
      if (error) {
        console.error('[useAccessibleTravelPlans] RPC error:', error);
        return [];
      }
      return (data || []).map((row: any) => ({
        id: String(row.id),
        title: String(row.title),
        location: String(row.location),
        start_date: String(row.start_date),
        end_date: String(row.end_date),
        created_at: String(row.created_at),
      }));
    },
    enabled: !!userProfile?.id,
    // 최적화: 과도한 refetch 방지 (필요 시 Sidebar에서 refetch 호출)
    staleTime: 30_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

// 초대 대기 목록 조회 (travel_plan_invitations 테이블 가정)
