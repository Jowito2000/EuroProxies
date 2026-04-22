import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdf-lib', 'sharp', 'nodemailer'],
  serverActions: {
    bodySizeLimit: '50mb'
  }
};

export default nextConfig;
