'use client';

import { useEffect, useMemo, useState } from 'react';

import { useParams, useRouter } from 'next/navigation';

import { IoPeopleOutline, IoShieldCheckmarkOutline } from 'react-icons/io5';

import { Button, Typography } from '@ui/components';

import { useSession } from '@/hooks/useSession';
import { acceptShareLink, verifyShareLink } from '@/lib/api/invites';

const InviteSharePage = () => {
  const params = useParams();
  const router = useRouter();
  const { session, loading } = useSession() as {
    session: unknown;
    loading: boolean;
  };
  const shareId = params.shareId as string;

  const [loadingVerify, setLoadingVerify] = useState(true);
  const [plan, setPlan] = useState<{ planId: string; title: string } | null>(
    null
  );
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState<null | {
    type: 'error' | 'info';
    text: string;
    ctaLabel?: string;
    ctaAction?: () => void;
  }>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const data = await verifyShareLink(shareId);
      if (!mounted) return;
      setPlan(data);
      setLoadingVerify(false);
    })();
    return () => {
      mounted = false;
    };
  }, [shareId]);

  const title = useMemo(() => {
    if (loadingVerify) return '초대 확인 중...';
    if (plan) return `여행 참여 확인`;
    return '초대 링크가 유효하지 않습니다';
  }, [loadingVerify, plan]);

  const handleAccept = async () => {
    if (!plan) return;
    if (!session && !loading) {
      router.replace(`/log-in?next=/invite/p/${shareId}`);
      return;
    }
    try {
      setSubmitting(true);
      const res = await acceptShareLink(shareId);
      router.replace(`/travel/${res.planId}`);
    } catch (err: any) {
      const code = String(err?.message || 'ERROR');
      if (code === 'UNAUTHORIZED') {
        setBanner({
          type: 'info',
          text: '로그인이 필요합니다. 로그인 후 이 페이지로 돌아옵니다.',
          ctaLabel: '로그인하기',
          ctaAction: () => router.replace(`/log-in?next=/invite/p/${shareId}`),
        });
        return;
      }
      if (code === 'ALREADY_PARTICIPANT') {
        setBanner({
          type: 'info',
          text: '이미 참여 중인 여행입니다.',
          ctaLabel: '여행으로 이동',
          ctaAction: () => router.replace(`/travel/${plan!.planId}`),
        });
        return;
      }
      if (code === 'PARTICIPATION_LIMIT_EXCEEDED') {
        setBanner({
          type: 'error',
          text: '참여 가능한 최대 여행 수(3개)를 초과했습니다.',
        });
        return;
      }
      if (code === 'LINK_EXPIRED') {
        setBanner({ type: 'error', text: '초대 링크가 만료되었습니다.' });
        return;
      }
      if (code === 'INVALID_REQUEST') {
        setBanner({ type: 'error', text: '유효하지 않은 요청입니다.' });
        return;
      }
      if (code === 'LINK_CLOSED') {
        setBanner({
          type: 'error',
          text: '이 초대는 더 이상 유효하지 않습니다.',
        });
        return;
      }
      if (code.startsWith('FAILED:')) {
        setBanner({ type: 'error', text: `참여 실패: ${code.substring(7)}` });
        return;
      }
      setBanner({ type: 'error', text: '참여 처리에 실패했습니다.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen w-full bg-gray-50'>
      <div className='mx-auto flex max-w-lg flex-col items-center px-4 py-16'>
        <div className='mb-6 rounded-full bg-blue-100 p-3 text-blue-600'>
          <IoPeopleOutline className='h-6 w-6' />
        </div>

        <Typography variant='h4' className='mb-2 text-center'>
          {title}
        </Typography>

        {loadingVerify && (
          <div className='mt-6 w-full rounded-xl bg-white p-5 shadow-sm'>
            <div className='space-y-3'>
              <div className='h-6 w-40 animate-pulse rounded bg-gray-200' />
              <div className='h-4 w-full animate-pulse rounded bg-gray-100' />
              <div className='h-4 w-2/3 animate-pulse rounded bg-gray-100' />
            </div>
          </div>
        )}

        {!loadingVerify && plan && (
          <div className='mt-6 w-full rounded-xl border border-gray-200 bg-white p-6 shadow-sm'>
            <div className='mb-4 flex items-start gap-3'>
              <div className='rounded-md bg-gray-100 p-2 text-gray-600'>
                <IoShieldCheckmarkOutline className='h-5 w-5' />
              </div>
              <div className='flex-1'>
                <Typography variant='h6' className='mb-1 text-gray-900'>
                  {plan.title} 여행에 참여
                </Typography>
                <Typography variant='body2' className='text-gray-600'>
                  참여를 누르면 이 여행의 일정과 공동 할 일을 함께 관리할 수
                  있어요.
                </Typography>
              </div>
            </div>

            {banner && (
              <div
                className={`mb-4 rounded-lg p-3 text-sm ${
                  banner.type === 'error'
                    ? 'border border-red-100 bg-red-50 text-red-700'
                    : 'border border-blue-100 bg-blue-50 text-blue-700'
                }`}
              >
                <div className='flex items-center justify-between gap-3'>
                  <span>{banner.text}</span>
                  {banner.ctaLabel && banner.ctaAction && (
                    <Button
                      onClick={banner.ctaAction}
                      variant='outlined'
                      colorTheme={banner.type === 'error' ? 'red' : 'blue'}
                      size='small'
                    >
                      {banner.ctaLabel}
                    </Button>
                  )}
                </div>
              </div>
            )}

            <div className='mt-5 flex gap-2'>
              <Button
                onClick={handleAccept}
                disabled={submitting}
                variant='filled'
                colorTheme='blue'
                className='flex-1'
              >
                참여하기
              </Button>
              <Button
                onClick={() => router.replace('/')}
                variant='outlined'
                colorTheme='gray'
                className='flex-1'
              >
                나중에 할게요
              </Button>
            </div>

            {!session && (
              <div className='mt-3 text-center'>
                <Typography variant='caption' className='text-gray-500'>
                  참여에는 로그인이 필요합니다. 참여하기를 누르면 로그인 후 이
                  페이지로 돌아와요.
                </Typography>
              </div>
            )}
          </div>
        )}

        {!loadingVerify && !plan && (
          <div className='mt-6 w-full rounded-xl border border-red-100 bg-red-50 p-6 text-center'>
            <Typography variant='body2' className='mb-2 text-red-700'>
              초대 링크가 유효하지 않습니다.
            </Typography>
            <Typography variant='caption' className='text-red-600'>
              링크가 만료되었거나 잘못된 주소일 수 있어요.
            </Typography>
            <div className='mt-4'>
              <Button
                onClick={() => router.replace('/')}
                variant='filled'
                colorTheme='gray'
              >
                홈으로 돌아가기
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InviteSharePage;
