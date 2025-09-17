'use client';

import React, { useEffect, useState } from 'react';

import { IoWalletOutline } from 'react-icons/io5';

import { Button, Input, Typography } from '@ui/components';

import { Modal } from '@/components/basic';
import { countriesISO } from '@/components/travel/constants/countries';
import LocationInput from '@/components/travel/inputs/LocationInput';
import TravelDatePicker from '@/components/travel/inputs/TravelDatePicker';
import { useSession } from '@/hooks/useSession';
import { useToast } from '@/hooks/useToast';
import {
  convertCurrency,
  formatCurrencyWithExchange,
  getCurrencyByDestination,
  getCurrencyByNationality,
} from '@/lib/exchange-rate';
import { createClient } from '@/lib/supabase/client/supabase';

interface TravelInfo {
  title: string;
  location: string;
  startDate: Date | null;
  endDate: Date | null;
  targetBudget: string;
}

interface TravelPlan {
  id: string;
  title: string;
  location: string;
  start_date: string;
  end_date: string;
  target_budget?: number;
  budget_currency?: string;
  destination_country?: string;
}

interface TravelEditInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  travelPlan: TravelPlan;
  onUpdate?: () => void;
}

const TravelEditInfoModal: React.FC<TravelEditInfoModalProps> = ({
  isOpen,
  onClose,
  travelPlan,
  onUpdate,
}) => {
  const { userProfile } = useSession();
  const toast = useToast();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [travelInfo, setTravelInfo] = useState<TravelInfo>({
    title: '',
    location: '',
    startDate: null,
    endDate: null,
    targetBudget: '',
  });

  const [errors, setErrors] = useState<{
    title?: string;
    location?: string;
    dates?: string;
    budget?: string;
  }>({});

  // 초기 데이터 설정
  useEffect(() => {
    if (travelPlan && isOpen) {
      setTravelInfo({
        title: travelPlan.title,
        location: travelPlan.location,
        startDate: new Date(travelPlan.start_date),
        endDate: new Date(travelPlan.end_date),
        targetBudget: travelPlan.target_budget
          ? formatBudgetInput(travelPlan.target_budget.toString())
          : '',
      });
    }
  }, [travelPlan, isOpen]);

  // 사용자 통화 가져오기
  const getUserCurrency = () => {
    return getCurrencyByNationality(userProfile?.nationality);
  };

  // 목적지 통화 가져오기
  const getDestinationCurrency = () => {
    if (!travelInfo.location) return getUserCurrency();

    const selectedCountry = countriesISO.find(
      (country) =>
        country.nameKo.toLowerCase() === travelInfo.location.toLowerCase() ||
        country.nameEn.toLowerCase() === travelInfo.location.toLowerCase()
    );

    return getCurrencyByDestination(selectedCountry?.code);
  };

  // 예산 입력 포맷팅 (천 단위 구분자 추가)
  const formatBudgetInput = (value: string) => {
    // 숫자가 아닌 문자 제거
    const numericValue = value.replace(/[^\d]/g, '');

    // 천 단위 구분자 추가
    if (numericValue) {
      return parseInt(numericValue).toLocaleString('ko-KR');
    }
    return '';
  };

  // 환율 적용된 목적지 통화 예산 미리보기
  const [convertedBudget, setConvertedBudget] = useState<number | null>(null);

  useEffect(() => {
    const run = async () => {
      const amount = parseBudgetValue(travelInfo.targetBudget);
      const userCur = getUserCurrency();
      const destCur = getDestinationCurrency();
      if (!amount || !destCur) {
        setConvertedBudget(null);
        return;
      }
      try {
        const v = await convertCurrency(amount, userCur, destCur);
        setConvertedBudget(v);
      } catch {
        setConvertedBudget(null);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [travelInfo.targetBudget, travelInfo.location, userProfile?.nationality]);

  // 실제 숫자값으로 변환
  const parseBudgetValue = (formattedValue: string): number => {
    return parseInt(formattedValue.replace(/[^\d]/g, '')) || 0;
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    if (!travelInfo.title.trim()) {
      newErrors.title = '여행 제목을 입력해주세요.';
    } else if (travelInfo.title.trim().length > 50) {
      newErrors.title = '여행 제목은 50자 이내로 입력해주세요.';
    }
    if (!travelInfo.location.trim()) {
      newErrors.location = '나라(국가)를 입력해주세요.';
    } else {
      const normalize = (s: string) => s.trim().toLowerCase();
      const input = normalize(travelInfo.location);
      const isValidCountry = countriesISO.some(
        (c) => normalize(c.nameKo) === input || normalize(c.nameEn) === input
      );
      if (!isValidCountry) {
        newErrors.location = '국가 목록에서 정확한 국가를 선택해주세요.';
      }
    }
    if (!travelInfo.startDate || !travelInfo.endDate) {
      newErrors.dates = '여행 시작일과 종료일을 선택해주세요.';
    }

    // 예산 검증 (선택사항이지만 입력 시 유효성 검사)
    if (travelInfo.targetBudget) {
      const budgetValue = parseBudgetValue(travelInfo.targetBudget);
      if (budgetValue <= 0) {
        newErrors.budget = '예산은 0보다 큰 값을 입력해주세요.';
      } else if (budgetValue > 1000000000) {
        // 10억 제한
        newErrors.budget = '예산이 너무 큽니다. 더 작은 값을 입력해주세요.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateTrip = async () => {
    if (!validateForm()) {
      toast.error('입력 정보를 확인해주세요.');
      return;
    }

    setLoading(true);
    try {
      const budgetValue = parseBudgetValue(travelInfo.targetBudget);
      const userCurrency = getUserCurrency();
      const destinationCurrency = getDestinationCurrency();

      // 목적지 국가 코드 찾기
      const selectedCountry = countriesISO.find(
        (country) =>
          country.nameKo.toLowerCase() === travelInfo.location.toLowerCase() ||
          country.nameEn.toLowerCase() === travelInfo.location.toLowerCase()
      );

      // 목적지 선택됨 → 예산을 목적지 통화로 변환하여 저장
      const budgetToSave = destinationCurrency
        ? await convertCurrency(budgetValue, userCurrency, destinationCurrency)
        : budgetValue;

      const budgetCurrencyToSave = destinationCurrency || userCurrency;

      const updateData = {
        title: travelInfo.title.trim(),
        location: travelInfo.location.trim(),
        start_date: travelInfo.startDate!.toISOString().split('T')[0],
        end_date: travelInfo.endDate!.toISOString().split('T')[0],
        target_budget: budgetValue > 0 ? budgetToSave : 0,
        budget_currency: budgetCurrencyToSave,
        destination_country: selectedCountry?.code,
      };

      const response = await fetch(`/api/travel/${travelPlan.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '여행 계획 수정에 실패했습니다.');
      }

      toast.success('여행 계획이 수정되었습니다!');
      onUpdate?.();
      onClose();
    } catch (error: any) {
      toast.error(error.message || '여행 계획 수정 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const canProceed =
    travelInfo.title.trim() &&
    travelInfo.location.trim() &&
    travelInfo.startDate &&
    travelInfo.endDate;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='여행 정보 수정'
      width='responsive'
    >
      <div className='flex flex-col'>
        <div className='max-h-[70vh] overflow-y-auto px-6 py-6'>
          <div className='space-y-8'>
            <div className='space-y-4'>
              <Input
                label='여행 제목'
                placeholder='예: 제주도 힐링 여행, 유럽 배낭여행'
                value={travelInfo.title}
                onChange={(e) => {
                  setTravelInfo((prev) => ({ ...prev, title: e.target.value }));
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
                value={travelInfo.location}
                onChange={(value) => {
                  setTravelInfo((prev) => ({ ...prev, location: value }));
                  if (errors.location)
                    setErrors((prev) => ({ ...prev, location: undefined }));
                }}
                errorText={errors.location}
              />
              <TravelDatePicker
                label='여행 기간'
                startDate={travelInfo.startDate}
                endDate={travelInfo.endDate}
                onDateChange={(
                  startDate: Date | null,
                  endDate: Date | null
                ) => {
                  setTravelInfo((prev) => ({ ...prev, startDate, endDate }));
                  if (errors.dates)
                    setErrors((prev) => ({ ...prev, dates: undefined }));
                }}
                errorText={errors.dates}
              />

              <div className='space-y-3'>
                <div>
                  <label className='mb-2 flex items-center space-x-2 text-sm font-medium text-gray-700'>
                    <IoWalletOutline className='h-4 w-4' />
                    <span>예산 (선택사항)</span>
                  </label>
                  <Input
                    placeholder={`예: ${formatCurrencyWithExchange(1000000, getUserCurrency())}`}
                    value={travelInfo.targetBudget}
                    onChange={(e) => {
                      const formattedValue = formatBudgetInput(e.target.value);
                      setTravelInfo((prev) => ({
                        ...prev,
                        targetBudget: formattedValue,
                      }));
                      if (errors.budget)
                        setErrors((prev) => ({ ...prev, budget: undefined }));
                    }}
                    errorText={errors.budget}
                    helperText={(function () {
                      const ownerName = userProfile?.nationality || '대한민국';
                      const destName = travelInfo.location;
                      if (destName) {
                        return `💡 지금은 ${ownerName} 화폐 단위로 입력해주세요.`;
                      }
                      return `💡 지금은 ${ownerName} 화폐 단위로 입력해주세요.`;
                    })()}
                  />
                </div>

                {travelInfo.targetBudget && (
                  <div className='rounded-lg border border-blue-200 bg-blue-50 p-4'>
                    <div className='flex items-center space-x-2'>
                      <IoWalletOutline className='h-5 w-5 text-blue-600' />
                      <div>
                        <Typography
                          variant='body2'
                          className='font-semibold text-blue-800'
                        >
                          설정된 예산 (목적지 통화)
                        </Typography>
                        <Typography
                          variant='h6'
                          className='font-bold text-blue-900'
                        >
                          {(() => {
                            const userCur = getUserCurrency();
                            const destCur = getDestinationCurrency();
                            const amount = parseBudgetValue(
                              travelInfo.targetBudget
                            );
                            if (!amount)
                              return formatCurrencyWithExchange(0, destCur);
                            if (destCur) {
                              const val = convertedBudget ?? amount;
                              return formatCurrencyWithExchange(val, destCur);
                            }
                            return formatCurrencyWithExchange(amount, userCur);
                          })()}
                        </Typography>
                        <Typography variant='caption' className='text-blue-700'>
                          기준 입력:{' '}
                          {formatCurrencyWithExchange(
                            parseBudgetValue(travelInfo.targetBudget),
                            getUserCurrency()
                          )}
                        </Typography>
                        {travelInfo.location &&
                          getDestinationCurrency() !== getUserCurrency() && (
                            <Typography
                              variant='caption'
                              className='text-blue-600'
                            >
                              ※ 저장 시 목적지 통화로 환율 변환되어 저장됩니다
                            </Typography>
                          )}
                      </div>
                    </div>
                  </div>
                )}
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
            onClick={handleUpdateTrip}
            disabled={!canProceed || loading}
            className='flex-1'
          >
            {loading ? '수정 중...' : '수정하기'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TravelEditInfoModal;
