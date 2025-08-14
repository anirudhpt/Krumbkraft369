'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getUserByPhoneNumber, createUser, updateUserLastLogin, updateUserProfile, User } from '@/lib/userService';
import { extractPhoneFromUrl, isValidPhoneNumber } from '@/lib/phoneUtils';

export default function RedirectPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    handleRedirect();
  }, []);

  const handleRedirect = async () => {
    try {
      setLoading(true);
      setError(null);

      // Extract phone number from URL - use exact value
      const phone = searchParams.get('phone') || extractPhoneFromUrl(window.location.href);
      
      if (!phone) {
        setError('No phone number found in URL');
        return;
      }

      if (!isValidPhoneNumber(phone)) {
        setError('Invalid phone number format');
        return;
      }

      setPhoneNumber(phone); // Use exact phone number from URL

      // Check if user exists in Firestore
      const existingUser = await getUserByPhoneNumber(phone);

      if (existingUser) {
        // User exists - check if they have a name
        if (existingUser.name && existingUser.name.trim() !== '') {
          // User has a name - update last login and redirect to home
          await updateUserLastLogin(existingUser.id);
          setUser(existingUser);
          
          // Redirect to home page with user info
          localStorage.setItem('currentUser', JSON.stringify(existingUser));
          router.push('/home');
        } else {
          // User exists but no name - show form to complete profile
          setUser(existingUser);
          setIsNewUser(true);
        }
      } else {
        // User doesn't exist - show new user form
        setIsNewUser(true);
      }
    } catch (err) {
      console.error('Error handling redirect:', err);
      setError('An error occurred while processing your request');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (name: string, email?: string) => {
    if (!phoneNumber) return;

    try {
      setLoading(true);
      
      let updatedUser: User;
      
      if (user && user.id) {
        // User exists but needs to update profile
        updatedUser = await updateUserProfile(user.id, { name, email });
      } else {
        // Create completely new user
        updatedUser = await createUser(phoneNumber, { name, email });
      }
      
      setUser(updatedUser);
      
      // Save user to localStorage and redirect to home
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      router.push('/home');
    } catch (err) {
      console.error('Error creating/updating user:', err);
      setError('Failed to save user information');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-flour-50 via-sourdough-50 to-krumb-50 flex items-center justify-center">
        <div className="text-center bg-white/90 backdrop-blur-sm rounded-3xl p-12 shadow-large border border-flour-200">
          <div className="w-16 h-16 bg-gradient-to-br from-krumb-400 to-krumb-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
            <span className="text-2xl text-white font-bold">K</span>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-3 border-krumb-200 border-t-krumb-600 mx-auto mb-6"></div>
          <p className="text-sourdough-700 font-medium text-lg">Processing your order...</p>
          <p className="text-sourdough-500 text-sm mt-2">Connecting to KrumbKraft</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-flour-50 via-sourdough-50 to-krumb-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md mx-auto bg-white/90 backdrop-blur-sm rounded-3xl p-12 shadow-large border border-red-200">
          <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl text-white">!</span>
          </div>
          <h1 className="text-2xl font-bold text-sourdough-800 mb-4">Oops! Something went wrong</h1>
          <p className="text-sourdough-600 mb-8 leading-relaxed">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-krumb-500 to-krumb-600 text-white px-8 py-3 rounded-2xl hover:from-krumb-600 hover:to-krumb-700 transition-all duration-300 shadow-warm hover:shadow-large transform hover:-translate-y-1 font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (isNewUser && phoneNumber) {
    return <NewUserForm phoneNumber={phoneNumber} onCreateUser={handleCreateUser} isExistingUser={user !== null} />;
  }

  return null;
}

function NewUserForm({ 
  phoneNumber, 
  onCreateUser,
  isExistingUser = false
}: { 
  phoneNumber: string; 
  onCreateUser: (name: string, email?: string) => void;
  isExistingUser?: boolean;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }

    setIsSubmitting(true);
    await onCreateUser(name.trim(), email.trim() || undefined);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-flour-50 via-sourdough-50 to-krumb-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-bread-texture opacity-30"></div>
      
      <div className="relative z-10 bg-white/95 backdrop-blur-sm rounded-3xl shadow-large p-12 max-w-lg w-full border border-flour-200">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-krumb-400 to-krumb-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-warm">
            <span className="text-3xl font-bold text-white">K</span>
          </div>
          <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-krumb-600 to-crust-600 bg-clip-text mb-4 font-display">
            {isExistingUser ? 'Complete Your Profile' : 'Welcome to KrumbKraft!'}
          </h1>
          <div className="bg-sourdough-50 rounded-2xl p-6 mb-6 border border-sourdough-100">
            <p className="text-sourdough-700 font-medium mb-2">
              Phone: <span className="font-bold text-krumb-600">{phoneNumber}</span>
            </p>
            <p className="text-sourdough-600 text-sm">
              {isExistingUser 
                ? 'Please add your name to access our fresh bread selection' 
                : 'Join our artisanal bread community and start your order'
              }
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-base font-semibold text-sourdough-800 mb-3">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-6 py-4 border-2 border-flour-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-krumb-200 focus:border-krumb-400 transition-all duration-300 text-sourdough-800 placeholder-sourdough-400 bg-white/80 backdrop-blur-sm"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-base font-semibold text-sourdough-800 mb-3">
              Email Address <span className="text-sourdough-500 font-normal">(Optional)</span>
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-4 border-2 border-flour-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-krumb-200 focus:border-krumb-400 transition-all duration-300 text-sourdough-800 placeholder-sourdough-400 bg-white/80 backdrop-blur-sm"
              placeholder="your@email.com"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-krumb-500 to-krumb-600 text-white py-4 px-8 rounded-2xl hover:from-krumb-600 hover:to-krumb-700 focus:outline-none focus:ring-4 focus:ring-krumb-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-warm hover:shadow-large transform hover:-translate-y-1 font-bold text-lg"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                Creating Account...
              </div>
            ) : (
              'Start Browsing Fresh Breads'
            )}
          </button>
        </form>
        
        <div className="mt-8 text-center">
          <p className="text-sourdough-500 text-sm">
            By continuing, you agree to receive updates about fresh bread availability
          </p>
        </div>
      </div>
    </div>
  );
}
