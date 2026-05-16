'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { useAuth } from '@/components/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, where, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import Image from 'next/image';
import { Heart, X, Sparkles, MapPin, Loader2, Star } from 'lucide-react';

interface Profile {
  uid: string;
  displayName: string;
  aura: string;
  bio: string;
  photoUrl: string;
}

export default function Discovery() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function fetchProfiles() {
      if (!user) return;
      try {
        const q = query(collection(db, 'profiles'), where('uid', '!=', user.uid));
        const querySnapshot = await getDocs(q);
        const fetchedProfiles = querySnapshot.docs.map(doc => doc.data() as Profile);
        setProfiles(fetchedProfiles);
      } catch (error) {
        console.error('Error fetching profiles:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfiles();
  }, [user]);

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (currentIndex >= profiles.length) return;
    
    const targetUserId = profiles[currentIndex].uid;
    
    if (direction === 'right') {
      try {
        await addDoc(collection(db, 'likes'), {
          fromId: user?.uid,
          toId: targetUserId,
          createdAt: serverTimestamp(),
        });
        
        const reverseLikeQuery = query(
          collection(db, 'likes'), 
          where('fromId', '==', targetUserId),
          where('toId', '==', user?.uid)
        );
        const reverseLikeSnapshot = await getDocs(reverseLikeQuery);
        
        if (!reverseLikeSnapshot.empty) {
          const matchId = [user?.uid, targetUserId].sort().join('_');
          await setDoc(doc(db, 'matches', matchId), {
            userIds: [user?.uid, targetUserId],
            status: 'matched',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          // Match animation could go here
        }
      } catch (error) {
        console.error('Error handling like:', error);
      }
    }

    setCurrentIndex(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
      </div>
    );
  }

  if (currentIndex >= profiles.length) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-6 text-center bg-slate-50">
        <div className="w-20 h-20 bg-white rounded-3xl shadow-xl shadow-slate-200/50 flex items-center justify-center mb-6 border border-slate-100">
          <Sparkles className="w-10 h-10 text-rose-500/50" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Expanding your horizon...</h3>
        <p className="text-slate-500 max-w-xs leading-relaxed">You&apos;ve seen everyone around you for now. Check back soon for new resonance.</p>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];

  return (
    <div className="h-full flex flex-col items-center justify-center p-4 lg:p-8 bg-slate-50">
      <div className="w-full max-w-[480px] aspect-[3/4] relative h-[640px]">
        <AnimatePresence>
          <SwipeCard 
            key={currentProfile.uid}
            profile={currentProfile}
            onSwipe={handleSwipe}
          />
        </AnimatePresence>
      </div>

      {/* Sleek Buttons */}
      <div className="flex justify-center gap-6 mt-8">
        <button 
          onClick={() => handleSwipe('left')}
          className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all active:scale-95 border border-slate-100 group"
        >
          <X className="w-7 h-7 group-hover:scale-110 transition-transform" strokeWidth={3} />
        </button>
        <button 
          onClick={() => handleSwipe('right')}
          className="w-20 h-20 rounded-full bg-rose-500 shadow-xl shadow-rose-200 flex items-center justify-center text-white hover:bg-rose-600 hover:scale-105 transition-all active:scale-95 group"
        >
          <Heart className="w-9 h-9 fill-current group-hover:scale-110 transition-transform" />
        </button>
        <button 
          className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center text-slate-400 hover:text-blue-500 transition-all active:scale-95 border border-slate-100 group"
        >
          <Star className="w-7 h-7 fill-current group-hover:scale-110 transition-transform" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

function SwipeCard({ profile, onSwipe }: { profile: Profile, onSwipe: (dir: 'left' | 'right') => void }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 100) {
      onSwipe('right');
    } else if (info.offset.x < -100) {
      onSwipe('left');
    }
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      style={{ x, rotate, opacity }}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ x: x.get() > 0 ? 500 : -500, opacity: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className="absolute inset-0 cursor-grab active:cursor-grabbing z-10"
    >
      <div className="w-full h-full bg-white rounded-[40px] overflow-hidden relative shadow-2xl shadow-slate-200/50 border-4 border-white flex flex-col">
        <div className="relative flex-1">
          <Image 
            src={profile.photoUrl} 
            alt={profile.displayName}
            fill
            className="object-cover pointer-events-none"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold tracking-tight">{profile.displayName}</h1>
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                 <Sparkles className="w-3 h-3 text-white fill-white" />
              </div>
            </div>
            <p className="text-white/80 text-lg mb-4 font-medium tracking-wide">{profile.aura}</p>
          </div>
        </div>
        
        <div className="p-8 bg-white">
          <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-4 italic">
            &ldquo;{profile.bio}&rdquo;
          </p>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold uppercase tracking-wider">Design</span>
            <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold uppercase tracking-wider">Travel</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
