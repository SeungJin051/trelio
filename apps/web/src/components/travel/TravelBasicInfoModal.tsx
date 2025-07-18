'use client';

import React, { useState } from 'react';

import { useRouter } from 'next/navigation';

import { IoCopyOutline, IoLinkOutline, IoPersonOutline } from 'react-icons/io5';
import { v4 as uuidv4 } from 'uuid';

import { Button, Input, Switch, Typography } from '@ui/components';

import { Modal } from '@/components/basic';
import { useSession } from '@/hooks/useSession';
import { useToast } from '@/hooks/useToast';
import { createClient } from '@/lib/supabase/client/supabase';

import TravelDatePicker from './DatePicker';
import LocationInput from './LocationInput';

interface TravelBasicInfo {
  title: string;
  location: string;
  startDate: Date | null;
  endDate: Date | null;
  allowEdit: boolean;
}

interface TravelBasicInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TravelBasicInfoModal: React.FC<TravelBasicInfoModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { userProfile } = useSession();
  const router = useRouter();
  const toast = useToast();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [basicInfo, setBasicInfo] = useState<TravelBasicInfo>({
    title: '',
    location: '',
    startDate: null,
    endDate: null,
    allowEdit: true, // 기본값: 편집 가능
  });

  const [errors, setErrors] = useState<{
    title?: string;
    location?: string;
    dates?: string;
  }>({});

  // 유효성 검사
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!basicInfo.title.trim()) {
      newErrors.title = '여행 제목을 입력해주세요.';
    } else if (basicInfo.title.trim().length > 50) {
      newErrors.title = '여행 제목은 50자 이내로 입력해주세요.';
    }

    if (!basicInfo.location.trim()) {
      newErrors.location = '나라 및 지역을 입력해주세요.';
    }

    if (!basicInfo.startDate || !basicInfo.endDate) {
      newErrors.dates = '여행 시작일과 종료일을 선택해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 중복 제목 체크
  const checkDuplicateTitle = async (title: string): Promise<boolean> => {
    if (!userProfile) return false;

    try {
      const { data, error } = await supabase
        .from('travel_plans')
        .select('id')
        .eq('owner_id', userProfile.id)
        .eq('title', title.trim())
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116: 데이터가 없음 (중복 없음)
        console.error('Title duplication check failed:', error);
        return false;
      }

      return !!data; // 데이터가 있으면 중복
    } catch (error) {
      console.error('Title duplication check error:', error);
      return false;
    }
  };

  // 여행 계획 생성
  const handleCreateTrip = async () => {
    if (!userProfile) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    if (!validateForm()) {
      toast.error('입력 정보를 확인해주세요.');
      return;
    }

    setLoading(true);

    try {
      // 중복 제목 체크
      const isDuplicate = await checkDuplicateTitle(basicInfo.title);
      if (isDuplicate) {
        setErrors({ title: '이미 같은 제목의 여행이 있습니다.' });
        toast.error('이미 같은 제목의 여행이 있습니다.');
        setLoading(false);
        return;
      }

      // 공유 링크 ID 생성
      const shareLinkId = uuidv4();

      // 여행 계획 생성
      const { data: travelPlan, error: planError } = await supabase
        .from('travel_plans')
        .insert({
          owner_id: userProfile.id,
          title: basicInfo.title.trim(),
          location: basicInfo.location.trim(),
          start_date: basicInfo.startDate!.toISOString().split('T')[0],
          end_date: basicInfo.endDate!.toISOString().split('T')[0],
          share_link_id: shareLinkId,
          default_permission: basicInfo.allowEdit ? 'editor' : 'viewer',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (planError) {
        console.error('Travel plan creation failed:', planError);
        toast.error('여행 계획 생성에 실패했습니다.');
        return;
      }

      // 참여자 레코드 생성 (오너)
      const { error: participantError } = await supabase
        .from('travel_plan_participants')
        .insert({
          plan_id: travelPlan.id,
          user_id: userProfile.id,
          role: 'owner',
          joined_at: new Date().toISOString(),
        });

      if (participantError) {
        console.error('Participant creation failed:', participantError);
        // 여행 계획은 생성되었으므로 에러 로그만 남기고 계속 진행
      }

      toast.success('여행 계획이 생성되었습니다!');

      // 모달 닫기
      onClose();

      // 여행 계획 상세 페이지로 이동
      router.push(`/travel/${travelPlan.id}`);
    } catch (error) {
      console.error('Travel creation error:', error);
      toast.error('여행 계획 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 공유 링크 복사
  const handleCopyShareLink = () => {
    if (!userProfile) return;

    // 임시 공유 링크 (실제로는 여행 계획 생성 후 제공)
    const shareLink = `${window.location.origin}/travel/join/temp-link`;

    navigator.clipboard
      .writeText(shareLink)
      .then(() => {
        toast.success('링크가 복사되었습니다.');
      })
      .catch(() => {
        toast.error('링크 복사에 실패했습니다.');
      });
  };

  const canProceed =
    basicInfo.title.trim() &&
    basicInfo.location.trim() &&
    basicInfo.startDate &&
    basicInfo.endDate;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='새 여행 계획 시작하기'
      width='lg'
    >
      <div className='p-6'>
        <Typography variant='body2' className='mb-8 text-center text-gray-500'>
          새로운 여행의 기본적인 정보를 입력해주세요.
        </Typography>

        <div className='space-y-6'>
          {/* 여행 기본 정보 섹션 */}
          <div>
            <Typography
              variant='h6'
              weight='semiBold'
              className='mb-4 text-gray-900'
            >
              여행 기본 정보
            </Typography>

            <div className='space-y-4'>
              {/* 여행 제목 */}
              <Input
                label='여행 제목'
                placeholder='예: 제주도 힐링 여행, 유럽 배낭여행'
                value={basicInfo.title}
                onChange={(e) => {
                  setBasicInfo((prev) => ({ ...prev, title: e.target.value }));
                  if (errors.title) {
                    setErrors((prev) => ({ ...prev, title: undefined }));
                  }
                }}
                errorText={errors.title}
                maxLength={50}
              />

              {/* 나라 및 지역 */}
              <LocationInput
                label='나라 및 지역'
                value={basicInfo.location}
                onChange={(value) => {
                  setBasicInfo((prev) => ({ ...prev, location: value }));
                  if (errors.location) {
                    setErrors((prev) => ({ ...prev, location: undefined }));
                  }
                }}
                errorText={errors.location}
              />

              {/* 여행 날짜 */}
              <TravelDatePicker
                label='여행 기간'
                startDate={basicInfo.startDate}
                endDate={basicInfo.endDate}
                onDateChange={(startDate, endDate) => {
                  setBasicInfo((prev) => ({ ...prev, startDate, endDate }));
                  if (errors.dates) {
                    setErrors((prev) => ({ ...prev, dates: undefined }));
                  }
                }}
                errorText={errors.dates}
              />
            </div>
          </div>

          {/* 참여자 설정 섹션 */}
          <div>
            <Typography
              variant='h6'
              weight='semiBold'
              className='mb-4 text-gray-900'
            >
              참여자 설정
            </Typography>

            <div className='space-y-4'>
              {/* 만드는 사람 (오너) */}
              <div className='rounded-lg border border-gray-200 p-4'>
                <div className='flex items-center'>
                  <IoPersonOutline className='mr-3 h-5 w-5 text-gray-400' />
                  <div className='flex-1'>
                    <Typography
                      variant='body2'
                      weight='medium'
                      className='text-gray-900'
                    >
                      {userProfile?.nickname || userProfile?.email || '사용자'}
                    </Typography>
                    <Typography variant='caption' className='text-blue-600'>
                      오너
                    </Typography>
                  </div>
                </div>
              </div>

              {/* 친구 초대하기 */}
              <div>
                <Typography
                  variant='body2'
                  weight='medium'
                  className='mb-2 text-gray-700'
                >
                  친구 초대하기
                </Typography>
                <Typography
                  variant='caption'
                  className='mb-3 block text-gray-500'
                >
                  아래 공유 링크를 친구에게 전달하여 여행 계획에 초대할 수
                  있습니다.
                </Typography>

                <div className='flex space-x-2'>
                  <div className='flex-1'>
                    <Input
                      value='여행 계획 생성 후 링크가 제공됩니다'
                      readOnly
                      disabled
                      leftIcon={<IoLinkOutline className='h-4 w-4' />}
                    />
                  </div>
                  <Button
                    variant='outlined'
                    onClick={handleCopyShareLink}
                    disabled={true} // 여행 계획 생성 전에는 비활성화
                    leftIcon={<IoCopyOutline className='h-4 w-4' />}
                  >
                    복사
                  </Button>
                </div>
              </div>

              {/* 초대된 사용자 기본 권한 */}
              <div>
                <div className='flex items-center justify-between'>
                  <div>
                    <Typography
                      variant='body2'
                      weight='medium'
                      className='text-gray-700'
                    >
                      초대된 사용자 기본 권한
                    </Typography>
                    <Typography variant='caption' className='text-gray-500'>
                      초대된 친구들이 이 여행 계획을 수정할 수 있도록
                      허용할까요?
                    </Typography>
                  </div>
                  <Switch
                    checked={basicInfo.allowEdit}
                    onChange={(checked) =>
                      setBasicInfo((prev) => ({ ...prev, allowEdit: checked }))
                    }
                    label={basicInfo.allowEdit ? '편집 가능' : '보기만 가능'}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className='mt-8 flex space-x-3'>
          <Button
            variant='outlined'
            colorTheme='gray'
            onClick={onClose}
            className='flex-1'
          >
            취소
          </Button>
          <Button
            variant='filled'
            colorTheme='blue'
            onClick={handleCreateTrip}
            disabled={!canProceed || loading}
            className='flex-1'
          >
            {loading ? '여행 만드는 중...' : '여행 만들기'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TravelBasicInfoModal;
