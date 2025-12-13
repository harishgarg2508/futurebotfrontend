'use client';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-yellow-500 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-2">Page Not Found</h2>
        <p className="text-white/60 mb-6">The page you&apos;re looking for doesn&apos;t exist.</p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-yellow-500 text-black font-bold rounded-full hover:bg-yellow-400 transition-colors"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
