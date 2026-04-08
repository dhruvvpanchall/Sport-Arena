import { Link } from 'react-router-dom'

const sports = [
  { icon: '⚽', label: 'Football' },
  { icon: '🏏', label: 'Cricket' },
  { icon: '🏸', label: 'Badminton' },
  { icon: '🎾', label: 'Tennis' },
]

export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      {/* Left Branding Panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-green-950 via-green-900 to-green-800 text-white items-center justify-center p-12 relative overflow-hidden">
        <div className="relative z-10 max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-5xl drop-shadow-lg">🏟️</span>
            <h1 className="text-4xl font-extrabold tracking-tight">Sport Arena</h1>
          </div>

          <p className="text-lg text-green-100/80 leading-relaxed mb-8">
            Book turfs, join tournaments & play your favourite sport — all in one place.
          </p>

          {/* Sport Chips */}
          <div className="flex flex-wrap gap-2.5 mb-10">
            {sports.map((s) => (
              <span
                key={s.label}
                className="flex items-center gap-1.5 bg-white/10 backdrop-blur border border-white/15 px-4 py-2 rounded-full text-sm font-medium text-white/90 hover:bg-white/20 transition"
              >
                {s.icon} {s.label}
              </span>
            ))}
          </div>

          {/* Features */}
          <div className="space-y-5">
            <div className="flex gap-3.5 items-start">
              <span className="text-3xl shrink-0">📅</span>
              <div>
                <strong className="block text-[15px] font-semibold">Book Turfs Instantly</strong>
                <p className="text-sm text-white/60">Reserve football, cricket & badminton turfs near you</p>
              </div>
            </div>
            <div className="flex gap-3.5 items-start">
              <span className="text-3xl shrink-0">🏆</span>
              <div>
                <strong className="block text-[15px] font-semibold">Join Tournaments</strong>
                <p className="text-sm text-white/60">Compete in local & city-level sports tournaments</p>
              </div>
            </div>
            <div className="flex gap-3.5 items-start">
              <span className="text-3xl shrink-0">👥</span>
              <div>
                <strong className="block text-[15px] font-semibold">Find Players</strong>
                <p className="text-sm text-white/60">Connect with players and build your dream team</p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative field lines */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-[3px] border-white rounded-full" />
          <div className="absolute top-1/2 left-0 right-0 h-[3px] bg-white" />
          <div className="absolute top-0 bottom-0 left-1/2 w-[3px] bg-white" />
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-white">
        <div className="w-full max-w-[420px]">
          {/* Mobile Logo */}
          <Link
            to="/"
            className="lg:hidden flex items-center gap-2 text-xl font-extrabold text-green-800 no-underline mb-8"
          >
            <span>🏟️</span> Sport Arena
          </Link>
          {children}
        </div>
      </div>
    </div>
  )
}
