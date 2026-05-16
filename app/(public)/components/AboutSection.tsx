import { CheckCircle, Award, Users, BookOpen, Clock } from 'lucide-react'

export default function AboutSection() {
  const features = [
    'Learn from NISM certified professionals',
    'Real trade examples — not simulated',
    'SMC, ICT & Liquidity concepts',
    'Risk management & journaling',
    'Private community support',
    'Lifetime access to all content',
  ]
  return (
    <section id="about" className="section-padding bg-dark-800/30">
      <div className="container-max">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/30 rounded-full px-4 py-1.5 mb-6">
              <span className="text-brand-400 text-sm font-medium">About The Program</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-6">
              Taught by Traders,<br />
              <span className="gradient-text">Not Just Teachers</span>
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-8">
              Every instructor at 1% Traders Hub is an active participant in Indian financial markets. We don't teach theory — we teach exactly what works in today's markets, backed by real P&L.
            </p>
            <ul className="space-y-3">
              {features.map(f => (
                <li key={f} className="flex items-center gap-3 text-gray-300">
                  <CheckCircle className="w-5 h-5 text-brand-500 flex-shrink-0" />
                  <span className="text-sm">{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Award, value: '7+ Years', label: 'Market Experience', color: 'from-brand-500/20 to-brand-600/10' },
              { icon: Users, value: '150+', label: 'Active Students', color: 'from-gold-500/20 to-gold-600/10' },
              { icon: BookOpen, value: '50+', label: 'Video Lessons', color: 'from-green-500/20 to-green-600/10' },
              { icon: Clock, value: 'Lifetime', label: 'Access Included', color: 'from-blue-500/20 to-blue-600/10' },
            ].map(({ icon: Icon, value, label, color }) => (
              <div key={label} className={`bg-gradient-to-br ${color} border border-dark-500 rounded-2xl p-6 flex flex-col items-center text-center`}>
                <Icon className="w-8 h-8 text-brand-400 mb-3" />
                <div className="text-2xl font-black text-white mb-1">{value}</div>
                <div className="text-gray-400 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
