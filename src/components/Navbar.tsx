import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Vote, LogOut, User, Users, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navbar: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/candidates', label: 'Candidates', icon: Users },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-black/90 backdrop-blur-lg glass-effect shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white transition-all duration-300 group-hover:scale-110 group-hover:shadow-purple-500/50 group-hover:rotate-y-5 transform-3d">
              <Vote className="w-6 h-6" />
            </div>
            <span className="font-display font-bold text-2xl text-white">
              E-Vote
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link key={path} to={path}>
                <Button
                  variant={isActive(path) ? 'default' : 'ghost'}
                  size="sm"
                  className={`gap-2 transition-all duration-300 ${
                    isActive(path) 
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-purple-500/30' 
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Auth Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link to="/register-candidate">
                  <Button variant="outline" size="sm" className="gap-2 hidden sm:flex border-purple-500 text-purple-300 hover:bg-gradient-to-r hover:from-purple-600 hover:to-indigo-600 hover:text-white hover:border-purple-600 transition-all duration-300">
                    <User className="w-4 h-4" />
                    Register Candidate
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="gap-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-all duration-300"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300">
                    Login
                  </Button>
                </Link>
                <Link to="/register-voter">
                  <Button variant="default" size="sm" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;