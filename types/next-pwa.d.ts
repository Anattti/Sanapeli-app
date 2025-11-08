declare module "next-pwa" {
  import type { NextConfig } from "next";

  interface PWAConfig {
    dest: string;
    disable?: boolean;
    register?: boolean;
    skipWaiting?: boolean;
    runtimeCaching?: unknown;
    buildExcludes?: RegExp[];
    scope?: string;
    sw?: string;
    fallbacks?: Record<string, string>;
  }

  export default function nextPWA(
    config?: PWAConfig
  ): (nextConfig: NextConfig) => NextConfig;
}

declare module "next-pwa/cache" {
  const runtimeCaching: unknown;
  export default runtimeCaching;
}

