import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center px-6">
      <p className="label text-orange-500 mb-4">404</p>
      <h1 className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-tight mb-6 text-center">
        Page not found
      </h1>
      <Link
        href="/"
        className="label text-white/70 hover:text-white border border-white/20 px-6 py-3 transition-colors"
      >
        Back to home
      </Link>
    </div>
  )
}
