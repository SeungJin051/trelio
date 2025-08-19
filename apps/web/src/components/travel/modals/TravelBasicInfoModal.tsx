'use client';

import React, { useState } from 'react';

import { useRouter } from 'next/navigation';

import { IoCopyOutline, IoLinkOutline, IoPersonOutline } from 'react-icons/io5';
import { v4 as uuidv4 } from 'uuid';

import { Button, Input, Switch, Typography } from '@ui/components';

import { Modal } from '@/components/basic';
import { countriesISO } from '@/components/travel/constants/countries';
import LocationInput from '@/components/travel/inputs/LocationInput';
import TravelDatePicker from '@/components/travel/inputs/TravelDatePicker';
import { useSession } from '@/hooks/useSession';
import { useToast } from '@/hooks/useToast';
import { createClient } from '@/lib/supabase/client/supabase';

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
  const { userProfile, session } = useSession();
  const router = useRouter();
  const toast = useToast();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [basicInfo, setBasicInfo] = useState<TravelBasicInfo>({
    title: '',
    location: '',
    startDate: null,
    endDate: null,
    allowEdit: true,
  });

  const [errors, setErrors] = useState<{
    title?: string;
    location?: string;
    dates?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    if (!basicInfo.title.trim()) {
      newErrors.title = '여행 제목을 입력해주세요.';
    } else if (basicInfo.title.trim().length > 50) {
      newErrors.title = '여행 제목은 50자 이내로 입력해주세요.';
    }
    if (!basicInfo.location.trim()) {
      newErrors.location = '나라(국가)를 입력해주세요.';
    } else {
      const normalize = (s: string) => s.trim().toLowerCase();
      const input = normalize(basicInfo.location);
      const isValidCountry = countriesISO.some(
        (c) => normalize(c.nameKo) === input || normalize(c.nameEn) === input
      );
      if (!isValidCountry) {
        newErrors.location = '국가 목록에서 정확한 국가를 선택해주세요.';
      }
    }
    if (!basicInfo.startDate || !basicInfo.endDate) {
      newErrors.dates = '여행 시작일과 종료일을 선택해주세요.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkDuplicateTitle = async (title: string): Promise<boolean> => {
    if (!session?.user) return false;
    try {
      const { data, error } = await supabase
        .from('travel_plans')
        .select('id')
        .eq('owner_id', session.user.id)
        .eq('title', title.trim())
        .single();
      if (error && error.code !== 'PGRST116') {
        console.error('Title duplication check failed:', error);
        return false;
      }
      return !!data;
    } catch (error) {
      console.error('Title duplication check error:', error);
      return false;
    }
  };

  const handleCreateTrip = async () => {
    if (!session?.user) {
      toast.error('로그인이 필요합니다.');
      return;
    }
    if (!validateForm()) {
      toast.error('입력 정보를 확인해주세요.');
      return;
    }
    setLoading(true);
    try {
      const isDuplicate = await checkDuplicateTitle(basicInfo.title);
      if (isDuplicate) {
        setErrors({ title: '이미 같은 제목의 여행이 있습니다.' });
        toast.error('이미 같은 제목의 여행이 있습니다.');
        setLoading(false);
        return;
      }
      const shareLinkId = uuidv4();
      const { data: travelPlan, error: planError } = await supabase
        .from('travel_plans')
        .insert({
          owner_id: session.user.id,
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
      const { error: participantError } = await supabase
        .from('travel_plan_participants')
        .insert({
          plan_id: travelPlan.id,
          user_id: session.user.id,
          role: 'owner',
          joined_at: new Date().toISOString(),
        });
      if (participantError) {
        console.error('Participant creation failed:', participantError);
      }
      toast.success('여행 계획이 생성되었습니다!');
      onClose();
      router.push('/');
    } catch (error) {
      toast.error('여행 계획 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
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
      width='responsive'
    >
      <div className='flex flex-col'>
        <div className='max-h-[70vh] overflow-y-auto px-6 py-6'>
          <div className='space-y-8'>
            <div className='space-y-4'>
              <Input
                label='여행 제목'
                placeholder='예: 제주도 힐링 여행, 유럽 배낭여행'
                value={basicInfo.title}
                onChange={(e) => {
                  setBasicInfo((prev) => ({ ...prev, title: e.target.value }));
                  if (errors.title)
                    setErrors((prev) => ({ ...prev, title: undefined }));
                }}
                errorText={errors.title}
                maxLength={50}
              />
              <LocationInput
                label='나라(국가)'
                placeholder='예: 대한민국 / United States'
                helperText='국가만 선택할 수 있어요'
                value={basicInfo.location}
                onChange={(value) => {
                  setBasicInfo((prev) => ({ ...prev, location: value }));
                  if (errors.location)
                    setErrors((prev) => ({ ...prev, location: undefined }));
                }}
                errorText={errors.location}
              />
              <TravelDatePicker
                label='여행 기간'
                startDate={basicInfo.startDate}
                endDate={basicInfo.endDate}
                onDateChange={(
                  startDate: Date | null,
                  endDate: Date | null
                ) => {
                  setBasicInfo((prev) => ({ ...prev, startDate, endDate }));
                  if (errors.dates)
                    setErrors((prev) => ({ ...prev, dates: undefined }));
                }}
                errorText={errors.dates}
              />
            </div>
            <div>
              <Typography
                variant='h6'
                weight='semiBold'
                className='mb-4 text-gray-900'
              >
                참여자 설정
              </Typography>
              <div className='space-y-4'>
                <div className='rounded-lg border border-gray-200 p-4'>
                  <div className='flex items-center'>
                    <IoPersonOutline className='mr-3 h-5 w-5 text-gray-400' />
                    <div className='flex-1'>
                      <Typography
                        variant='body2'
                        weight='medium'
                        className='text-gray-900'
                      >
                        {userProfile?.nickname ||
                          userProfile?.email ||
                          '사용자'}
                      </Typography>
                      <Typography variant='caption' className='text-blue-600'>
                        오너
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='flex space-x-3 border-t px-6 py-4'>
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
