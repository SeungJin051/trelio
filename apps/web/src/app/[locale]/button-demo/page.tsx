'use client';

import { Button } from '@repo/ui';
import { useTranslations } from 'next-intl';

export default function ButtonDemo() {
  const t = useTranslations('Common');

  return (
    <div className='flex min-h-screen flex-col items-center justify-center p-8 gap-4'>
      <h1 className='text-3xl font-bold mb-8'>Button 컴포넌트 데모</h1>

      <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4'>
        <div className='flex flex-col items-center gap-2'>
          <Button>{t('save')}</Button>
          <span>기본 버튼</span>
        </div>

        <div className='flex flex-col items-center gap-2'>
          <Button variant='destructive'>{t('delete')}</Button>
          <span>위험 버튼</span>
        </div>

        <div className='flex flex-col items-center gap-2'>
          <Button variant='outline'>{t('edit')}</Button>
          <span>외곽선 버튼</span>
        </div>

        <div className='flex flex-col items-center gap-2'>
          <Button variant='secondary'>{t('cancel')}</Button>
          <span>보조 버튼</span>
        </div>

        <div className='flex flex-col items-center gap-2'>
          <Button variant='ghost'>{t('retry')}</Button>
          <span>투명 버튼</span>
        </div>

        <div className='flex flex-col items-center gap-2'>
          <Button variant='link'>문서 보기</Button>
          <span>링크 버튼</span>
        </div>

        <div className='flex flex-col items-center gap-2'>
          <Button size='sm'>작은 버튼</Button>
          <span>작은 크기</span>
        </div>

        <div className='flex flex-col items-center gap-2'>
          <Button size='lg'>큰 버튼</Button>
          <span>큰 크기</span>
        </div>
      </div>

      <div className='mt-8'>
        <Button disabled>{t('loading')}</Button>
        <span className='ml-2'>비활성화 버튼</span>
      </div>

      <div className='mt-8'>
        <a href='/'>홈으로 돌아가기</a>
      </div>
    </div>
  );
}
