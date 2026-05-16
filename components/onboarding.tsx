'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/components/auth-context';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { GoogleGenAI } from '@google/genai';
import { Heart, ArrowRight, Loader2, Sparkles } from 'lucide-react';

export default function Onboarding() {
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    gender: 'other',
    bio: '',
    interests: '',
  });

  const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY as string });

  const handleNext = () => setStep(s => s + 1);
  
  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const model = 'gemini-3-flash-preview';
      const prompt = `Based on these user details, generate a short, vibey, atmospheric "Aura" description (max 10 words) that describes their energy for a premium dating app. 
      Name: ${formData.displayName}
      Bio: ${formData.bio}
      Interests: ${formData.interests}
      Output only the description, like "Ethereal Wanderer with a heart of gold".`;

      const result = await ai.models.generateContent({
        model,
        contents: prompt
      });
      
      const aura = result.text || "Radiant Soul";

      await setDoc(doc(db, 'profiles', user.uid), {
        uid: user.uid,
        displayName: formData.displayName,
        gender: formData.gender,
        bio: formData.bio,
        interests: formData.interests.split(',').map(i => i.trim()),
        aura: aura,
        photoUrl: user.photoURL || `https://picsum.photos/seed/${user.uid}/400/400`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      await refreshProfile();
    } catch (error) {
      console.error('Error in onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[40px] p-10 shadow-2xl shadow-slate-200/50 border border-slate-100">
        <div className="flex items-center gap-2 mb-12 justify-center">
          <div className="w-10 h-10 bg-gradient-to-tr from-rose-500 to-orange-400 rounded-xl flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">Aura</span>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-4xl font-bold text-slate-900 mb-2 leading-tight">Welcome home.</h2>
              <p className="text-slate-500 mb-8 font-medium">What shall we call you in this space?</p>
              
              <div className="space-y-2 mb-8">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Your Name</label>
                <input 
                  type="text" 
                  value={formData.displayName}
                  onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="e.g. Marcus Chen"
                  className="w-full bg-slate-50 rounded-2xl px-6 py-4 text-slate-900 font-bold border border-slate-100 focus:border-rose-500/50 focus:ring-4 focus:ring-rose-500/5 transition-all outline-none"
                />
              </div>

              <button 
                onClick={handleNext} 
                disabled={!formData.displayName} 
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-rose-500 transition-colors shadow-lg"
              >
                Next Step <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-4xl font-bold text-slate-900 mb-2 leading-tight">Tell your story.</h2>
              <p className="text-slate-500 mb-8 font-medium">Capture your essence for others to find.</p>
              
              <div className="space-y-6 mb-10">
                 <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Biography</label>
                  <textarea 
                    value={formData.bio}
                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Wanderer, dreamer, code weaver..."
                    className="w-full bg-slate-50 rounded-2xl p-6 text-slate-900 font-medium border border-slate-100 focus:border-rose-500/50 transition-all outline-none h-32 resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Interests</label>
                  <input 
                    type="text"
                    value={formData.interests}
                    onChange={e => setFormData({ ...formData, interests: e.target.value })}
                    placeholder="Photography, Jazz, Matcha..."
                    className="w-full bg-slate-50 rounded-2xl px-6 py-4 text-slate-900 font-medium border border-slate-100 focus:border-rose-500/50 transition-all outline-none"
                  />
                </div>
              </div>

              <button 
                onClick={handleSubmit} 
                disabled={loading || !formData.bio} 
                className="w-full py-4 bg-rose-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-rose-600 transition-colors shadow-xl shadow-rose-200"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                  <>
                    <Sparkles className="w-5 h-5 fill-current" />
                    Reveal my Aura
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
