import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Trophy, Home, User, Bell, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, profile, logOut, signIn } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Tournaments', href: '/tournaments', icon: Trophy },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Notifications', href: '/notifications', icon: Bell },
  ];

  if (profile?.isAdmin) {
    navigation.push({ name: 'Admin', href: '/admin', icon: LayoutDashboard });
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-white/20">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Trophy className="text-black w-6 h-6" />
                </div>
                <span className="text-xl font-bold tracking-tighter">SHASAK</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                    isActive(item.href)
                      ? "bg-white text-black"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  )}
                >
                  {item.name}
                </Link>
              ))}
              {!user ? (
                <button
                  onClick={signIn}
                  className="ml-4 px-6 py-2 bg-white text-black rounded-full font-bold text-sm hover:scale-105 transition-transform"
                >
                  Sign In
                </button>
              ) : (
                <button
                  onClick={logOut}
                  className="ml-4 p-2 text-white/60 hover:text-red-500 transition-colors"
                  title="Log Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-white/60 focus:outline-none"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden bg-[#0a0a0a] border-b border-white/10"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors",
                      isActive(item.href)
                        ? "bg-white text-black"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                ))}
                {!user ? (
                  <button
                    onClick={() => {
                        signIn();
                        setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 bg-white text-black rounded-xl font-bold flex items-center gap-3 mt-4"
                  >
                    Sign In
                  </button>
                ) : (
                  <button
                    onClick={() => {
                        logOut();
                        setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-red-500 rounded-xl font-medium flex items-center gap-3"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 bg-black">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Trophy className="text-black w-5 h-5" />
            </div>
            <span className="text-lg font-bold tracking-tighter">SHASAK</span>
          </div>
          <p className="text-white/40 text-sm max-w-md mx-auto mb-8">
            The ultimate destination for Free Fire competitive gaming. Join, compete, and dominate.
          </p>
          <div className="flex justify-center gap-8 mb-8">
            <Link to="/faq" className="text-white/60 hover:text-white text-sm transition-colors">FAQ</Link>
            <Link to="/contact" className="text-white/60 hover:text-white text-sm transition-colors">Support</Link>
            <Link to="/terms" className="text-white/60 hover:text-white text-sm transition-colors">Terms</Link>
          </div>
          <p className="text-white/20 text-xs font-mono">
            © 2026 SHASAK TOURNAMENT. ALL RIGHTS RESERVED.
          </p>
        </div>
      </footer>
    </div>
  );
}
