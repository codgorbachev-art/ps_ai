
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User } from '../../types';
import { LogOut, Send, Lock, Moon, Sun, Bell, ShieldCheck, Plus } from 'lucide-react';
import ButtonGlow from '../ui/ButtonGlow';

export const ProfileView: React.FC<{ user: User; onLogout: () => void; onUpdateUser: (u: User) => void }> = ({ user, onLogout, onUpdateUser }) => {
  const [newAllergy, setNewAllergy] = useState('');

  const addAllergy = () => {
    const trimmed = newAllergy.trim();
    if (trimmed && !user.allergies.includes(trimmed)) {
      onUpdateUser({ ...user, allergies: [...user.allergies, trimmed] });
      setNewAllergy('');
    }
  };

  const removeAllergy = (tag: string) => {
    onUpdateUser({ ...user, allergies: user.allergies.filter((a: string) => a !== tag) });
  };

  const toggleSetting = (key: 'notifications') => {
    onUpdateUser({ ...user, settings: { ...user.settings, [key]: !user.settings[key] } });
  };

  return (
    <div className="max-w-2xl mx-auto w-full glass-panel p-10 rounded-[3.5rem] border-t border-white/10 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-purple/5 blur-[100px] -z-10" />
      
      <div className="flex items-center gap-8 mb-12 pb-12 border-b border-white/5">
        <div className="w-28 h-28 rounded-[2.5rem] bg-gradient-to-tr from-brand-cyan to-brand-purple flex items-center justify-center text-4xl font-black shadow-[0_20px_50px_rgba(0,240,255,0.25)] overflow-hidden border-2 border-white/20">
          {user.photoUrl ? <img src={user.photoUrl} alt="User" className="w-full h-full object-cover" /> : <span className="text-black italic">PS</span>}
        </div>
        <div className="space-y-3">
          <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase">{user.name}</h2>
          <div className="flex items-center gap-3">
             <span className="px-4 py-1.5 rounded-2xl bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 text-[9px] font-black uppercase tracking-[0.3em]">
               {user.plan} MEMBER
             </span>
             <ShieldCheck className="w-5 h-5 text-brand-cyan drop-shadow-[0_0_10px_#00f0ff]" />
          </div>
        </div>
      </div>

      <div className="space-y-12">
        <div>
          <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.5em] mb-8">ПЕРСОНАЛЬНЫЕ ОГРАНИЧЕНИЯ</h3>
          <div className="flex flex-wrap gap-3 mb-8">
            {user.allergies.map((tag: string) => (
              <motion.span 
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }}
                key={tag} 
                className="px-5 py-2.5 rounded-2xl bg-white/[0.03] border border-white/10 text-[10px] font-black uppercase tracking-widest flex items-center gap-4 group hover:border-brand-cyan/40 hover:bg-white/[0.06] transition-all text-gray-300"
              >
                {tag} 
                <button onClick={() => removeAllergy(tag)} className="text-gray-600 hover:text-red-500 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.span>
            ))}
            {user.allergies.length === 0 && <p className="text-gray-700 text-[10px] font-black uppercase tracking-widest italic py-4">Список ограничений пуст...</p>}
          </div>
          <div className="flex gap-4">
            <input 
              type="text" 
              value={newAllergy} 
              onChange={(e) => setNewAllergy(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && addAllergy()} 
              placeholder="ДОБАВИТЬ АЛЛЕРГЕН..." 
              className="flex-1 bg-black/40 border border-white/5 rounded-2xl px-6 py-4.5 text-xs text-white focus:border-brand-cyan/40 outline-none transition-all placeholder:text-gray-800 font-black tracking-widest" 
            />
            <button onClick={addAllergy} className="w-14 h-14 bg-brand-cyan text-black rounded-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-transform shadow-[0_10px_30px_rgba(0,240,255,0.3)] border-t border-white/30">
               <Plus className="w-7 h-7" />
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.5em] mb-8">ПРОТОКОЛЫ</h3>
          <div className="space-y-5">
             <div onClick={() => toggleSetting('notifications')} className="flex justify-between items-center p-6 rounded-[2.5rem] bg-white/[0.02] border border-white/5 cursor-pointer hover:border-brand-purple/40 hover:bg-white/[0.05] transition-all group">
                <div className="flex items-center gap-6">
                  <div className={`p-4 rounded-[1.2rem] transition-all duration-500 ${user.settings.notifications ? 'bg-brand-purple text-white shadow-[0_0_20px_rgba(112,0,255,0.4)]' : 'bg-white/5 text-gray-700'}`}>
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-black text-white uppercase tracking-widest">Смарт-уведомления</span>
                    <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest mt-1">Отчеты в реальном времени</span>
                  </div>
                </div>
                <div className={`w-14 h-7 rounded-full relative transition-all duration-500 ${user.settings.notifications ? 'bg-brand-purple/40 border border-brand-purple/60 shadow-inner' : 'bg-white/5 border border-white/10'}`}>
                   <motion.div layout initial={false} animate={{ x: user.settings.notifications ? 30 : 4 }} className="absolute top-1 w-4 h-4 rounded-full shadow-2xl bg-white" />
                </div>
             </div>

             <div className="flex justify-between items-center p-6 rounded-[2.5rem] bg-white/[0.01] border border-white/5 opacity-40 cursor-not-allowed">
                <div className="flex items-center gap-6">
                  <div className="p-4 rounded-[1.2rem] bg-white/5 text-gray-700">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-black text-white uppercase tracking-widest">Шлюз Экспорта</span>
                    <span className="text-[9px] text-gray-700 font-black uppercase tracking-widest mt-1">ТОЛЬКО ДЛЯ ТАРИФА ULTRA</span>
                  </div>
                </div>
             </div>
          </div>
        </div>

        <div className="pt-6">
          <ButtonGlow variant="danger" onClick={onLogout} className="w-full !py-6 !rounded-[2.5rem]">
            ВЫЙТИ ИЗ СИСТЕМЫ
          </ButtonGlow>
        </div>
      </div>
    </div>
  );
};
import { X } from 'lucide-react';
