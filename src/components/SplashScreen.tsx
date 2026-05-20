import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Activity } from 'lucide-react';

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] bg-[#050507] flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Animated Video-like Background Loop */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <motion.div 
           animate={{ 
             scale: [1, 1.15, 1],
             opacity: [0.1, 0.25, 0.1],
           }}
           transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
           style={{ willChange: 'transform, opacity' }}
           className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/15 blur-[120px] rounded-full"
         />
         <motion.div 
           animate={{ 
             scale: [1.15, 1, 1.15],
             opacity: [0.05, 0.15, 0.05],
           }}
           transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
           style={{ willChange: 'transform, opacity' }}
           className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-indigo-600/10 blur-[150px] rounded-full"
         />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/40 mb-8"
        >
          <Sparkles className="w-12 h-12 text-white" />
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-3xl md:text-4xl font-display font-bold tracking-tighter text-white mb-2"
        >
          AURA <span className="text-zinc-500 font-light">WELLNESS</span>
        </motion.h1>

        <motion.div
           initial={{ width: 0 }}
           animate={{ width: 180 }}
           transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
           className="h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent mb-6 block md:hidden"
        />
        <motion.div
           initial={{ width: 0 }}
           animate={{ width: 205 }}
           transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
           className="h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent mb-6 hidden md:block"
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500"
        >
          <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
          Initializing Health Intelligence
        </motion.div>
      </div>

      {/* Cinematic Scanning Line */}
      <motion.div 
        animate={{ top: ['0%', '100%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        style={{ willChange: 'top' }}
        className="absolute left-0 right-0 h-px bg-white/20 shadow-[0_0_15px_rgba(255,255,255,0.5)] z-20 pointer-events-none"
      />
    </motion.div>
  );
}
