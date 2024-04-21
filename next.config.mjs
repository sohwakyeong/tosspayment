import { config } from 'dotenv';
config();
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    async rewrites() {
      return [
        {
          source: "/",
          destination: "/checkout",
        },
      ];
    },
  };
  
export default nextConfig;
  