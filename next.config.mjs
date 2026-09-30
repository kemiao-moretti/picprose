/** @type {import('next').NextConfig} */
import createNextIntlPlugin from 'next-intl/plugin';
 
const withNextIntl = createNextIntlPlugin('./i18n.ts');
 
 
const nextConfig = {
    // Static export is a production/Pages concern. Keep dev dynamic so the
    // generated local Unsplash Route Handler can run under `pnpm dev`.
    output: process.env.NODE_ENV === 'development' ? undefined : 'export',
    trailingSlash: true,
    typescript: {
      ignoreBuildErrors: true,
    },
    reactStrictMode: false,
};

export default withNextIntl(nextConfig);