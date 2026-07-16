import type { NextConfig } from 'next';
import withPWAInit from '@ducanh2912/next-pwa';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const projectRoot = dirname(fileURLToPath(import.meta.url));

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  fallbacks: {
    document: '/',
  },
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  // Pin the tracing root — multiple lockfiles exist above this project.
  outputFileTracingRoot: projectRoot,
  // next-pwa injects a webpack plugin; also pin turbopack.root so a parent
  // lockfile (e.g. ~/pnpm-lock.yaml) doesn't make Turbopack resolve modules
  // from the wrong workspace and break the React Client Manifest (Safari error
  // about global-error.js).
  turbopack: {
    root: projectRoot,
  },
};

export default withPWA(nextConfig);
