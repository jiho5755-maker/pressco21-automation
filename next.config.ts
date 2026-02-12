import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // 파일 업로드를 위한 크기 제한 (기본 1MB)
    },
  },
};

export default nextConfig;
