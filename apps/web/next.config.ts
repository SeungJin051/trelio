import type { NextConfig } from 'next';
import withNextIntl from 'next-intl/plugin';

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@repo/ui'],

  // 성능 최적화 설정
  images: {
    // 이미지 최적화 설정
    formats: ['image/avif', 'image/webp'],
  },

  // 압축 설정
  compress: true,

  // 레거시 브라우저 지원 제거
  compiler: {
    // SWC 컴파일러 최적화
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error', 'warn'],
          }
        : false,
  },

  // 실험적 기능: 레거시 JavaScript 제거
  experimental: {
    // Modern browsers만 지원하여 레거시 폴리필 제거
    optimizePackageImports: ['@repo/ui'],
  },

  // 환경 변수 처리 개선
  env: {
    // 빌드 시 환경 변수가 없는 경우 기본값 제공
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-anon-key',
    NEXT_PUBLIC_SITE_URL:
      process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  },

  // 빌드 시 환경 변수 상태 로깅
  webpack: (config: any, { dev }: { dev: boolean }) => {
    if (!dev) {
      console.log('🔧 Next.js 빌드 환경 변수 상태:');
      console.log(
        '  NEXT_PUBLIC_SUPABASE_URL:',
        !!process.env.NEXT_PUBLIC_SUPABASE_URL
      );
      console.log(
        '  NEXT_PUBLIC_SUPABASE_ANON_KEY:',
        !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );
      console.log('  VERCEL:', !!process.env.VERCEL);
      console.log('  NODE_ENV:', process.env.NODE_ENV);
    }

    // 레거시 JavaScript 제거를 위한 설정
    if (!dev && config.optimization) {
      // Modern browsers만 지원하도록 설정
      config.optimization.usedExports = true;
    }

    return config;
  },
};

export default withNextIntl('./src/i18n/i18n.ts')(nextConfig);
