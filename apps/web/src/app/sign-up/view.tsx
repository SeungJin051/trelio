'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import type { User } from '@supabase/supabase-js';
import { IconType } from 'react-icons';
import { FaCamera, FaCheck, FaChevronLeft, FaUpload } from 'react-icons/fa';

import { Avatar, Button, Icon, Input, Typography } from '@ui/components';

import { Card } from '@/components';
import { useToast } from '@/hooks';
import { createClient } from '@/lib/supabase/client/supabase';
import type {
  PreferredDestination,
  TravelStyle,
  UserProfile,
} from '@/types/user/user';

import {
  DESTINATIONS,
  FILE_UPLOAD_LIMITS,
  TOTAL_STEPS,
  TRAVEL_STYLES,
} from './constants';
import { useImageUpload } from './hooks/useImageUpload';

const SignUpView = () => {
  const [user, setUser] = useState<User | null>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    nickname: '',
    profile_image_option: 'social',
    preferred_destinations: [],
    travel_styles: [],
  });

  const router = useRouter();
  const toast = useToast();
  const supabase = createClient();
  const progress = (step / TOTAL_STEPS) * 100;

  // 이미지 업로드 훅 사용
  const {
    croppedImage,
    isProcessing,
    fileInputRef,
    canvasRef,
    handleFileSelect,
    triggerFileUpload,
    resetImage,
  } = useImageUpload({
    maxSize: FILE_UPLOAD_LIMITS.MAX_SIZE,
    allowedTypes: FILE_UPLOAD_LIMITS.ALLOWED_TYPES,
    cropSize: FILE_UPLOAD_LIMITS.CROP_SIZE,
    jpegQuality: FILE_UPLOAD_LIMITS.JPEG_QUALITY,
    onImageCropped: (croppedImageUrl) => {
      setProfile((prev) => ({
        ...prev,
        profile_image_url: croppedImageUrl,
        profile_image_option: 'upload',
      }));
    },
  });

  // 컴포넌트 마운트 시 현재 사용자 정보 확인
  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
        router.push('/log-in');
        return;
      }

      setUser(session.user);

      // 사용자 정보를 콘솔에 출력
      console.log('🔐 현재 로그인된 사용자 정보:');
      console.log('👤 사용자 전체 정보:', session.user);
      console.log('🆔 사용자 ID:', session.user.id);
      console.log('📧 이메일:', session.user.email);
      console.log('🔗 인증 제공자:', session.user.app_metadata?.provider);
      console.log('📊 사용자 메타데이터:', session.user.user_metadata);

      // 소셜 로그인 정보에서 기본값 설정
      if (session.user.user_metadata) {
        const metadata = session.user.user_metadata;
        setProfile((prev) => ({
          ...prev,
          nickname:
            metadata.full_name ||
            metadata.name ||
            metadata.preferred_username ||
            '',
          profile_image_url:
            metadata.avatar_url || metadata.picture || undefined,
        }));
      }
    };

    getCurrentUser();
  }, [supabase, router]);

  const toggleDestination = (id: PreferredDestination) => {
    setProfile((prev) => ({
      ...prev,
      preferred_destinations: prev.preferred_destinations.includes(id)
        ? prev.preferred_destinations.filter((item) => item !== id)
        : [...prev.preferred_destinations, id],
    }));
  };

  const toggleStyle = (id: TravelStyle) => {
    setProfile((prev) => ({
      ...prev,
      travel_styles: prev.travel_styles.includes(id)
        ? prev.travel_styles.filter((item) => item !== id)
        : [...prev.travel_styles, id],
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return (
          profile.nickname.trim() !== '' &&
          profile.profile_image_option !== null
        );
      case 2:
        return profile.preferred_destinations.length > 0;
      case 3:
        return profile.travel_styles.length > 0;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      await handleSignUpComplete();
    }
  };

  const handleSignUpComplete = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('user_profiles').insert({
        id: user.id,
        email: user.email || '',
        nickname: profile.nickname,
        profile_image_option: profile.profile_image_option,
        profile_image_url: profile.profile_image_url,
        preferred_destinations: profile.preferred_destinations,
        travel_styles: profile.travel_styles,
        provider: user.app_metadata?.provider || 'unknown',
      });

      if (error) {
        console.error('❌ 프로필 저장 실패:', error);

        // 구체적인 에러 메시지 제공
        if (error.code === 'PGRST116') {
          toast.error('이미 프로필이 등록된 사용자입니다.');
        } else if (error.code === '23505') {
          toast.error('중복된 사용자 정보입니다.');
        } else {
          toast.error(`프로필 저장 실패: ${error.message}`);
        }
        return;
      }

      // 프로필 저장 후 잠시 대기하여 사용자에게 성공 메시지를 보여줌
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 메인 페이지로 리다이렉트
      router.push('/');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`회원가입 실패: ${error.message}`);
      } else {
        toast.error('회원가입 처리 중 알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 소셜 프로필로 되돌리기
  const resetToSocialProfile = () => {
    resetImage();
    setProfile((prev) => ({
      ...prev,
      profile_image_option: 'social',
      profile_image_url:
        user?.user_metadata?.avatar_url || user?.user_metadata?.picture,
    }));
  };

  if (!user) {
    return null;
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className='space-y-6'>
            <div className='space-y-2 text-center'>
              <Typography
                variant='h2'
                className='text-2xl font-bold text-gray-900'
              >
                프로필을 설정해주세요
              </Typography>
              <Typography variant='body1' className='text-gray-600'>
                닉네임과 프로필 사진을 설정해보세요
              </Typography>
            </div>

            <div className='flex justify-center'>
              <div className='relative'>
                <Avatar
                  src={croppedImage || profile.profile_image_url}
                  alt={profile.nickname || user.email || '사용자'}
                  size='large'
                />
                {profile.profile_image_option === 'upload' && (
                  <button
                    onClick={triggerFileUpload}
                    disabled={isProcessing}
                    className='absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 disabled:opacity-50'
                  >
                    <Icon as={FaCamera} className='h-4 w-4' />
                  </button>
                )}
              </div>
            </div>

            <div className='space-y-4'>
              <div>
                <Typography
                  variant='body2'
                  className='mb-2 font-medium text-gray-700'
                >
                  닉네임 *
                </Typography>
                <Input
                  value={profile.nickname}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      nickname: e.target.value,
                    }))
                  }
                  placeholder='닉네임을 입력해주세요'
                  maxLength={20}
                />
              </div>

              <div>
                <Typography
                  variant='body2'
                  className='mb-3 font-medium text-gray-700'
                >
                  프로필 사진 *
                </Typography>
                <div className='space-y-3'>
                  <Card
                    cardType='selectable'
                    selected={profile.profile_image_option === 'social'}
                    onClick={resetToSocialProfile}
                  >
                    <div className='flex items-center justify-between p-4'>
                      <div className='flex items-center space-x-3'>
                        <div className='flex h-10 w-10 items-center justify-center rounded-full bg-blue-100'>
                          <Icon
                            as={FaCheck}
                            className='h-5 w-5 text-blue-600'
                          />
                        </div>
                        <div>
                          <Typography
                            variant='body1'
                            className='font-medium text-gray-900'
                          >
                            소셜 프로필 사진 사용하기
                          </Typography>
                          <Typography variant='body2' className='text-gray-500'>
                            기존 프로필 사진을 그대로 사용해요
                          </Typography>
                        </div>
                      </div>
                      {profile.profile_image_option === 'social' && (
                        <div className='flex h-5 w-5 items-center justify-center rounded-full bg-blue-500'>
                          <Icon as={FaCheck} className='h-3 w-3 text-white' />
                        </div>
                      )}
                    </div>
                  </Card>

                  <Card
                    cardType='selectable'
                    selected={profile.profile_image_option === 'upload'}
                    onClick={() => {
                      setProfile((prev) => ({
                        ...prev,
                        profile_image_option: 'upload',
                      }));
                      if (!croppedImage) {
                        triggerFileUpload();
                      }
                    }}
                  >
                    <div className='flex items-center justify-between p-4'>
                      <div className='flex items-center space-x-3'>
                        <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gray-100'>
                          <Icon
                            as={FaUpload}
                            className='h-5 w-5 text-gray-600'
                          />
                        </div>
                        <div>
                          <Typography
                            variant='body1'
                            className='font-medium text-gray-900'
                          >
                            새 사진 업로드하기
                          </Typography>
                          <Typography variant='body2' className='text-gray-500'>
                            {croppedImage
                              ? '업로드된 사진 사용중'
                              : '나만의 프로필 사진을 업로드해요'}
                          </Typography>
                        </div>
                      </div>
                      {profile.profile_image_option === 'upload' && (
                        <div className='flex h-5 w-5 items-center justify-center rounded-full bg-blue-500'>
                          <Icon as={FaCheck} className='h-3 w-3 text-white' />
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              </div>

              {/* 숨겨진 파일 입력 */}
              <input
                ref={fileInputRef}
                type='file'
                accept='image/*'
                onChange={handleFileSelect}
                className='hidden'
              />
            </div>

            {/* 숨겨진 캔버스 (크롭용) */}
            <canvas ref={canvasRef} className='hidden' />
          </div>
        );

      case 2:
        return (
          <div className='space-y-6'>
            <div className='space-y-2 text-center'>
              <Typography
                variant='h2'
                className='text-2xl font-bold text-gray-900'
              >
                선호하는 여행지는?
              </Typography>
              <Typography variant='body1' className='text-gray-600'>
                관심 있는 여행지를 모두 선택해주세요 (복수 선택 가능)
              </Typography>
            </div>

            <div className='grid grid-cols-2 gap-3'>
              {DESTINATIONS.map((destination) => (
                <Card
                  key={destination.id}
                  cardType='selectable'
                  selected={profile.preferred_destinations.includes(
                    destination.id
                  )}
                  onClick={() => toggleDestination(destination.id)}
                >
                  <div className='flex flex-col items-center space-y-2 p-4'>
                    <span className='text-2xl'>{destination.icon}</span>
                    <Typography
                      variant='body2'
                      className='text-center font-medium'
                    >
                      {destination.name}
                    </Typography>
                    {profile.preferred_destinations.includes(
                      destination.id
                    ) && (
                      <div className='flex h-5 w-5 items-center justify-center rounded-full bg-blue-500'>
                        <Icon as={FaCheck} className='h-3 w-3 text-white' />
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className='space-y-6'>
            <div className='space-y-2 text-center'>
              <Typography
                variant='h2'
                className='text-2xl font-bold text-gray-900'
              >
                여행 스타일을 선택해주세요
              </Typography>
              <Typography variant='body1' className='text-gray-600'>
                나만의 여행 취향을 알려주세요 (복수 선택 가능)
              </Typography>
            </div>

            <div className='grid grid-cols-2 gap-3'>
              {TRAVEL_STYLES.map((style) => (
                <Card
                  key={style.id}
                  cardType='selectable'
                  selected={profile.travel_styles.includes(style.id)}
                  onClick={() => toggleStyle(style.id)}
                >
                  <div className='flex flex-col items-center space-y-3 p-4'>
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full ${style.color}`}
                    >
                      <Icon as={style.icon as IconType} className='h-6 w-6' />
                    </div>
                    <Typography
                      variant='body2'
                      className='text-center font-medium'
                    >
                      {style.name}
                    </Typography>
                    {profile.travel_styles.includes(style.id) && (
                      <div className='flex h-5 w-5 items-center justify-center rounded-full bg-blue-500'>
                        <Icon as={FaCheck} className='h-3 w-3 text-white' />
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* 헤더 */}
      <div className='bg-white px-4 py-4 shadow-sm'>
        <div className='mx-auto flex max-w-md items-center justify-between'>
          {step > 1 && (
            <button
              onClick={handleBack}
              className='flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200'
            >
              <Icon as={FaChevronLeft} className='h-5 w-5 text-gray-600' />
            </button>
          )}
          <div className='flex-1 px-4'>
            <div className='h-2 overflow-hidden rounded-full bg-gray-200'>
              <div
                className='h-full bg-blue-500 transition-all duration-300 ease-out'
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <Typography variant='body2' className='text-gray-500'>
            {step}/{TOTAL_STEPS}
          </Typography>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className='mx-auto max-w-md px-4 py-8'>
        {renderStep()}

        {/* 하단 버튼 */}
        <div className='mt-8'>
          <Button
            onClick={handleNext}
            disabled={!canProceed() || loading || isProcessing}
            className='w-full'
            size='large'
          >
            {loading
              ? '가입 중...'
              : isProcessing
                ? '이미지 처리 중...'
                : step === TOTAL_STEPS
                  ? '회원가입 완료'
                  : '다음'}
          </Button>
        </div>

        {step === 1 && (
          <div className='mt-4 text-center'>
            <Typography variant='body2' className='text-gray-500'>
              로그인한 계정: {user.email}
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignUpView;
