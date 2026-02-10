/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 明确禁用静态导出（解决 Cloudflare Pages 构建错误）
  output: undefined, // 设置为 undefined 明确禁用静态导出
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
  // 确保trailingSlash为false，避免路径问题
  trailingSlash: false,
}

module.exports = nextConfig