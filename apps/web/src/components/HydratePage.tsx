import { JSX, PropsWithChildren } from 'react';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { getQueryClient } from '@/lib/query/queryClient';

/**
 * HydratePage 컴포넌트의 Props 타입 정의
 *
 * @property {ReturnType<typeof getQueryClient>} queryClient - React Query의 QueryClient 인스턴스
 */
interface HydratePageProps {
  queryClient: ReturnType<typeof getQueryClient>;
}

/**
 * 서버에서 가져온 데이터를 클라이언트에 하이드레이션하는 컴포넌트
 *
 * 이 컴포넌트는 서버 사이드 렌더링(SSR) 환경에서 서버에서 미리 가져온 데이터를
 * 클라이언트로 전달하여 클라이언트에서 다시 요청하지 않도록 합니다.
 *
 * @param {HydratePageProps & PropsWithChildren} props - 컴포넌트 props
 * @param {ReturnType<typeof getQueryClient>} props.queryClient - React Query의 QueryClient 인스턴스
 * @param {React.ReactNode} props.children - 자식 컴포넌트들
 * @returns {JSX.Element} HydrationBoundary로 감싸진 자식 컴포넌트들
 */
const HydratePage = async ({
  queryClient,
  children,
}: PropsWithChildren<HydratePageProps>): Promise<JSX.Element> => {
  // 이 함수가 Promise<JSX.Element>를 반환하는 이유는 서버 컴포넌트에서
  // 비동기 작업(예: 데이터 페칭)을 수행할 수 있도록 하기 위함입니다.
  // async/await 구문을 사용하여 서버에서 데이터를 가져온 후
  // 이를 클라이언트에 하이드레이션할 수 있습니다.
  // 서버에서 가져온 쿼리 데이터를 직렬화하여 클라이언트로 전달할 수 있는 형태로 변환
  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>
  );
};

export default HydratePage;
