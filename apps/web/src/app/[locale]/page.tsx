'use client';

import { useTripStore } from '@/store/useTripStore';
import { useUserStore } from '@/store/useUserStore';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

interface ExampleResponse {
  success: boolean;
  message: string;
}

export default function Home() {
  const t = useTranslations('Index');
  const { user, isLoggedIn, setUser } = useUserStore();
  const { trips, addTrip } = useTripStore();

  // 데모 쿼리
  const { data, isLoading, error } = useQuery<ExampleResponse>({
    queryKey: ['example'],
    queryFn: async () => {
      // 실제 API 호출 대신 예시 데이터 반환
      return new Promise<ExampleResponse>((resolve) => {
        setTimeout(() => {
          resolve({ success: true, message: '데이터 로드 성공' });
        }, 1000);
      });
    },
  });

  // 데모 목적의 로그인
  const handleLogin = () => {
    setUser({
      id: '1',
      name: '홍길동',
      email: 'user@example.com',
    });
  };

  // 데모 목적의 여행 추가
  const handleAddTrip = () => {
    addTrip({
      title: '제주도 여행',
      destination: '제주도',
      startDate: '2023-11-01',
      endDate: '2023-11-05',
      description: '가족과 함께하는 제주도 여행',
      image: 'https://example.com/jeju.jpg',
      isCompleted: false,
    });
  };

  return (
    <main className='flex min-h-screen flex-col items-center justify-center p-8'>
      <h1 className='mb-4 text-4xl font-bold'>{t('title')}</h1>
      <p className='mb-8 text-lg'>{t('subtitle')}</p>

      <div className='mb-8 flex flex-col gap-4'>
        <button
          onClick={handleLogin}
          className='rounded-md bg-blue-600 px-4 py-2 text-white'
        >
          {isLoggedIn ? '이미 로그인됨' : '로그인 테스트'}
        </button>

        {isLoggedIn && (
          <div className='rounded-md border p-4'>
            <h2 className='mb-2 text-xl font-bold'>사용자 정보</h2>
            <p>이름: {user?.name}</p>
            <p>이메일: {user?.email}</p>
          </div>
        )}

        <button
          onClick={handleAddTrip}
          className='rounded-md bg-green-600 px-4 py-2 text-white'
        >
          여행 추가 테스트
        </button>

        {trips.length > 0 && (
          <div className='rounded-md border p-4'>
            <h2 className='mb-2 text-xl font-bold'>여행 목록</h2>
            <ul className='list-disc pl-5'>
              {trips.map((trip) => (
                <li key={trip.id}>
                  {trip.title} ({trip.startDate} ~ {trip.endDate})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className='w-full max-w-md rounded-md border p-4'>
        <h2 className='mb-2 text-xl font-bold'>React Query 테스트</h2>
        {isLoading ? (
          <p>로딩 중...</p>
        ) : error ? (
          <p className='text-red-500'>에러 발생</p>
        ) : (
          <p>{data?.message}</p>
        )}
      </div>

      <div className='mt-8'>
        <a href='/button-demo' className='text-blue-500 hover:underline'>
          버튼 컴포넌트 데모 보기
        </a>
      </div>
    </main>
  );
}
