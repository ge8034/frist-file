/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 禁用缓存以减少构建输出大小（解决Cloudflare Pages 25MB限制）
  webpack: (config, { dev, isServer }) => {
    // 禁用缓存以减少输出大小
    config.cache = false;

    // 移除大型source maps
    if (!dev) {
      config.devtool = false;
    }

    return config;
  },
  // 启用experimental standalone输出模式（更小的输出）
  experimental: {
    // 这个选项在Next.js 14中可能需要检查兼容性
    // 如果构建失败，请注释掉这一行
    // outputFileTracingRoot: undefined,
  },
  // 压缩输出
  compress: true,
  // 静态导出配置
  output: 'export',
  // 确保trailingSlash为true，便于静态导出
  trailingSlash: true,
  // 图像优化（静态导出时需要禁用或使用非优化版本）
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig