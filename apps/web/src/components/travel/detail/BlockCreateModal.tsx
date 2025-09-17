import React, { useEffect, useState } from 'react';

import { motion } from 'framer-motion';
import {
  IoCheckmarkOutline,
  IoInformationCircleOutline,
} from 'react-icons/io5';

import { Button, Typography } from '@ui/components';

import { Modal } from '@/components/basic/Modal';
import {
  blockTypeConfigs,
  getDefaultCurrencyForBlock,
  getDefaultDuration,
} from '@/lib/block-helpers';
import { CurrencyCode, parseCurrencyInput } from '@/lib/currency';
import {
  BlockType,
  CreateBlockRequest,
  TravelBlock,
  UpdateBlockRequest,
} from '@/types/travel/blocks';

import { SmartBudgetInput, SmartInput, SmartTimeInput } from './SmartInputs';

interface BlockCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  dayNumber: number;
  onCreateBlock: (request: CreateBlockRequest) => void;
  onUpdateBlock?: (request: UpdateBlockRequest) => void;
  onDeleteBlock?: (blockId: string) => void;
  editingBlock?: TravelBlock;
  isLoading: boolean;
  planLocation: string;
  userNationality?: string;
  totalBudget?: number;
}

export const BlockCreateModal: React.FC<BlockCreateModalProps> = ({
  isOpen,
  onClose,
  planId,
  dayNumber,
  onCreateBlock,
  onUpdateBlock,
  onDeleteBlock,
  editingBlock,
  isLoading,
  planLocation,
  userNationality = 'KR',
  totalBudget = 0,
}) => {
  const isEditMode = !!editingBlock;
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

  // 수정 모드일 때 초기값 설정
  useEffect(() => {
    if (isEditMode && editingBlock) {
      setSelectedType(editingBlock.blockType);
      setTitle(editingBlock.title);
      setDescription(editingBlock.description || '');
      setAddress(
        typeof editingBlock.location === 'string'
          ? editingBlock.location
          : editingBlock.location?.address || ''
      );
      setStartTime(editingBlock.timeRange?.startTime || '');
      setEndTime(editingBlock.timeRange?.endTime || '');
      setAmount(
        editingBlock.cost?.amount ? editingBlock.cost.amount.toString() : ''
      );
      setCurrency(editingBlock.cost?.currency || 'KRW');

      // 블록 타입별 메타데이터 초기화
      const meta = editingBlock.meta;
      if (meta) {
        // Flight 관련
        setFlightNumber(meta.flightNumber || '');
        setDepartureAirport(meta.departureAirport || '');
        setArrivalAirport(meta.arrivalAirport || '');
        setSeatNumber(meta.seatNumber || '');

        // Move 관련
        setFromLocation(
          typeof meta.fromLocation === 'string'
            ? meta.fromLocation
            : meta.fromLocation?.address || ''
        );
        setToLocation(
          typeof meta.toLocation === 'string'
            ? meta.toLocation
            : meta.toLocation?.address || ''
        );
        setTransportType(meta.transportType || '');

        // Hotel 관련
        setCheckIn(meta.checkIn || '');
        setCheckOut(meta.checkOut || '');
        setRoomType(meta.roomType || '');

        // Food 관련
        setMealType(meta.mealType || '');
        setCuisine(meta.cuisine || '');

        // Activity 관련
        setActivityType(meta.activityType || '');
        setReservationRequired(meta.reservationRequired || false);
      }
    }
  }, [isEditMode, editingBlock]);

  // 블록 타입 변경 시 스마트 통화 설정 (생성 모드에서만)
  useEffect(() => {
    if (!isEditMode) {
      const defaultCurrency = getDefaultCurrencyForBlock(
        selectedType,
        userNationality,
        planLocation
      );
      setCurrency(defaultCurrency);
    }
  }, [selectedType, userNationality, planLocation, isEditMode]);

  // 현재 선택된 블록 타입 설정
  const currentBlockConfig = blockTypeConfigs.find(
    (config) => config.type === selectedType
  );
  const suggestedDuration = getDefaultDuration(selectedType);

  // 폼 제출 처리
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // 블록 타입별 메타데이터 구성
    const meta: Record<string, unknown> = {};

    switch (selectedType) {
      case 'flight':
        if (flightNumber) meta.flightNumber = flightNumber;
        if (departureAirport) meta.departureAirport = departureAirport;
        if (arrivalAirport) meta.arrivalAirport = arrivalAirport;
        if (seatNumber) meta.seatNumber = seatNumber;
        break;
      case 'move':
        if (transportType) meta.transportType = transportType;
        if (fromLocation) meta.fromLocation = { address: fromLocation };
        if (toLocation) meta.toLocation = { address: toLocation };
        break;
      case 'hotel':
        if (checkIn) meta.checkIn = checkIn;
        if (checkOut) meta.checkOut = checkOut;
        if (roomType) meta.roomType = roomType;
        break;
      case 'food':
        if (mealType) meta.mealType = mealType;
        if (cuisine) meta.cuisine = cuisine;
        break;
      case 'activity':
        if (activityType) meta.activityType = activityType;
        meta.reservationRequired = reservationRequired;
        break;
    }

    if (isEditMode && editingBlock && onUpdateBlock) {
      // 수정 모드
      const updateRequest: UpdateBlockRequest = {
        id: editingBlock.id,
        planId,
        dayNumber,
        blockType: selectedType,
        title: title.trim(),
        description: description.trim() || undefined,
        location: address.trim() ? { address: address.trim() } : undefined,
        timeRange: startTime
          ? {
              startTime,
              endTime: endTime || undefined,
            }
          : undefined,
        cost: amount
          ? {
              amount: parseCurrencyInput(amount),
              currency: currency,
            }
          : undefined,
        meta: Object.keys(meta).length > 0 ? meta : undefined,
      };

      onUpdateBlock(updateRequest);
    } else {
      // 생성 모드
      const createRequest: CreateBlockRequest = {
        planId,
        dayNumber,
        blockType: selectedType,
        title: title.trim(),
        description: description.trim() || undefined,
        location: address.trim() ? { address: address.trim() } : undefined,
        timeRange: startTime
          ? {
              startTime,
              endTime: endTime || undefined,
            }
          : undefined,
        cost: amount
          ? {
              amount: parseCurrencyInput(amount),
              currency: currency,
            }
          : undefined,
        meta: Object.keys(meta).length > 0 ? meta : undefined,
      };

      onCreateBlock(createRequest);
    }

    handleClose();
  };

  // 삭제 처리
  const handleDelete = () => {
    if (isEditMode && editingBlock && onDeleteBlock) {
      if (confirm('정말로 이 일정을 삭제하시겠습니까?')) {
        onDeleteBlock(editingBlock.id);
        handleClose();
      }
    }
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

  // 블록 타입 선택 UI 렌더링
  const renderBlockTypeSelection = () => (
    <div className='border-b border-gray-100 p-3 pb-6'>
      <Typography variant='h5' className='mb-2 font-bold text-gray-900'>
        {currentBlockConfig?.icon}{' '}
        {isEditMode ? '일정 수정' : '새로운 일정 추가'}
      </Typography>
      <Typography variant='body2' className='mb-6 text-gray-500'>
        Day {dayNumber} •{' '}
        {isEditMode ? '일정을 수정해보세요' : '완벽한 여행을 위한 한 걸음'}
      </Typography>

      {!isEditMode && (
        <>
          <Typography
            variant='body1'
            className='mb-4 font-semibold text-gray-800'
          >
            일정 유형을 선택하세요
          </Typography>

          <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
            {blockTypeConfigs.map((blockType) => (
              <motion.button
                key={blockType.type}
                type='button'
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedType(blockType.type)}
                className={`relative overflow-hidden rounded-2xl p-4 text-left transition-all ${
                  selectedType === blockType.type
                    ? 'shadow-lg ring-2 ring-blue-500 ring-offset-2'
                    : 'border border-gray-200 hover:shadow-md'
                }`}
              >
                {/* 그라데이션 배경 */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${blockType.gradient} opacity-10`}
                />

                {/* 콘텐츠 */}
                <div className='relative'>
                  <div className='mb-2 text-2xl'>{blockType.icon}</div>
                  <Typography
                    variant='body2'
                    className='mb-1 font-semibold text-gray-900'
                  >
                    {blockType.label}
                  </Typography>
                  <Typography variant='caption' className='text-gray-500'>
                    {blockType.description}
                  </Typography>
                </div>

                {/* 선택 표시 */}
                {selectedType === blockType.type && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className='absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500'
                  >
                    <IoCheckmarkOutline className='h-4 w-4 text-white' />
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
        </>
      )}

      {isEditMode && (
        <div className='rounded-2xl bg-gray-50 p-4'>
          <Typography variant='body1' className='font-semibold text-gray-800'>
            현재 일정 유형: {currentBlockConfig?.label}
          </Typography>
          <Typography variant='body2' className='text-gray-600'>
            {currentBlockConfig?.description}
          </Typography>
        </div>
      )}
    </div>
  );

  // 블록 타입별 전용 입력 필드 렌더링
  const renderTypeSpecificFields = () => {
    switch (selectedType) {
      case 'flight':
        return (
          <div className='space-y-6'>
            {/* 항공료 통화 안내 */}
            {selectedType === 'flight' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className='flex items-center space-x-3 rounded-2xl bg-blue-50 p-4'
              >
                <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100'>
                  <IoInformationCircleOutline className='h-4 w-4 text-blue-600' />
                </div>
                <div className='flex-1'>
                  <Typography
                    variant='body2'
                    className='font-medium text-blue-900'
                  >
                    항공료는 출발국 통화로 결제됩니다
                  </Typography>
                  <Typography variant='caption' className='text-blue-600'>
                    {userNationality === 'KR' ? '한국' : userNationality}에서
                    출발하므로 {currency}로 설정됩니다.
                  </Typography>
                </div>
              </motion.div>
            )}

            <div className='grid grid-cols-2 gap-4'>
              <SmartInput
                label='항공편명'
                value={flightNumber}
                onChange={setFlightNumber}
                placeholder='예: KE123'
                disableLabelAnimation={true}
              />
              <SmartInput
                label='좌석번호'
                value={seatNumber}
                onChange={setSeatNumber}
                placeholder='예: 12A'
                disableLabelAnimation={true}
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <SmartInput
                label='출발공항'
                value={departureAirport}
                onChange={setDepartureAirport}
                placeholder='예: 인천국제공항 (ICN)'
                disableLabelAnimation={true}
              />
              <SmartInput
                label='도착공항'
                value={arrivalAirport}
                onChange={setArrivalAirport}
                placeholder='예: 나리타공항 (NRT)'
                disableLabelAnimation={true}
              />
            </div>
          </div>
        );

      case 'move':
        return (
          <div className='space-y-6'>
            <div className='relative'>
              <select
                value={transportType}
                onChange={(e) => setTransportType(e.target.value)}
                className='w-full rounded-2xl border-2 border-gray-200 bg-gray-50/50 px-4 py-4 pb-2 pt-6 text-gray-900 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-0'
              >
                <option value=''>선택하세요</option>
                <option value='walk'>🚶 도보</option>
                <option value='car'>🚗 자동차</option>
                <option value='bus'>🚌 버스</option>
                <option value='subway'>🚇 지하철</option>
                <option value='taxi'>🚕 택시</option>
                <option value='train'>🚄 기차</option>
              </select>
              <label className='absolute left-4 top-2 text-xs font-medium text-gray-500'>
                교통수단
              </label>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <SmartInput
                label='출발지'
                value={fromLocation}
                onChange={setFromLocation}
                placeholder='예: 강남역, 인천공항'
                disableLabelAnimation={true}
              />
              <SmartInput
                label='도착지'
                value={toLocation}
                onChange={setToLocation}
                placeholder='예: 홍대입구역, 호텔'
                disableLabelAnimation={true}
              />
            </div>
          </div>
        );

      case 'hotel':
        return (
          <div className='space-y-6'>
            <div className='grid grid-cols-2 gap-4'>
              <SmartInput
                label='체크인'
                value={checkIn}
                onChange={setCheckIn}
                type='date'
                disableLabelAnimation={true}
              />
              <SmartInput
                label='체크아웃'
                value={checkOut}
                onChange={setCheckOut}
                type='date'
                disableLabelAnimation={true}
              />
            </div>

            <SmartInput
              label='객실 타입'
              value={roomType}
              onChange={setRoomType}
              placeholder='예: 디럭스 더블룸, 스위트룸'
              disableLabelAnimation={true}
            />
          </div>
        );

      case 'food':
        return (
          <div className='space-y-6'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='relative'>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                  className='w-full rounded-2xl border-2 border-gray-200 bg-gray-50/50 px-4 py-4 pb-2 pt-6 text-gray-900 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-0'
                >
                  <option value=''>선택하세요</option>
                  <option value='breakfast'>🌅 아침식사</option>
                  <option value='lunch'>☀️ 점심식사</option>
                  <option value='dinner'>🌙 저녁식사</option>
                  <option value='snack'>🍿 간식</option>
                </select>
                <label className='absolute left-4 top-2 text-xs font-medium text-gray-500'>
                  식사 종류
                </label>
              </div>

              <SmartInput
                label='요리 종류'
                value={cuisine}
                onChange={setCuisine}
                placeholder='예: 일식, 한식, 중식'
                disableLabelAnimation={true}
              />
            </div>
          </div>
        );

      case 'activity':
        return (
          <div className='space-y-6'>
            <div className='relative'>
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
                className='w-full rounded-2xl border-2 border-gray-200 bg-gray-50/50 px-4 py-4 pb-2 pt-6 text-gray-900 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-0'
              >
                <option value=''>선택하세요</option>
                <option value='sightseeing'>🏛️ 관광</option>
                <option value='shopping'>🛍️ 쇼핑</option>
                <option value='entertainment'>🎭 엔터테인먼트</option>
                <option value='sports'>⚽ 스포츠</option>
                <option value='culture'>🎨 문화</option>
              </select>
              <label className='absolute left-4 top-2 text-xs font-medium text-gray-500'>
                액티비티 종류
              </label>
            </div>

            <motion.div
              whileTap={{ scale: 0.98 }}
              className='flex cursor-pointer items-center space-x-3 rounded-2xl border-2 border-gray-200 bg-gray-50/50 p-4 transition-all hover:bg-gray-100/50'
              onClick={() => setReservationRequired(!reservationRequired)}
            >
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-lg border-2 transition-all ${
                  reservationRequired
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300 bg-white'
                }`}
              >
                {reservationRequired && (
                  <IoCheckmarkOutline className='h-4 w-4 text-white' />
                )}
              </div>
              <div className='flex-1'>
                <Typography
                  variant='body2'
                  className='font-medium text-gray-700'
                >
                  예약 필요
                </Typography>
                <Typography variant='caption' className='text-gray-500'>
                  미리 예약이 필요한 액티비티인가요?
                </Typography>
              </div>
            </motion.div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleModalClose = () => {
    // 백드랍 클릭으로는 닫히지 않도록 빈 함수
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      width='full'
      modalType='component'
      showCloseButton={false}
    >
      <div className='mx-auto max-w-4xl px-4 sm:px-6 lg:px-8'>
        <div className='max-h-[80vh] overflow-y-auto'>
          {/* 헤더 */}
          {renderBlockTypeSelection()}

          {/* 폼 */}
          <form onSubmit={handleSubmit} className='space-y-6 p-6'>
            {/* 기본 정보 섹션 */}
            <div className='space-y-6'>
              <SmartInput
                label='제목'
                value={title}
                onChange={setTitle}
                placeholder='일정 제목을 입력하세요'
                required
                disableLabelAnimation={true}
              />

              <SmartInput
                label='설명'
                value={description}
                onChange={setDescription}
                type='textarea'
                placeholder='자세한 설명을 입력하세요'
                disableLabelAnimation={true}
              />

              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <SmartInput
                  label='위치'
                  value={address}
                  onChange={setAddress}
                  placeholder='주소 또는 장소명'
                  disableLabelAnimation={true}
                />

                <SmartBudgetInput
                  value={amount}
                  onChange={setAmount}
                  currency={currency}
                  onCurrencyChange={setCurrency}
                  totalBudget={totalBudget}
                />
              </div>

              <SmartTimeInput
                startTime={startTime}
                endTime={endTime}
                onStartTimeChange={setStartTime}
                onEndTimeChange={setEndTime}
                suggestedDuration={suggestedDuration}
              />
            </div>

            {/* 블록 타입별 전용 필드 */}
            {renderTypeSpecificFields()}

            {/* 제출 버튼 */}
            <div className='sticky bottom-0 -mx-6 border-t border-gray-100 bg-white px-6 pb-6 pt-6'>
              <div
                className={`flex space-x-3 ${isEditMode ? 'grid grid-cols-3' : ''}`}
              >
                <Button
                  type='button'
                  variant='outlined'
                  size='large'
                  onClick={handleClose}
                  className={`rounded-2xl border-gray-300 text-gray-600 hover:bg-gray-50 ${isEditMode ? '' : 'flex-1'}`}
                  disabled={isLoading}
                >
                  취소
                </Button>

                {isEditMode && (
                  <Button
                    type='button'
                    variant='outlined'
                    size='large'
                    onClick={handleDelete}
                    className='rounded-2xl border-red-300 text-red-600 hover:bg-red-50'
                    disabled={isLoading}
                  >
                    삭제
                  </Button>
                )}

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={isEditMode ? '' : 'flex-1'}
                >
                  <Button
                    type='submit'
                    variant='filled'
                    size='large'
                    className={`w-full rounded-2xl font-semibold transition-all ${
                      !title.trim()
                        ? 'cursor-not-allowed bg-gray-200 text-gray-400'
                        : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl'
                    }`}
                    disabled={isLoading || !title.trim()}
                  >
                    {isLoading ? (
                      <div className='flex items-center space-x-2'>
                        <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                        <span>{isEditMode ? '수정 중...' : '추가 중...'}</span>
                      </div>
                    ) : isEditMode ? (
                      '수정하기'
                    ) : (
                      '추가하기'
                    )}
                  </Button>
                </motion.div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
};
