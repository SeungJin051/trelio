'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { IoCopyOutline, IoLinkOutline } from 'react-icons/io5';

import { Avatar, Button, Input, Typography } from '@ui/components';

import { Modal } from '@/components/basic';
import { useToast } from '@/hooks/useToast';
import { createClient } from '@/lib/supabase/client/supabase';

interface InviteLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  shareLinkId: string;
  participants: Array<{
    id: string;
    user_id: string;
    role: 'owner' | 'editor' | 'viewer';
    nickname?: string;
    profile_image_url?: string;
  }>;
  isOwner?: boolean;
}

const InviteLinkModal: React.FC<InviteLinkModalProps> = ({
  isOpen,
  onClose,
  planId,
  shareLinkId,
  participants,
  isOwner = false,
}) => {
  const toast = useToast();
  const supabase = createClient();
  const [shareUrl, setShareUrl] = useState('');
  const [localParticipants, setLocalParticipants] = useState(participants);

  const value = useMemo(() => shareUrl, [shareUrl]);

  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    setShareUrl(`${origin}/invite/p/${shareLinkId}`);
  }, [shareLinkId]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success('링크를 복사했어요');
    } catch {
      // fallback
      const temp = document.createElement('textarea');
      temp.value = value;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand('copy');
      document.body.removeChild(temp);
      toast.success('링크를 복사했어요');
    }
  }, [toast, value]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='동반자 초대' width='lg'>
      <div className='space-y-4 px-6 py-5'>
        <div>
          <Typography variant='body2' className='mb-2 text-gray-700'>
            현재 주소
          </Typography>
          <div className='flex flex-col gap-2'>
            <Input
              value={value}
              readOnly
              placeholder='생성된 링크가 여기에 표시됩니다'
              className='w-full'
              leftIcon={<IoLinkOutline className='h-4 w-4' />}
            />
            <Button
              onClick={handleCopy}
              variant='filled'
              colorTheme='blue'
              className='w-full'
              disabled={!value}
              leftIcon={<IoCopyOutline className='h-4 w-4' />}
            >
              링크 복사하기
            </Button>
          </div>
        </div>
        <div className='rounded-lg bg-gray-50 p-3'>
          <Typography variant='caption' className='text-gray-600'>
            동반자에게 링크를 공유하세요. 로그인 후 링크를 열면 이 여행에 참여할
            수 있습니다. 최대 3개의 여행에 참여할 수 있어요.
          </Typography>
        </div>
        <div className='space-y-3'>
          <Typography variant='body2' className='text-gray-700'>
            참여자 관리
          </Typography>
          <div className='space-y-2'>
            {localParticipants.length === 0 ? (
              <Typography variant='caption' className='text-gray-500'>
                아직 참여자가 없습니다.
              </Typography>
            ) : (
              localParticipants.map((p) => (
                <div
                  key={p.id}
                  className='flex items-center justify-between rounded border border-gray-200 p-2'
                >
                  <div className='flex items-center gap-2'>
                    <Avatar
                      src={p.profile_image_url}
                      alt={p.nickname || p.user_id}
                      size='small'
                    />
                    <div>
                      <Typography variant='body2' className='text-gray-900'>
                        {p.nickname || '사용자'}
                      </Typography>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <select
                      disabled={!isOwner || p.role === 'owner'}
                      value={p.role}
                      onChange={async (e) => {
                        const newRole = e.target.value as
                          | 'viewer'
                          | 'editor'
                          | 'owner';
                        try {
                          const { error } = await supabase
                            .from('travel_plan_participants')
                            .update({ role: newRole })
                            .eq('id', p.id)
                            .eq('plan_id', planId);
                          if (error) throw error;
                          setLocalParticipants((prev) =>
                            prev.map((x) =>
                              x.id === p.id ? { ...x, role: newRole } : x
                            )
                          );
                          toast.success('권한을 변경했어요');
                        } catch {
                          toast.error('권한 변경에 실패했어요');
                        }
                      }}
                      className='rounded border border-gray-300 px-2 py-1 text-sm'
                    >
                      <option value='viewer'>viewer</option>
                      <option value='editor'>editor</option>
                      <option value='owner' disabled>
                        owner
                      </option>
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default InviteLinkModal;
