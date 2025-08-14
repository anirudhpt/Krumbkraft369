'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface HeroSectionProps {
  isLoaded: boolean;
}

export default function HeroSection({ isLoaded }: HeroSectionProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="relative z-10 min-h-screen flex items-center justify-center px-6">
      {/* Parallax background effect */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`
        }}
      >
        <div className="absolute top-1/4 left-1/4 text-9xl opacity-20">🥖</div>
        <div className="absolute top-1/3 right-1/4 text-7xl opacity-20">🥐</div>
        <div className="absolute bottom-1/4 left-1/3 text-8xl opacity-20">🍞</div>
      </div>

      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Content */}
        <div className={`text-center lg:text-left transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-block mb-6">
            <span className="bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium animate-pulse">
              🔥 Fresh Daily Bakes
            </span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold text-amber-900 mb-6 leading-tight">
            Artisanal
            <span className="block text-transparent bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text animate-gradient">
              Sourdough
            </span>
            <span className="block text-4xl lg:text-5xl text-amber-700">& Fresh Breads</span>
          </h1>
          
          <p className="text-xl text-amber-700 mb-8 max-w-xl">
            Experience the finest handcrafted sourdough breads, baked fresh daily with traditional techniques and premium ingredients.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link href="#cta">
              <button className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-amber-700 hover:to-orange-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
                Order via WhatsApp
              </button>
            </Link>
            <Link href="#products">
              <button className="border-2 border-amber-600 text-amber-600 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-amber-50 transition-all duration-200">
                View Menu
              </button>
            </Link>
          </div>
        </div>

        {/* Right Content - Hero Image */}
        <div className={`relative transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
          <div className="relative">
            {/* Main bread showcase */}
            <div className="bg-white rounded-3xl p-8 shadow-2xl relative overflow-hidden hover:shadow-3xl transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="text-center relative z-10">
                <div className="text-8xl mb-4 animate-bounce">🥖</div>
                <h3 className="text-2xl font-bold text-amber-900 mb-2">Classic Sourdough</h3>
                <p className="text-amber-700 mb-4">Traditional fermented for 24 hours</p>
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-2xl font-bold text-amber-600">₹180</span>
                  <span className="text-sm text-amber-500 line-through">₹220</span>
                </div>
                <div className="mt-4">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                    18% OFF
                  </span>
                </div>
              </div>
            </div>

            {/* Floating cards */}
            <div className="absolute -top-4 -left-4 bg-white rounded-2xl p-4 shadow-lg animate-bounce hover:scale-110 transition-transform cursor-pointer">
              <div className="text-3xl">🥐</div>
              <p className="text-xs text-amber-800 mt-1 font-medium">Croissant</p>
            </div>
            
            <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl p-4 shadow-lg animate-bounce hover:scale-110 transition-transform cursor-pointer" style={{animationDelay: '1s'}}>
              <div className="text-3xl">🧁</div>
              <p className="text-xs text-amber-800 mt-1 font-medium">Cupcake</p>
            </div>

            {/* Additional floating elements */}
            <div className="absolute top-1/2 -left-8 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full w-6 h-6 animate-ping"></div>
            <div className="absolute top-1/4 -right-6 bg-gradient-to-r from-orange-400 to-red-400 rounded-full w-4 h-4 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
