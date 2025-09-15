'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import {
  IoCopyOutline,
  IoCreateOutline,
  IoEyeOutline,
  IoGlobeOutline,
  IoPersonOutline,
} from 'react-icons/io5';

import { Avatar, Button, Input, Typography } from '@ui/components';

import { Modal } from '@/components/basic';
import { useToast } from '@/hooks/useToast';
import { rotateShareLink } from '@/lib/api/invites';
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
  const [accessScope, setAccessScope] = useState<'anyone' | 'owner'>('anyone');
  const [accessPermission, setAccessPermission] = useState<'edit' | 'view'>(
    'edit'
  );
  // 회전(재발급) 버튼 제거: 복사 버튼에서 일괄 처리

  const value = useMemo(() => shareUrl, [shareUrl]);

  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    setShareUrl(`${origin}/invite/p/${shareLinkId}`);
  }, [shareLinkId]);

  const handleCopy = useCallback(async () => {
    try {
      // 오너: 현재 액세스 설정 적용 후 링크 재발급 + 복사
      if (isOwner) {
        // 1) 액세스 수준/기본 권한 적용
        const mappedPermission =
          accessPermission === 'edit' ? 'editor' : 'viewer';
        const { error: scopeErr } = await supabase
          .from('travel_plans')
          .update({ share_link_scope: accessScope })
          .eq('id', planId);
        if (scopeErr) throw scopeErr;
        const { error: permErr } = await supabase
          .from('travel_plans')
          .update({ default_permission: mappedPermission })
          .eq('id', planId);
        if (permErr) throw permErr;

        // 2) 링크 재발급
        const { shareLinkId: newId } = await rotateShareLink(planId);
        const origin =
          typeof window !== 'undefined' ? window.location.origin : '';
        const newUrl = `${origin}/invite/p/${newId}`;
        setShareUrl(newUrl);

        // 3) 복사 (클립보드 실패 시 폴백)
        await navigator.clipboard.writeText(newUrl).catch(() => {
          const temp = document.createElement('textarea');
          temp.value = newUrl;
          document.body.appendChild(temp);
          temp.select();
          document.execCommand('copy');
          document.body.removeChild(temp);
        });
        toast.success('설정 적용 후 새 링크를 복사했어요');
        return;
      }

      // 오너가 아니면 현재 링크만 복사
      await navigator.clipboard.writeText(value);
      toast.success('링크를 복사했어요');
    } catch {
      // fallback (오너 아닐 때 실패한 경우 현재 값 복사)
      const temp = document.createElement('textarea');
      temp.value = value;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand('copy');
      document.body.removeChild(temp);
      toast.success('링크를 복사했어요');
    }
  }, [isOwner, accessPermission, accessScope, planId, supabase, toast, value]);

  // 재발급 전용 버튼 제거 (handleCopy 내에서 수행)

  // 액세스 수준 변경 핸들러 (DB 반영)
  const handleScopeChange = useCallback(
    async (next: 'anyone' | 'owner') => {
      try {
        setAccessScope(next);
        if (!isOwner) return;
        const { error } = await supabase
          .from('travel_plans')
          .update({ share_link_scope: next })
          .eq('id', planId);
        if (error) throw error;
        toast.success('접근 대상을 업데이트했어요');
      } catch {
        toast.error('접근 대상 업데이트에 실패했어요');
      }
    },
    [isOwner, planId, supabase, toast]
  );

  const handlePermissionChange = useCallback(
    async (next: 'edit' | 'view') => {
      try {
        setAccessPermission(next);
        if (!isOwner) return;
        const mapped = next === 'edit' ? 'editor' : 'viewer';
        const { error } = await supabase
          .from('travel_plans')
          .update({ default_permission: mapped })
          .eq('id', planId);
        if (error) throw error;
        toast.success('권한 수준을 업데이트했어요');
      } catch {
        toast.error('권한 수준 업데이트에 실패했어요');
      }
    },
    [isOwner, planId, supabase, toast]
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='동반자 초대' width='lg'>
      <div className='space-y-4 px-6 py-5'>
        {/* 액세스 수준 */}
        <div className='space-y-2'>
          <Typography variant='body2' className='text-gray-700'>
            액세스 수준
          </Typography>
          <div className='flex w-full gap-2'>
            <div
              className={`min-w-0 ${
                accessScope === 'owner' ? 'basis-full' : 'basis-[70%]'
              }`}
            >
              <label className='mb-1 block text-xs text-gray-500'>
                접근 대상
              </label>
              <div className='relative'>
                <span className='pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-gray-500'>
                  {accessScope === 'anyone' ? (
                    <IoGlobeOutline className='h-4 w-4' />
                  ) : (
                    <IoPersonOutline className='h-4 w-4' />
                  )}
                </span>
                <select
                  disabled={!isOwner}
                  value={accessScope}
                  onChange={(e) =>
                    handleScopeChange(
                      (e.target.value as 'anyone' | 'owner') || 'anyone'
                    )
                  }
                  className='w-full rounded border border-gray-300 bg-white py-2 pl-8 pr-2 text-sm'
                >
                  <option value='anyone'>링크가 있는 모든 사용자</option>
                  <option value='owner'>본인만 액세스 가능</option>
                </select>
              </div>
            </div>
            {accessScope !== 'owner' && (
              <div className='min-w-0 basis-[30%]'>
                <label className='mb-1 block text-xs text-gray-500'>
                  권한 수준
                </label>
                <div className='relative'>
                  <span className='pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-gray-500'>
                    {accessPermission === 'edit' ? (
                      <IoCreateOutline className='h-4 w-4' />
                    ) : (
                      <IoEyeOutline className='h-4 w-4' />
                    )}
                  </span>
                  <select
                    disabled={!isOwner}
                    value={accessPermission}
                    onChange={(e) =>
                      handlePermissionChange(
                        (e.target.value as 'edit' | 'view') || 'view'
                      )
                    }
                    className='w-full rounded border border-gray-300 bg-white py-2 pl-8 pr-2 text-sm'
                  >
                    <option value='edit'>편집 가능</option>
                    <option value='view'>보기 가능</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className='flex flex-col gap-2'>
            <Button
              onClick={handleCopy}
              variant='filled'
              colorTheme='blue'
              className='w-full'
              disabled={!value}
              leftIcon={<IoCopyOutline className='h-4 w-4' />}
            >
              {isOwner ? '설정 적용하고 새 링크 복사' : '링크 복사하기'}
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
