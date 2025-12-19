
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '../../types';
import ButtonGlow from '../ui/ButtonGlow';
import { Send, Mail } from 'lucide-react';

declare global {
  interface Window {
    onTelegramAuth: (user: any) => void;
  }
}

export const AuthView: React.FC<{ onLogin: (user?: Partial<User>) => void; onSwitchMode: () => void }> = ({ onLogin, onSwitchMode }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'telegram' | 'email'>('telegram');

  useEffect(() => {
    if (mode === 'telegram') {
      window.onTelegramAuth = (user) => {
        onLogin({
          telegramId: user.id.toString(),
          name: user.first_name + (user.last_name ? ' ' + user.last_name : ''),
          username: user.username,
          photoUrl: user.photo_url,
        });
      };

      const script = document.createElement('script');
      script.src = "https://telegram.org/js/telegram-widget.js?22";
      script.async = true;
      script.setAttribute('data-telegram-login', 'labelspy_bot'); 
      script.setAttribute('data-size', 'large');
      script.setAttribute('data-radius', '12');
      script.setAttribute('data-onauth', 'onTelegramAuth(user)');
      script.setAttribute('data-request-access', 'write');

      const container = document.getElementById('telegram-login-container');
      if (container) {
        container.innerHTML = '';
        container.appendChild(script);
      }
    }
  }, [mode, onLogin]);

  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if(!email || !name) return;
    setLoading(true);
    setTimeout(() => {
      onLogin({ email, name, id: Math.random().toString(36).substr(2, 9) });
      setLoading(true);
    }, 1200);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="max-w-md w-full mx-auto mt-10 glass-panel p-10 rounded-[3rem] relative overflow-hidden border-t border-white/10 shadow-2xl"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-cyan to-brand-purple opacity-50" />
      
      <div className="text-center mb-10">
         <h2 className="text-3xl font-black text-white mb-3 italic tracking-tight uppercase">Вход</h2>
         <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">Выберите протокол авторизации</p>
      </div>

      <div className="flex gap-2 p-1.5 bg-black/40 rounded-[1.8rem] mb-10 border border-white/5 backdrop-blur-md">
         <button 
           onClick={() => setMode('telegram')}
           className={`flex-1 py-3.5 text-[9px] font-black uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 relative overflow-hidden ${mode === 'telegram' ? 'text-white' : 'text-gray-600 hover:text-gray-400'}`}
         >
           {mode === 'telegram' && (
             <motion.div layoutId="auth-tab" className="absolute inset-0 bg-gradient-to-br from-brand-cyan/20 to-brand-purple/20 border border-white/10 rounded-2xl shadow-inner" />
           )}
           <span className="relative z-10 flex items-center gap-2"><Send className="w-3.5 h-3.5" /> Telegram</span>
         </button>
         <button 
           onClick={() => setMode('email')}
           className={`flex-1 py-3.5 text-[9px] font-black uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 relative overflow-hidden ${mode === 'email' ? 'text-white' : 'text-gray-600 hover:text-gray-400'}`}
         >
           {mode === 'email' && (
             <motion.div layoutId="auth-tab" className="absolute inset-0 bg-gradient-to-br from-brand-cyan/20 to-brand-purple/20 border border-white/10 rounded-2xl shadow-inner" />
           )}
           <span className="relative z-10 flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> Email</span>
         </button>
      </div>

      <div className="min-h-[280px] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {mode === 'telegram' ? (
             <motion.div 
               key="telegram"
               initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
               className="flex flex-col items-center justify-center space-y-8"
             >
                <div className="p-10 bg-brand-cyan/5 rounded-[2.5rem] border border-brand-cyan/10">
                  <div id="telegram-login-container" className="flex justify-center" />
                </div>
                <p className="text-[9px] font-bold text-center text-gray-500 uppercase tracking-widest max-w-xs leading-relaxed">
                   Безопасная сквозная авторизация <br/>через официальный шлюз Telegram.
                </p>
             </motion.div>
          ) : (
            <motion.div 
              key="email"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            >
              <form onSubmit={handleEmailAuth} className="space-y-6">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-4">Имя Эксперта</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="ИВАН ИВАНОВ"
                      className="w-full bg-black/40 border border-white/5 rounded-2xl p-4.5 text-white focus:border-brand-purple/40 focus:outline-none transition-all placeholder:text-gray-800 text-sm font-bold tracking-tight"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-4">Email Адрес</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="EXPERT@PURESCAN.AI"
                      className="w-full bg-black/40 border border-white/5 rounded-2xl p-4.5 text-white focus:border-brand-purple/40 focus:outline-none transition-all placeholder:text-gray-800 text-sm font-bold tracking-tight"
                      required
                    />
                  </div>
                </div>
                <div className="pt-4">
                  <ButtonGlow type="submit" isLoading={loading} className="w-full !py-5">ПРОДОЛЖИТЬ</ButtonGlow>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
