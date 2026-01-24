import { CakeSlice } from 'lucide-react';

export default function CoverPage() {
  return (
    <div className="relative h-screen overflow-hidden bg-gradient-to-br from-amber-800 via-amber-900 to-stone-900 text-white">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative h-full flex flex-col items-center justify-center text-center px-4 z-10">
        {/* Animated Cake Icon */}
        <div className="relative w-40 h-40 sm:w-64 sm:h-64 mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-full blur-2xl opacity-30 animate-pulse delay-1000"></div>
          <CakeSlice className="text-white text-5xl sm:text-8xl absolute inset-0 flex items-center justify-center w-20 h-20 sm:w-32 sm:h-32 m-auto animate-bounce" style={{ animationDuration: '2s' }}/>
        </div>

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold text-white mb-4 tracking-tight drop-shadow-lg">
            WhiskeDelights
          </h1>
        </div>

        {/* Subtitle */}
        <div className="mt-8">
          <p className="text-accent text-sm sm:text-lg mb-6 max-w-md mx-auto drop-shadow">
            Premium Artisan Cakes & Custom Creations
          </p>
          <div className="animate-pulse">
            <p className="text-sm text-white/70">Loading deliciousness...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
