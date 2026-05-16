'use client'
// app/(public)/components/StatsSection.tsx
export default function StatsSection() {
  const stats = [
    { value: '2,400+', label: 'Students Enrolled' },
    { value: '₹18 Cr+', label: 'Student Profits' },
    { value: '94%', label: 'Success Rate' },
    { value: '12+', label: 'Years Experience' },
  ]
  return (
    <section className="border-y border-dark-600 bg-dark-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-3xl sm:text-4xl font-black gradient-text mb-1">{value}</div>
              <div className="text-gray-400 text-sm font-medium">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
