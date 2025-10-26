"use client"

export function Banner() {
  return (
    <header className="w-full" aria-label="Chahat Gems & Jewels header">
      <div className="w-full px-6 py-8 bg-white md:px-8 md:py-12 lg:px-10 lg:py-16">
        <div className="flex flex-col items-center gap-6 text-center">
          {/* Main heading */}
          <div className="space-y-3">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
              Chahat Gems & Jewels
            </h1>
            <p className="text-xl font-semibold text-gray-700 md:text-1xl lg:text-2xl">
            Luxury You Deserve, Brilliance You Wear
            </p>
          </div>

   
        </div>
      </div>
    </header>
  )
}