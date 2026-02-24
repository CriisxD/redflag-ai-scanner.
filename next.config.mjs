/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for better-sqlite3 native module
  serverExternalPackages: ['better-sqlite3'],
};

export default nextConfig;
