import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // The terminal literal correctly suggests placing allowedDevOrigins at the root:
  allowedDevOrigins: ['saturatedly-unpicturesque-alton.ngrok-free.dev'],
} as NextConfig & { allowedDevOrigins?: string[] };


export default nextConfig;
