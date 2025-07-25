/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  webpack(config) {
    // 添加 SVG 文件处理
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
  // 禁用 ESLint
  eslint: {
    // 在构建生产版本时忽略ESLint错误
    ignoreDuringBuilds: true,
  },
  // 禁用 TypeScript 类型检查
  typescript: {
    // 构建时忽略 TypeScript 错误
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
