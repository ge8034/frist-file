/**
 * 游戏布局
 * 基于 Retro-Futurism 设计系统
 */

'use client'

export default function GameLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* CRT 扫描线效果 */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/3 to-transparent opacity-30 animate-scanline"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/2 to-transparent opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-cyan-500/2 to-transparent opacity-15"></div>
      </div>

      {/* 像素网格背景 */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(to right, #00ffaa 1px, transparent 1px),
                           linear-gradient(to bottom, #00ffaa 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}></div>
      </div>

      {/* 霓虹边框效果 */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-green-500 to-transparent opacity-50"></div>
        <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-pink-500 to-transparent opacity-50"></div>
      </div>

      <div className="relative z-10">
        {children}
      </div>

      {/* 全局动画样式 */}
      <style jsx global>{`
        @keyframes scanline {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100vh);
          }
        }
        .animate-scanline {
          animation: scanline 8s linear infinite;
        }
        @keyframes glitch {
          0% {
            transform: translate(0);
          }
          20% {
            transform: translate(-2px, 2px);
          }
          40% {
            transform: translate(-2px, -2px);
          }
          60% {
            transform: translate(2px, 2px);
          }
          80% {
            transform: translate(2px, -2px);
          }
          100% {
            transform: translate(0);
          }
        }
        .animate-glitch {
          animation: glitch 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
        }
      `}</style>
    </div>
  )
}