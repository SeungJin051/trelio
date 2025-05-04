import withNextIntl from 'next-intl/plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@repo/ui'],
};

export default withNextIntl('./src/i18n/i18n.ts')(nextConfig);
