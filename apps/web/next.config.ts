import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@pixelle/db'],
  serverExternalPackages: ['@prisma/client', '@pixelle/db'],
};

export default nextConfig;