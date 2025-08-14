'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if there's a phone parameter in the URL
    const phone = searchParams.get('phone');
    if (phone) {
      // Redirect to the redirect page to handle WhatsApp link
      router.push(`/redirect?phone=${phone}`);
    }
    
    // Trigger animations after component mounts
    setIsLoaded(true);
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 relative overflow-hidden">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">K</span>
            </div>
            <span className="text-amber-900 font-bold text-xl">KrumbKraft</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#about" className="text-amber-800 hover:text-amber-600 transition-colors">About</a>
            <a href="#products" className="text-amber-800 hover:text-amber-600 transition-colors">Products</a>
            <a href="#contact" className="text-amber-800 hover:text-amber-600 transition-colors">Contact</a>
          </div>
        </div>
      </nav>


      
      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div className={`text-center lg:text-left transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-block mb-6">
              <span className="bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium">
                🔥 Fresh Daily Bakes
              </span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-amber-900 mb-6 leading-tight">
              Artisanal
              <span className="block text-transparent bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text">
                Sourdough
              </span>
              <span className="block text-4xl lg:text-5xl text-amber-700">& Fresh Breads</span>
            </h1>
            
            <p className="text-xl text-amber-700 mb-8 max-w-xl">
              Experience the finest handcrafted sourdough breads, baked fresh daily with traditional techniques and premium ingredients.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-amber-700 hover:to-orange-700 transform hover:scale-105 transition-all duration-200 shadow-lg">
                Order via WhatsApp
              </button>
              <button className="border-2 border-amber-600 text-amber-600 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-amber-50 transition-all duration-200">
                View Menu
              </button>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className={`relative transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div className="relative">
              {/* Main bread showcase */}
              <div className="bg-white rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="text-center">
                  <div className="text-8xl mb-4">🥖</div>
                  <h3 className="text-2xl font-bold text-amber-900 mb-2">Classic Sourdough</h3>
                  <p className="text-amber-700 mb-4">Traditional fermented for 24 hours</p>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-2xl font-bold text-amber-600">₹180</span>
                    <span className="text-sm text-amber-500 line-through">₹220</span>
                  </div>
                </div>
              </div>

              {/* Floating cards */}
              <div className="absolute -top-4 -left-4 bg-white rounded-2xl p-4 shadow-lg animate-bounce">
                <div className="text-3xl">🥐</div>
                <p className="text-xs text-amber-800 mt-1">Croissant</p>
              </div>
              
              <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl p-4 shadow-lg animate-bounce" style={{animationDelay: '1s'}}>
                <div className="text-3xl">🧁</div>
                <p className="text-xs text-amber-800 mt-1">Cupcake</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="about" className="py-20 px-6 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-amber-900 mb-4">Why Choose KrumbKraft?</h2>
            <p className="text-xl text-amber-700 max-w-2xl mx-auto">
              Our passion for authentic baking meets modern convenience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-xl font-semibold text-amber-900 mb-4">WhatsApp Ordering</h3>
              <p className="text-amber-700 leading-relaxed">
                Order seamlessly through WhatsApp with your personalized link. No app downloads needed.
              </p>
            </div>
            
            <div className="text-center p-8 bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold text-amber-900 mb-4">Smart Recognition</h3>
              <p className="text-amber-700 leading-relaxed">
                Returning customers go straight to menu, new customers create quick profiles automatically.
              </p>
            </div>
            
            <div className="text-center p-8 bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="text-xl font-semibold text-amber-900 mb-4">Fresh Delivery</h3>
              <p className="text-amber-700 leading-relaxed">
                Daily fresh bakes delivered to your doorstep. Quality guaranteed from oven to your table.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Showcase */}
      <section id="products" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-amber-900 mb-4">Our Signature Bakes</h2>
            <p className="text-xl text-amber-700">
              Handcrafted with love, baked with tradition
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Classic Sourdough', price: '₹180', emoji: '🥖', desc: 'Traditional 24-hour ferment' },
              { name: 'Artisan Croissant', price: '₹120', emoji: '🥐', desc: 'Buttery, flaky perfection' },
              { name: 'Chocolate Muffin', price: '₹80', emoji: '🧁', desc: 'Rich Belgian chocolate' },
              { name: 'Honey Wheat', price: '₹160', emoji: '🍞', desc: 'Organic wheat & raw honey' }
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105">
                <div className="text-center">
                  <div className="text-6xl mb-4">{item.emoji}</div>
                  <h3 className="text-lg font-semibold text-amber-900 mb-2">{item.name}</h3>
                  <p className="text-sm text-amber-700 mb-3">{item.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-amber-600">{item.price}</span>
                    <button className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-amber-700 transition-colors">
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-amber-600 to-orange-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Order?</h2>
          <p className="text-xl text-amber-100 mb-8 max-w-2xl mx-auto">
            Start your KrumbKraft journey today. Fresh bakes, traditional recipes, modern convenience.
          </p>
          
          <div className="space-y-4">
            <Link 
              href="/redirect?phone=8778710136"
              className="inline-block bg-white text-amber-600 px-8 py-4 rounded-2xl font-semibold mx-2 hover:bg-amber-50 transition-all duration-200 shadow-lg"
            >
              Test with Phone: 8778710136
            </Link>
            <Link 
              href="/redirect?phone=9876543210"
              className="inline-block bg-white text-amber-600 px-8 py-4 rounded-2xl font-semibold mx-2 hover:bg-amber-50 transition-all duration-200 shadow-lg"
            >
              Test with Phone: 9876543210
            </Link>
            <Link 
              href="/redirect?phone=1234567890"
              className="inline-block bg-white text-amber-600 px-8 py-4 rounded-2xl font-semibold mx-2 hover:bg-amber-50 transition-all duration-200 shadow-lg"
            >
              Test with Phone: 1234567890
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-12 px-6 bg-amber-900 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">K</span>
            </div>
            <span className="text-xl font-bold">KrumbKraft</span>
          </div>
          <p className="text-amber-200 mb-4">
            Crafted with care • Powered by modern technology
          </p>
          <p className="text-amber-300 text-sm">
            © 2025 KrumbKraft. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
