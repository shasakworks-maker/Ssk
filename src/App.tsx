import React, { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './lib/firebase';
import Chat from './components/Chat';
import SplashScreen from './components/SplashScreen';
import LoginPage from './components/LoginPage';
import { Loader2 } from 'lucide-react';
import { AnimatePresence } from 'motion/react';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [user, loading] = useAuthState(auth);

  if (loading && !showSplash) {
    return (
      <div className="min-h-screen bg-[#050507] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <AnimatePresence>
        {showSplash && (
          <SplashScreen key="splash" onFinish={() => setShowSplash(false)} />
        )}
      </AnimatePresence>
      {!showSplash && (
        user ? <Chat /> : <LoginPage />
      )}
    </div>
  );
}
