'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/components/auth-context';
import { signInWithGoogle, logOut } from '@/lib/firebase';
import { Heart, MessageSquare, User, Sparkles, LogOut, Settings, BarChart3, Search } from 'lucide-react';
import Image from 'next/image';
import Landing from '@/components/landing';
import Onboarding from '@/components/onboarding';
import Discovery from '@/components/discovery';
import ChatList from '@/components/chat-list';
import ChatRoom from '@/components/chat-room';

export default function Home() {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'discovery' | 'chats' | 'profile'>('discovery');
  const [currentMatchId, setCurrentMatchId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center"
        >
          <Heart className="w-6 h-6 text-white fill-white" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <Landing onSignIn={signInWithGoogle} />;
  }

  if (!profile) {
    return <Onboarding />;
  }

  return (
    <main className="h-screen w-full bg-slate-50 flex overflow-hidden font-sans text-slate-800">
      {/* Left Sidebar - Desktop */}
      <aside className="hidden lg:flex w-80 h-full bg-white border-r border-slate-100 flex-col">
        <div className="p-8">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-gradient-to-tr from-rose-500 to-orange-400 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">Aura</span>
          </div>

          <nav className="space-y-1 mb-10">
            <button 
              onClick={() => { setActiveTab('discovery'); setCurrentMatchId(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === 'discovery' && !currentMatchId ? 'bg-rose-50 text-rose-600' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <Search className="w-5 h-5" />
              Discover
            </button>
            <button 
              onClick={() => { setActiveTab('chats'); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === 'chats' ? 'bg-rose-50 text-rose-600' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <MessageSquare className="w-5 h-5" />
              Messages
            </button>
            <button 
              onClick={() => { setActiveTab('profile'); setCurrentMatchId(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === 'profile' ? 'bg-rose-50 text-rose-600' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <User className="w-5 h-5" />
              Profile
            </button>
          </nav>

          <div>
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-4 mb-4">Aura Status</h3>
             <div className="px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-xs font-bold text-slate-500 mb-1">CURRENT VIBE</div>
                <div className="text-sm font-medium text-slate-900">{profile.aura}</div>
             </div>
          </div>
        </div>

        <div className="mt-auto p-8 border-t border-slate-100">
          <div className="flex items-center gap-3">
             <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-100">
               <Image src={profile.photoUrl} alt="Me" fill className="object-cover" referrerPolicy="no-referrer" />
             </div>
             <div className="flex-1 min-w-0">
                <div className="font-bold text-sm truncate">{profile.displayName}</div>
                <div className="text-xs text-slate-400">Premium Plan</div>
             </div>
             <button onClick={logOut} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
               <LogOut className="w-4 h-4" />
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative h-full">
        {/* Header - Mobile Only */}
        <header className="lg:hidden px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between z-50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-tr from-rose-500 to-orange-400 rounded-md flex items-center justify-center">
              <Heart className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">Aura</span>
          </div>
          {currentMatchId && (
            <button 
              onClick={() => setCurrentMatchId(null)}
              className="text-sm font-bold text-rose-500"
            >
              Back
            </button>
          )}
        </header>

        <div className="flex-1 relative overflow-hidden overflow-y-auto">
          {currentMatchId ? (
            <ChatRoom matchId={currentMatchId} onBack={() => setCurrentMatchId(null)} />
          ) : (
            <AnimatePresence mode="wait">
              {activeTab === 'discovery' && (
                <motion.div
                  key="discovery"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full"
                >
                  <Discovery />
                </motion.div>
              )}
              {activeTab === 'chats' && (
                <motion.div
                  key="chats"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full"
                >
                  <ChatList onSelectMatch={setCurrentMatchId} />
                </motion.div>
              )}
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full p-8 max-w-2xl mx-auto"
                >
                  <div className="bg-white rounded-[32px] p-10 shadow-xl shadow-slate-200/50 border border-slate-100 text-center">
                    <div className="relative w-32 h-32 mx-auto rounded-3xl overflow-hidden border-4 border-white shadow-xl mb-6 -mt-20">
                       <Image src={profile.photoUrl} alt="Profile" fill className="object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">{profile.displayName}</h2>
                    <p className="text-rose-500 font-medium mb-8">@{profile.aura.toLowerCase().replace(/\s+/g, '_')}</p>
                    
                    <div className="grid grid-cols-3 gap-4 mb-8">
                      <div className="bg-slate-50 p-4 rounded-2xl">
                         <div className="text-xl font-bold text-slate-900">42</div>
                         <div className="text-[10px] uppercase font-bold text-slate-400">Matches</div>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl">
                         <div className="text-xl font-bold text-slate-900">128</div>
                         <div className="text-[10px] uppercase font-bold text-slate-400">Likes</div>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl">
                         <div className="text-xl font-bold text-slate-900">12</div>
                         <div className="text-[10px] uppercase font-bold text-slate-400">Aura Gold</div>
                      </div>
                    </div>

                    <div className="text-left space-y-6">
                       <div>
                         <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">My Bio</label>
                         <p className="text-slate-600 leading-relaxed bg-slate-50 rounded-2xl p-4 border border-slate-100">{profile.bio}</p>
                       </div>
                       
                       <div className="flex flex-wrap gap-2">
                         {profile.interests?.map((interest: string) => (
                           <span key={interest} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-full text-sm font-medium">#{interest}</span>
                         ))}
                       </div>
                    </div>

                    <button className="w-full py-4 mt-10 bg-slate-900 text-white rounded-2xl font-bold hover:bg-rose-500 transition-colors">
                      Edit Profile
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Mobile Bottom Navigation */}
        {!currentMatchId && (
          <nav className="lg:hidden border-t border-slate-100 bg-white px-8 py-4 flex justify-between items-center shrink-0">
             <button onClick={() => setActiveTab('discovery')} className={`p-2 transition-colors ${activeTab === 'discovery' ? 'text-rose-500' : 'text-slate-300'}`}>
               <Search className="w-7 h-7" />
             </button>
             <button onClick={() => setActiveTab('chats')} className={`p-2 transition-colors ${activeTab === 'chats' ? 'text-rose-500' : 'text-slate-300'}`}>
               <MessageSquare className="w-7 h-7" />
             </button>
             <button onClick={() => setActiveTab('profile')} className={`p-2 transition-colors ${activeTab === 'profile' ? 'text-rose-500' : 'text-slate-300'}`}>
               <User className="w-7 h-7" />
             </button>
          </nav>
        )}
      </div>

      {/* Right Sidebar - Status/Stats - Desktop Only */}
      <aside className="hidden xl:flex w-80 h-full bg-white border-l border-slate-100 p-8 flex-col">
        <h3 className="text-lg font-bold mb-6">Discovery Stats</h3>
        
        <div className="space-y-6">
          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-rose-100 text-rose-500 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-bold">Activity</div>
                <div className="text-xs text-slate-400">Last 7 days</div>
              </div>
            </div>
            <div className="h-24 flex items-end gap-1 px-2">
               {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                 <div key={i} className="flex-1 bg-rose-200 rounded-t-sm hover:bg-rose-400 transition-colors" style={{ height: `${h}%` }}></div>
               ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white relative overflow-hidden group">
             <div className="relative z-10">
               <div className="text-sm font-bold mb-1">Aura Gold</div>
               <p className="text-xs text-white/60 mb-4">See who already resonates with you!</p>
               <button className="w-full py-3 bg-white text-slate-900 font-bold rounded-xl hover:scale-[1.02] transition-transform text-sm">
                 Upgrade Now
               </button>
             </div>
             <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-rose-500/20 rounded-full blur-2xl group-hover:bg-rose-500/30 transition-colors"></div>
          </div>

          <div className="pt-6 border-t border-slate-100">
             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Recent Sparkles</h3>
             <div className="flex -space-x-3">
               {[1, 2, 3, 4].map(i => (
                 <div key={i} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-slate-100">
                   <img src={`https://picsum.photos/seed/${i + 10}/100/100`} className="w-full h-full object-cover" alt="User" />
                 </div>
               ))}
               <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                 +12
               </div>
             </div>
          </div>
        </div>

        <div className="mt-auto">
          <button className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors font-medium text-sm">
            <Settings className="w-4 h-4" />
            Account Settings
          </button>
        </div>
      </aside>
    </main>
  );
}
