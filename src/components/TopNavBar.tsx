'use client';

import { User } from '@/lib/userService';

interface TopNavBarProps {
  user: User;
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  onLogout?: () => void;
  rightContent?: React.ReactNode;
}

export default function TopNavBar({
  user,
  title = "KrumbKraft",
  subtitle,
  showBackButton = false,
  onBackClick,
  onLogout,
  rightContent
}: TopNavBarProps) {
  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Left Side */}
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <button
                onClick={onBackClick}
                className="text-gray-600 hover:text-gray-800 transition-colors text-xl"
              >
                ←
              </button>
            )}
            <div className="text-2xl">🍽️</div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{title}</h1>
              {subtitle && (
                <p className="text-sm text-gray-600">{subtitle}</p>
              )}
            </div>
          </div>
          
          {/* Right Side */}
          <div className="flex items-center space-x-6">
            {/* User Info */}
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-800">
                {user.name || 'Guest'}
              </p>
              <p className="text-sm text-gray-600">
                {user.phoneNumber}
              </p>
            </div>
            
            {/* Custom Right Content */}
            {rightContent}
            
            {/* Logout Button (only show if onLogout is provided) */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
