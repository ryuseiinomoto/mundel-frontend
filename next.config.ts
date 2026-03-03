import type { NextConfig } from "next";

// nextConfig 全体を any として扱うことで、実験的機能の型エラーを無視します
const nextConfig: any = {
  reactCompiler: true,
  experimental: {
    allowedDevOrigins: ["192.0.0.2:3000"],
  },
};

export default nextConfig as NextConfig;