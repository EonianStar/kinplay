/** @type {import('next').NextConfig} */
const nextConfig = {
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
  images:{dangerouslyAllowSVG:true,remotePatterns:[{protocol:"https",hostname:"api.dicebear.com"}]},
};

module.exports = nextConfig;
