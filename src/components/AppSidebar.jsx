import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Briefcase, 
  Clock, 
  Lightbulb, 
  FileText, 
  Settings,
  X 
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'War Room', icon: Home },
  { path: '/matters', label: 'Matters', icon: Briefcase },
  { path: '/chronos', label: 'Chronos', icon: Clock },
  { path: '/intel', label: 'Intelligence', icon: Lightbulb },
  { path: '/docauto', label: 'Documents', icon: FileText },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function AppSidebar({ isOpen, onClose }) {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-30"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative w-64 h-[calc(100vh-64px)] bg-muted/50 border-r transition-transform md:translate-x-0 z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full p-4">
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="md:hidden p-2 hover:bg-muted rounded-lg self-end mb-4"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Navigation Items */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer info */}
          <div className="pt-4 border-t text-xs text-muted-foreground">
            <p className="font-semibold mb-1">Wakili Legal Suite</p>
            <p>v1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  );
}
