
import React, { useState, useEffect, Suspense } from 'react';
import GlowBackground from './components/webgl/GlowBackground';
import { User as UserIcon, LayoutDashboard, ScanLine, Crown, Loader2 } from 'lucide-react';
import { ViewState, User, HistoryItem, ScanResult, SubscriptionPlan } from './types';
import ButtonGlow from './components/ui/ButtonGlow';
import { motion, AnimatePresence } from 'framer-motion';

const ScannerInterface = React.lazy(() => import('./components/ScannerInterface'));
const AuthView = React.lazy(() => import('./components/views/AuthView').then(module => ({ default: module.AuthView })));
const DashboardView = React.lazy(() => import('./components/views/DashboardView').then(module => ({ default: module.DashboardView })));
const SubscriptionView = React.lazy(() => import('./components/views/SubscriptionView').then(module => ({ default: module.SubscriptionView })));
const ProfileView = React.lazy(() => import('./components/views/ProfileView').then(module => ({ default: module.ProfileView })));
const ResultView = React.lazy(() => import('./components/views/ResultView').then(module => ({ default: module.ResultView })));

const LoadingScreen = () => (
  <div className="w-full h-[60vh] flex items-center justify-center">
    <Loader2 className="w-8 h-8 text-brand-cyan animate-spin" />
  </div>
);

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('purescan_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const [view, setView] = useState<ViewState>(() => {
    return localStorage.getItem('purescan_user') ? 'DASHBOARD' : 'LANDING';
  });
  
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const savedHistory = localStorage.getItem('purescan_history');
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (e) {
      return [];
    }
  });
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  useEffect(() => {
    localStorage.setItem('purescan_history', JSON.stringify(history));
  }, [history]);

  const handleLogin = (userData?: Partial<User>) => {
    const newUser: User = {
      id: userData?.telegramId || Date.now().toString(),
      email: userData?.email || 'user@purescan.ai',
      name: userData?.name || 'Пользователь',
      username: userData?.username,
      photoUrl: userData?.photoUrl,
      telegramId: userData?.telegramId,
      plan: 'FREE',
      scansLeft: 3,
      allergies: [],
      settings: {
        notifications: true,
        darkMode: true
      },
      ...userData
    };
    
    setUser(newUser);
    localStorage.setItem('purescan_user', JSON.stringify(newUser));
    setView('DASHBOARD');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('purescan_user');
    setView('LANDING');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('purescan_user', JSON.stringify(updatedUser));
  };

  const handleScanComplete = (result: ScanResult) => {
    setScanResult(result);
    const newItem: HistoryItem = {
      id: result.id,
      date: new Date().toLocaleDateString('ru-RU'),
      productName: result.productName || 'Анализ состава',
      score: result.score,
      status: result.status,
      rawResult: result
    };
    setHistory(prev => [newItem, ...prev]);
    setView('RESULT');
  };

  const handleHistoryClick = (item: HistoryItem) => {
    setScanResult(item.rawResult);
    setView('RESULT');
  };

  const handleUpgrade = async (plan: SubscriptionPlan) => {
    if (!user) {
      setView('AUTH');
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 1500));
    const updatedUser = { ...user, plan };
    setUser(updatedUser);
    localStorage.setItem('purescan_user', JSON.stringify(updatedUser));
    setView('DASHBOARD');
  };

  const renderContent = () => {
    const wrap = (component: React.ReactNode) => (
      <Suspense fallback={<LoadingScreen />}>
        {component}
      </Suspense>
    );

    switch (view) {
      case 'LANDING':
        return (
          <div className="flex flex-col items-center text-center space-y-12 max-w-4xl mx-auto pt-16 px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <span className="inline-block px-5 py-2 rounded-full border border-brand-cyan/20 bg-brand-cyan/5 text-brand-cyan text-[10px] font-black tracking-[0.4em] uppercase">
                AI FOOD AUDIT PRO v2.0
              </span>
              <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-[1.1] text-white">
                Твой щит от <br/>
                <span className="text-gradient-brand">
                  химии в еде.
                </span>
              </h1>
              <p className="text-gray-400 text-lg md:text-xl max-w-xl mx-auto font-medium opacity-80 leading-relaxed">
                Мгновенный экспертный анализ состава продуктов. Узнай правду о том, что ты ешь на самом деле.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                <ButtonGlow onClick={() => setView('AUTH')} className="!px-12 !py-5 !rounded-2xl">НАЧАТЬ БЕСПЛАТНО</ButtonGlow>
                <ButtonGlow variant="secondary" onClick={() => setView('SUBSCRIPTION')} className="!px-12 !py-5 !rounded-2xl">ТАРИФЫ</ButtonGlow>
              </div>
            </motion.div>
          </div>
        );
      
      case 'AUTH': return wrap(<AuthView onLogin={handleLogin} onSwitchMode={() => {}} />);
      case 'DASHBOARD': return user ? wrap(<DashboardView user={user} history={history} onScan={() => setView('SCAN')} onUpgrade={() => setView('SUBSCRIPTION')} onHistoryClick={handleHistoryClick} />) : null;
      case 'SCAN': return wrap(<ScannerInterface history={history} onScanComplete={handleScanComplete} onCancel={() => setView(user ? 'DASHBOARD' : 'LANDING')} />);
      case 'RESULT': return scanResult ? wrap(<ResultView result={scanResult} onBack={() => setView(user ? 'DASHBOARD' : 'LANDING')} onScanNew={() => setView('SCAN')} />) : null;
      case 'SUBSCRIPTION': return wrap(<SubscriptionView currentPlan={user?.plan || 'FREE'} onUpgrade={handleUpgrade} />);
      case 'PROFILE': return user ? wrap(<ProfileView user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />) : null;
      default: return null;
    }
  };

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden font-sans selection:bg-brand-cyan/30 bg-[#050505]">
      <GlowBackground />
      
      <header className="sticky top-6 z-50 px-4 transition-all duration-300 mb-12 flex justify-center">
        <div className="w-full max-w-5xl">
          <div className="glass-panel rounded-full px-6 md:px-10 py-3.5 flex items-center justify-between backdrop-blur-[40px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] border-white/10 border-[0.5px]">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-4 cursor-pointer group" 
              onClick={() => setView(user ? 'DASHBOARD' : 'LANDING')}
            >
              <div className="relative w-11 h-11 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-cyan via-brand-cyan to-brand-purple shadow-[0_10px_30px_rgba(0,240,255,0.4)] transition-all group-hover:shadow-[0_15px_40px_rgba(0,240,255,0.5)]">
                <span className="font-black text-black text-sm relative z-10">PS</span>
                <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="hidden xs:flex flex-col">
                <span className="font-black text-sm tracking-[0.4em] text-white/95 group-hover:text-brand-cyan transition-colors italic leading-none">PURESCAN</span>
                <span className="text-[7px] font-black tracking-[0.6em] text-brand-purple uppercase mt-1">Intelligence</span>
              </div>
            </motion.div>

            {user ? (
              <nav className="flex items-center gap-1.5 bg-white/[0.04] rounded-full p-1.5 border border-white/5 shadow-inner">
                 {[
                   { id: 'DASHBOARD', label: 'Обзор', icon: LayoutDashboard },
                   { id: 'SCAN', label: 'Скан', icon: ScanLine },
                   { id: 'PROFILE', label: 'Профиль', icon: UserIcon }
                 ].map((tab) => {
                   const isActive = view === tab.id;
                   const Icon = tab.icon;
                   return (
                     <button 
                       key={tab.id} 
                       onClick={() => setView(tab.id as ViewState)} 
                       className={`relative px-5 md:px-7 py-2.5 rounded-full transition-all duration-500 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] group ${isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                     >
                       {isActive && (
                         <motion.div 
                           layoutId="nav-pill-premium" 
                           className="absolute inset-0 bg-gradient-to-r from-brand-cyan/20 to-brand-purple/20 border border-white/10 rounded-full shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]" 
                           transition={{ type: "spring", bounce: 0.1, duration: 0.6 }} 
                         />
                       )}
                       <span className="relative z-10 flex items-center gap-3">
                         <Icon className={`w-4 h-4 transition-all duration-300 ${isActive ? 'text-brand-cyan scale-110' : 'text-gray-600 group-hover:text-gray-400 group-hover:scale-105'}`} />
                         <span className="hidden sm:inline-block">{tab.label}</span>
                       </span>
                     </button>
                   );
                 })}
              </nav>
            ) : (
              <nav className="flex items-center gap-8">
                 <motion.button 
                   whileHover={{ y: -1 }}
                   onClick={() => setView('SUBSCRIPTION')} 
                   className="text-[10px] font-black text-gray-500 hover:text-brand-purple flex items-center gap-3 uppercase tracking-[0.25em] transition-all"
                 >
                   <Crown className="w-4 h-4 text-brand-purple opacity-70 group-hover:opacity-100" />
                   <span className="hidden sm:inline">Тарифы</span>
                 </motion.button>
                 <ButtonGlow onClick={() => setView('AUTH')} className="!py-2.5 !px-10 !text-[10px] !rounded-full !font-black !tracking-[0.3em] !shadow-none hover:!shadow-[0_0_20px_rgba(0,240,255,0.4)]">ВОЙТИ</ButtonGlow>
              </nav>
            )}
          </div>
        </div>
      </header>

      <div className="relative z-10 px-4 w-full max-w-7xl mx-auto min-h-[85vh]">
         <AnimatePresence mode="wait">
           <motion.div key={view} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.35 }}>
             {renderContent()}
           </motion.div>
         </AnimatePresence>
      </div>

      <footer className="py-12 text-center text-[9px] text-gray-700 font-mono uppercase tracking-[0.5em] border-t border-white/5 mt-20 bg-black/40 backdrop-blur-md">
        <p>&copy; 2025 PURESCAN AI &bull; ПРОВЕРЕНО GEMINI FLASH 2.0 &bull; ОСОЗНАННОЕ ПИТАНИЕ</p>
      </footer>
    </main>
  );
}
