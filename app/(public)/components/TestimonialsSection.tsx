// app/(public)/components/TestimonialsSection.tsx
import { Star, TrendingUp } from 'lucide-react'

const testimonials = [
  {
    name: 'Rahul Sharma',
    role: 'Software Engineer → Full-time Trader',
    location: 'Bangalore',
    content: 'I was completely new to the stock market. After completing the Foundation course, I made my first profitable month within 3 months. The options module alone changed my financial life.',
    profit: '+₹1.2L in 3 months',
    rating: 5,
  },
  {
    name: 'Priya Nair',
    role: 'CA → Active Investor',
    location: 'Hyderabad',
    content: 'As a CA I understood numbers, but not market psychology. The technical analysis course here is miles ahead of anything I found on YouTube. Extremely practical and actionable.',
    profit: '+₹85K in 2 months',
    rating: 5,
  },
  {
    name: 'Arjun Mehta',
    role: 'MBA Graduate',
    location: 'Mumbai',
    content: 'Joined the Advanced course after trying 3 other platforms. The quality difference is night and day. Real trade breakdowns, real P&L, real explanations. Worth every rupee.',
    profit: '+₹2.4L in 6 months',
    rating: 5,
  },
  {
    name: 'Sneha Reddy',
    role: 'Homemaker → Part-time Trader',
    location: 'Chennai',
    content: 'I was skeptical at first. But the community support and the way complex concepts are explained in Hindi made it so accessible. Now I trade 2 hours a day and earn a consistent income.',
    profit: '+₹45K/month consistent',
    rating: 5,
  },
  {
    name: 'Vikram Singh',
    role: 'Business Owner',
    location: 'Delhi',
    content: 'Options trading was a black box for me. The Zero to Hero course broke it down so clearly. I use these strategies to hedge my business risks and generate additional income.',
    profit: 'Hedged ₹50L+ portfolio',
    rating: 5,
  },
  {
    name: 'Aditya Kumar',
    role: 'Fresh Graduate',
    location: 'Pune',
    content: 'Started with zero knowledge at 22. By 23 I had made enough from trading to fund my own startup. The risk management module is what truly set me apart from other retail traders.',
    profit: '+₹3.8L in year 1',
    rating: 5,
  },
]

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="section-padding bg-dark-900 overflow-hidden">
      <div className="container-max">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-4 py-1.5 mb-4">
            <span className="text-green-400 text-sm font-medium">Student Results</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Real Students,{' '}
            <span className="gradient-text">Real Profits</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Don't take our word for it. Here's what our students achieved after completing the courses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-dark-800 border border-dark-500 rounded-2xl p-6 hover:border-brand-500/30 transition-all group">
              <div className="flex gap-1 mb-4">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-gold-400 fill-gold-400" />
                ))}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-5">"{t.content}"</p>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-semibold text-sm">{t.name}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{t.role} · {t.location}</div>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-1.5 text-right">
                  <div className="flex items-center gap-1 text-green-400 text-xs font-bold">
                    <TrendingUp className="w-3 h-3" />
                    {t.profit}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
