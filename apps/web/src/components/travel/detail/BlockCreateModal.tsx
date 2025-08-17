/*
  BlockCreateModal.tsx
  - 새 일정(블록) 생성 모달 컴포넌트
  - 공통 필드(제목/설명/위치/시간/비용) + 타입별 필드(항공/이동/숙소/식사/액티비티)를 렌더링
  - 제출 시 CreateBlockRequest를 구성하여 상위(onCreateBlock)로 전달
  - SSR 환경에서도 안전하게 동작하도록 createPortal 사용
*/
import React, { useEffect, useState } from 'react';

import { createPortal } from 'react-dom';
import {
  IoAirplaneOutline,
  IoBedOutline,
  IoCarOutline,
  IoCloseOutline,
  IoDocumentTextOutline,
  IoGameControllerOutline,
  IoRestaurantOutline,
} from 'react-icons/io5';

import { Button, Typography } from '@ui/components';

import {
  CURRENCIES,
  CurrencyCode,
  formatCurrencyInput,
  getCurrencyFromLocation,
  parseCurrencyInput,
} from '@/lib/currency';
import { BlockType, CreateBlockRequest } from '@/types/travel/blocks';

interface BlockCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  dayNumber: number;
  onCreateBlock: (request: CreateBlockRequest) => void;
  isLoading: boolean;
  planLocation: string;
}

export const BlockCreateModal: React.FC<BlockCreateModalProps> = ({
  isOpen,
  onClose,
  planId,
  dayNumber,
  onCreateBlock,
  isLoading,
  planLocation,
}) => {
  // 기본 필드 상태 관리
  const [selectedType, setSelectedType] = useState<BlockType>('activity');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('KRW');

  // 블록 타입별 전용 필드 상태 관리
  const [flightNumber, setFlightNumber] = useState('');
  const [departureAirport, setDepartureAirport] = useState('');
  const [arrivalAirport, setArrivalAirport] = useState('');
  const [seatNumber, setSeatNumber] = useState('');
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [transportType, setTransportType] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [roomType, setRoomType] = useState('');
  const [mealType, setMealType] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [activityType, setActivityType] = useState('');
  const [reservationRequired, setReservationRequired] = useState(false);

  // 여행지 위치에 따라 기본 통화 자동 설정
  useEffect(() => {
    if (planLocation) {
      const detectedCurrency = getCurrencyFromLocation(planLocation);
      setCurrency(detectedCurrency);
    }
  }, [planLocation]);

  // 블록 타입별 설정 정보 (아이콘, 색상, 라벨)
  const blockTypes = [
    {
      type: 'flight' as BlockType,
      label: '항공',
      icon: <IoAirplaneOutline className='h-6 w-6' />,
      color: 'text-sky-500',
    },
    {
      type: 'move' as BlockType,
      label: '이동',
      icon: <IoCarOutline className='h-6 w-6' />,
      color: 'text-blue-500',
    },
    {
      type: 'food' as BlockType,
      label: '식사',
      icon: <IoRestaurantOutline className='h-6 w-6' />,
      color: 'text-orange-500',
    },
    {
      type: 'hotel' as BlockType,
      label: '숙소',
      icon: <IoBedOutline className='h-6 w-6' />,
      color: 'text-purple-500',
    },
    {
      type: 'activity' as BlockType,
      label: '관광/액티비티',
      icon: <IoGameControllerOutline className='h-6 w-6' />,
      color: 'text-green-500',
    },
    {
      type: 'memo' as BlockType,
      label: '메모',
      icon: <IoDocumentTextOutline className='h-6 w-6' />,
      color: 'text-gray-500',
    },
  ];

  // 폼 제출 처리: 블록 타입별 메타데이터 구성 및 API 요청
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // 블록 타입별 메타데이터 구성
    const meta: any = {};

    switch (selectedType) {
      case 'flight':
        // 항공 블록: 항공편 정보, 공항 정보, 좌석 정보
        meta.flightNumber = flightNumber;
        meta.departureAirport = departureAirport;
        meta.arrivalAirport = arrivalAirport;
        meta.seatNumber = seatNumber;
        break;
      case 'move':
        // 이동 블록: 교통수단, 출발지/도착지 정보
        meta.transportType = transportType;
        meta.fromLocation = fromLocation
          ? { address: fromLocation }
          : undefined;
        meta.toLocation = toLocation ? { address: toLocation } : undefined;
        break;
      case 'hotel':
        // 숙소 블록: 체크인/아웃, 객실 타입
        meta.checkIn = checkIn;
        meta.checkOut = checkOut;
        meta.roomType = roomType;
        break;
      case 'food':
        // 식사 블록: 식사 종류, 요리 종류
        meta.mealType = mealType;
        meta.cuisine = cuisine;
        break;
      case 'activity':
        // 액티비티 블록: 액티비티 종류, 예약 필요 여부
        meta.activityType = activityType;
        meta.reservationRequired = reservationRequired;
        break;
    }

    // CreateBlockRequest 객체 구성
    const request: CreateBlockRequest = {
      planId,
      dayNumber,
      blockType: selectedType,
      title: title.trim(),
      description: description.trim() || undefined,
      // 위치 정보가 있는 경우 Location 객체로 변환
      location: address.trim() ? { address: address.trim() } : undefined,
      // 시간 정보가 있는 경우 TimeRange 객체로 변환
      timeRange: startTime
        ? {
            startTime,
            endTime: endTime || undefined,
          }
        : undefined,
      // 비용 정보가 있는 경우 Cost 객체로 변환 (문자열을 숫자로 파싱)
      cost: amount
        ? {
            amount: parseCurrencyInput(amount),
            currency: currency,
          }
        : undefined,
      // 메타데이터가 있는 경우에만 포함
      meta: Object.keys(meta).length > 0 ? meta : undefined,
    };

    onCreateBlock(request);
    handleClose();
  };

  // 모달 닫기 시 모든 상태 초기화
  const handleClose = () => {
    setSelectedType('activity');
    setTitle('');
    setDescription('');
    setAddress('');
    setStartTime('');
    setEndTime('');
    setAmount('');
    setFlightNumber('');
    setDepartureAirport('');
    setArrivalAirport('');
    setSeatNumber('');
    setFromLocation('');
    setToLocation('');
    setTransportType('');
    setCheckIn('');
    setCheckOut('');
    setRoomType('');
    setMealType('');
    setCuisine('');
    setActivityType('');
    setReservationRequired(false);
    onClose();
  };

  // 블록 타입별 전용 입력 필드 렌더링
  const renderTypeSpecificFields = () => {
    switch (selectedType) {
      case 'flight':
        return (
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='mb-3 block text-sm font-semibold text-gray-800'>
                  항공편명
                </label>
                <input
                  type='text'
                  value={flightNumber}
                  onChange={(e) => setFlightNumber(e.target.value)}
                  placeholder='예: KE123'
                  className='w-full rounded-xl border border-gray-300 px-4 py-3 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20'
                />
              </div>
              <div>
                <label className='mb-3 block text-sm font-semibold text-gray-800'>
                  좌석번호
                </label>
                <input
                  type='text'
                  value={seatNumber}
                  onChange={(e) => setSeatNumber(e.target.value)}
                  placeholder='예: 12A'
                  className='w-full rounded-xl border border-gray-300 px-4 py-3 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20'
                />
              </div>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='mb-3 block text-sm font-semibold text-gray-800'>
                  출발공항
                </label>
                <input
                  type='text'
                  value={departureAirport}
                  onChange={(e) => setDepartureAirport(e.target.value)}
                  placeholder='예: 인천국제공항'
                  className='w-full rounded-xl border border-gray-300 px-4 py-3 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20'
                />
              </div>
              <div>
                <label className='mb-3 block text-sm font-semibold text-gray-800'>
                  도착공항
                </label>
                <input
                  type='text'
                  value={arrivalAirport}
                  onChange={(e) => setArrivalAirport(e.target.value)}
                  placeholder='예: 나리타공항'
                  className='w-full rounded-xl border border-gray-300 px-4 py-3 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20'
                />
              </div>
            </div>
          </div>
        );

      case 'move':
        return (
          <div className='space-y-4'>
            <div>
              <label className='mb-3 block text-sm font-semibold text-gray-800'>
                교통수단
              </label>
              <select
                value={transportType}
                onChange={(e) => setTransportType(e.target.value)}
                className='w-full rounded-xl border border-gray-300 px-4 py-3 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20'
              >
                <option value=''>선택하세요</option>
                <option value='walk'>도보</option>
                <option value='car'>자동차</option>
                <option value='bus'>버스</option>
                <option value='subway'>지하철</option>
                <option value='taxi'>택시</option>
                <option value='train'>기차</option>
              </select>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='mb-3 block text-sm font-semibold text-gray-800'>
                  출발지
                </label>
                <input
                  type='text'
                  value={fromLocation}
                  onChange={(e) => setFromLocation(e.target.value)}
                  placeholder='출발 위치'
                  className='w-full rounded-xl border border-gray-300 px-4 py-3 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20'
                />
              </div>
              <div>
                <label className='mb-3 block text-sm font-semibold text-gray-800'>
                  도착지
                </label>
                <input
                  type='text'
                  value={toLocation}
                  onChange={(e) => setToLocation(e.target.value)}
                  placeholder='도착 위치'
                  className='w-full rounded-xl border border-gray-300 px-4 py-3 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20'
                />
              </div>
            </div>
          </div>
        );

      case 'hotel':
        return (
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='mb-3 block text-sm font-semibold text-gray-800'>
                  체크인
                </label>
                <input
                  type='date'
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className='w-full rounded-xl border border-gray-300 px-4 py-3 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20'
                />
              </div>
              <div>
                <label className='mb-3 block text-sm font-semibold text-gray-800'>
                  체크아웃
                </label>
                <input
                  type='date'
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className='w-full rounded-xl border border-gray-300 px-4 py-3 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20'
                />
              </div>
            </div>
            <div>
              <label className='mb-3 block text-sm font-semibold text-gray-800'>
                객실 타입
              </label>
              <input
                type='text'
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                placeholder='예: 디럭스 더블룸'
                className='w-full rounded-xl border border-gray-300 px-4 py-3 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20'
              />
            </div>
          </div>
        );

      case 'food':
        return (
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='mb-3 block text-sm font-semibold text-gray-800'>
                  식사 종류
                </label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                  className='w-full rounded-xl border border-gray-300 px-4 py-3 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20'
                >
                  <option value=''>선택하세요</option>
                  <option value='breakfast'>아침식사</option>
                  <option value='lunch'>점심식사</option>
                  <option value='dinner'>저녁식사</option>
                  <option value='snack'>간식</option>
                </select>
              </div>
              <div>
                <label className='mb-3 block text-sm font-semibold text-gray-800'>
                  요리 종류
                </label>
                <input
                  type='text'
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                  placeholder='예: 일식, 한식, 중식'
                  className='w-full rounded-xl border border-gray-300 px-4 py-3 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20'
                />
              </div>
            </div>
          </div>
        );

      case 'activity':
        return (
          <div className='space-y-4'>
            <div>
              <label className='mb-3 block text-sm font-semibold text-gray-800'>
                액티비티 종류
              </label>
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
                className='w-full rounded-xl border border-gray-300 px-4 py-3 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20'
              >
                <option value=''>선택하세요</option>
                <option value='sightseeing'>관광</option>
                <option value='shopping'>쇼핑</option>
                <option value='entertainment'>엔터테인먼트</option>
                <option value='sports'>스포츠</option>
                <option value='culture'>문화</option>
              </select>
            </div>
            <div className='flex items-center space-x-3'>
              <input
                type='checkbox'
                id='reservationRequired'
                checked={reservationRequired}
                onChange={(e) => setReservationRequired(e.target.checked)}
                className='h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-blue-500'
              />
              <label
                htmlFor='reservationRequired'
                className='text-sm font-medium text-gray-700'
              >
                예약 필요
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm'>
      <div className='mx-4 max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl bg-white shadow-2xl'>
        <div className='flex items-center justify-between border-b border-gray-100 p-6'>
          <div>
            <Typography variant='h4' className='mb-1 text-gray-900'>
              새 일정 추가
            </Typography>
            <Typography variant='caption' className='text-gray-500'>
              Day {dayNumber} ·{' '}
              {new Date().toLocaleDateString('ko-KR', {
                month: 'long',
                day: 'numeric',
                weekday: 'short',
              })}
            </Typography>
          </div>
          <button
            onClick={handleClose}
            className='rounded-xl p-2 transition-colors hover:bg-gray-100'
          >
            <IoCloseOutline className='h-5 w-5 text-gray-500' />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6 p-6'>
          <div>
            <Typography
              variant='body1'
              className='mb-4 font-semibold text-gray-800'
            >
              일정 유형
            </Typography>
            <div className='grid grid-cols-3 gap-3'>
              {blockTypes.map((blockType) => (
                <button
                  key={blockType.type}
                  type='button'
                  onClick={() => setSelectedType(blockType.type)}
                  className={`rounded-xl border-2 p-4 transition-all ${
                    selectedType === blockType.type
                      ? 'scale-105 border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className='flex flex-col items-center space-y-2'>
                    <div className={blockType.color}>{blockType.icon}</div>
                    <Typography
                      variant='caption'
                      className='font-medium text-gray-700'
                    >
                      {blockType.label}
                    </Typography>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className='mb-3 block text-sm font-semibold text-gray-800'>
              제목 <span className='text-red-500'>*</span>
            </label>
            <input
              type='text'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='일정 제목을 입력하세요'
              className='w-full rounded-xl border border-gray-300 px-4 py-3 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20'
              required
            />
          </div>

          <div>
            <label className='mb-3 block text-sm font-semibold text-gray-800'>
              설명
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='자세한 설명을 입력하세요'
              rows={3}
              className='w-full resize-none rounded-xl border border-gray-300 px-4 py-3 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20'
            />
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div>
              <label className='mb-3 block text-sm font-semibold text-gray-800'>
                위치
              </label>
              <input
                type='text'
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder='주소 또는 장소명'
                className='w-full rounded-xl border border-gray-300 px-4 py-3 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20'
              />
            </div>

            <div>
              <label className='mb-3 block text-sm font-semibold text-gray-800'>
                예상 비용
              </label>
              <div className='relative'>
                <input
                  type='text'
                  value={amount}
                  onChange={(e) =>
                    setAmount(formatCurrencyInput(e.target.value, currency))
                  }
                  placeholder='0'
                  className='w-full rounded-xl border border-gray-300 py-3 pl-10 pr-4 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20'
                />
                <span className='absolute left-4 top-3 font-medium text-gray-500'>
                  {CURRENCIES[currency].symbol}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className='mb-3 block text-sm font-semibold text-gray-800'>
              시간
            </label>
            <div className='grid grid-cols-2 gap-4'>
              <input
                type='time'
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className='w-full rounded-xl border border-gray-300 px-4 py-3 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20'
                placeholder='시작 시간'
              />
              <input
                type='time'
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className='w-full rounded-xl border border-gray-300 px-4 py-3 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20'
                placeholder='종료 시간'
              />
            </div>
          </div>

          {renderTypeSpecificFields()}

          <div className='flex space-x-3 border-t border-gray-100 pt-6'>
            <Button
              type='button'
              variant='outlined'
              size='medium'
              onClick={handleClose}
              className='flex-1 rounded-xl'
              disabled={isLoading}
            >
              취소
            </Button>
            <Button
              type='submit'
              variant='filled'
              size='medium'
              className='flex-1 rounded-xl'
              disabled={isLoading || !title.trim()}
            >
              {isLoading ? '추가 중...' : '일정 추가'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );

  // SSR 환경에서 document가 없는 경우를 대비한 안전한 포털 렌더링
  return typeof window !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null;
};
