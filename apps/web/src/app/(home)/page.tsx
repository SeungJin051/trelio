import HomeClient from './components/HomeClient';

/**
 * SSG 강제 설정
 * 세션 체크를 클라이언트로 이동하여 서버 컴포넌트가 정적으로 빌드되도록 함
 */
export const dynamic = 'force-static';

/**
 * 홈 페이지 - 서버 컴포넌트 (SSG)
 *
 * 동작 방식:
 * - 빌드 시점: 정적 HTML 생성 (클라이언트 컴포넌트가 초기에는 로그인 전 페이지 표시)
 * - 런타임: 클라이언트에서 세션 체크 후 필요시 로그인 후 페이지로 전환
 */
export default function HomePage() {
  // 클라이언트 컴포넌트에서 세션 체크 및 조건부 렌더링
  // 초기 렌더링은 로그인 전 페이지로 SSG 빌드됨
  return <HomeClient />;
}
