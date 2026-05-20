import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, LogIn, Activity, ShieldCheck, HeartPulse } from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#050507] text-zinc-100 flex items-center justify-center relative overflow-hidden font-sans">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(at_0%_0%,_rgba(88,28,135,0.15)_0px,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(at_100%_100%,_rgba(30,58,138,0.1)_0px,_transparent_50%)]" />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.2, 0.15] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-900/20 blur-[120px] rounded-full"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md p-6 md:p-8 relative z-10"
      >
        <div className="text-center mb-8 md:mb-12">
          <motion.div 
            whileHover={{ rotate: 10, scale: 1.1 }}
            className="w-16 h-16 md:w-20 md:h-20 mx-auto rounded-2xl md:rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/20 mb-6 md:mb-8"
          >
            <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </motion.div>
          
          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tighter mb-2 md:mb-3 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            Aura Wellness
          </h1>
          <p className="text-zinc-500 text-[10px] md:text-sm font-black md:font-medium uppercase tracking-[0.2em] mb-6 md:mb-8">
            Health Intelligence Gateway
          </p>
        </div>

        <div className="space-y-4 md:space-y-6">
          <div className="p-5 md:p-6 rounded-[24px] md:rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl">
            <h2 className="text-base md:text-lg font-bold mb-4 text-center">Secure Authentication</h2>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={signInWithGoogle}
              className="w-full h-12 md:h-14 bg-white text-black rounded-xl md:rounded-2xl flex items-center justify-center gap-3 md:gap-4 font-bold text-base md:text-lg hover:bg-zinc-200 transition-all shadow-xl shadow-white/5 group"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </motion.button>

            <p className="mt-5 text-center text-[10px] md:text-xs text-zinc-600 leading-relaxed font-medium">
              By accessing Aura Wellness, you agree to our <br className="hidden md:block" />
              <span className="text-zinc-400 hover:text-white cursor-pointer underline decoration-zinc-800">Privacy Policy</span> and <span className="text-zinc-400 hover:text-white cursor-pointer underline decoration-zinc-800">Terms</span>.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:gap-4">
             <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center text-center">
                <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-emerald-500 mb-1.5 md:mb-2" />
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-500">HIPAA Ready</span>
             </div>
             <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center text-center">
                <Activity className="w-4 h-4 md:w-5 md:h-5 text-indigo-500 mb-1.5 md:mb-2" />
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-500">Live Vitals</span>
             </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="flex items-center justify-center gap-2 text-zinc-600 text-[10px] font-bold uppercase tracking-[0.3em]">
             <HeartPulse className="w-4 h-4" />
             Core Neural Network Active
          </div>
        </div>
      </motion.div>
    </div>
  );
}
