import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';

export default function AppHeader({ onMenuClick }) {
  const { logout } = useAuth();

  return (
    <header className="border-b bg-background sticky top-0 z-40">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 hover:bg-muted rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 6l9-4 9 4v6c0 5-4 9-9 11-5-2-9-6-9-11V6z" />
              </svg>
            </div>
            <span className="hidden sm:inline">Wakili</span>
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
