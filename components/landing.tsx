'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Heart, ArrowRight } from 'lucide-react';

interface LandingProps {
  onSignIn: () => void;
}

export default function Landing({ onSignIn }: LandingProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-50 via-slate-50 to-slate-100">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full grid md:grid-cols-2 gap-12 items-center"
      >
        <div className="space-y-8">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-tr from-rose-500 to-orange-400 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-bold tracking-tight text-slate-900">Aura</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-slate-900 leading-[1.1] tracking-tight">
            Discovery with <span className="text-rose-500">Intention.</span>
          </h1>
          
          <p className="text-xl text-slate-500 leading-relaxed max-w-sm">
            Experience the next generation of dating. Sleek, curated, and designed for genuine connection.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={onSignIn}
              className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-rose-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 group"
            >
              Start Discovering
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 bg-white text-slate-600 rounded-2xl font-bold border border-slate-200 hover:bg-slate-50 transition-all">
              Learn More
            </button>
          </div>
        </div>

        <div className="relative hidden md:block">
          <div className="w-full aspect-[4/5] bg-white rounded-[40px] shadow-2xl p-4 rotate-3 relative overflow-hidden border border-slate-100">
            <img 
              src="https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
              className="w-full h-full object-cover rounded-[32px]"
              alt="Preview"
            />
            <div className="absolute bottom-8 left-8 text-white">
              <div className="text-2xl font-bold">Elena, 26</div>
              <div className="text-sm opacity-80 font-medium tracking-wide">Product Designer</div>
            </div>
          </div>
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white rounded-3xl shadow-xl p-4 -rotate-12 border border-slate-100 hidden lg:flex items-center justify-center">
            <Heart className="w-12 h-12 text-rose-500 fill-rose-500" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
