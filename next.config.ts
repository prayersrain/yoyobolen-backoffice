import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // The terminal literal correctly suggests placing allowedDevOrigins at the root:
  allowedDevOrigins: ['saturatedly-unpicturesque-alton.ngrok-free.dev'],
} as NextConfig & { allowedDevOrigins?: string[] };


export default nextConfig;
