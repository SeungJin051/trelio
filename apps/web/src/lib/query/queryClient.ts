import { cache } from 'react';

import { QueryClient } from '@tanstack/react-query';

/**
 * QueryClient 인스턴스를 생성하고 캐싱하는 함수
 *
 * React의 cache 함수를 사용하여 동일한 요청에 대해 항상 같은 QueryClient 인스턴스를 반환합니다.
 * 이는 서버 컴포넌트에서 여러 번 호출되더라도 동일한 인스턴스를 재사용하여 메모리 효율성을 높입니다.
 *
 * @returns {QueryClient} 캐싱된 QueryClient 인스턴스
 */
const getQueryClient = cache(
  () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          // 기본 staleTime 설정 (데이터가 오래된 것으로 간주되기 전 시간, 밀리초 단위)
          staleTime: 60 * 1000, // 1분
          // 캐시에 데이터를 유지하는 시간 설정
          gcTime: 5 * 60 * 1000, // 5분
        },
      },
    })
);

export { getQueryClient };
export default getQueryClient;
