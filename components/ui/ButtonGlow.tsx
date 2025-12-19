
import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ButtonGlowProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'glass' | 'danger';
  isLoading?: boolean;
}

const ButtonGlow: React.FC<ButtonGlowProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading = false,
  className = '',
  ...props 
}) => {
  const baseStyles = "relative px-8 py-4 rounded-2xl font-black text-[10px] tracking-[0.4em] uppercase transition-all duration-500 overflow-hidden group outline-none flex items-center justify-center gap-3 select-none";
  
  const variants = {
    primary: "bg-gradient-to-br from-brand-cyan via-brand-cyan/90 to-brand-purple text-black shadow-[0_0_25px_rgba(0,240,255,0.3)] border-t border-white/50",
    secondary: "bg-white/[0.03] backdrop-blur-2xl text-white border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:border-white/25",
    glass: "bg-brand-cyan/5 backdrop-blur-xl text-brand-cyan border border-brand-cyan/20 hover:bg-brand-cyan/15 hover:border-brand-cyan/50 shadow-inner",
    danger: "bg-red-500/5 backdrop-blur-xl text-red-500 border border-red-500/20 hover:bg-red-500/15 hover:border-red-500/50 shadow-inner"
  };

  const hoverAnimation = {
    scale: 1.03,
    y: -3,
    transition: { type: "spring", stiffness: 400, damping: 10 }
  };

  return (
    <motion.button
      whileHover={hoverAnimation}
      whileTap={{ scale: 0.96 }}
      className={`${baseStyles} ${variants[variant]} ${className} ${isLoading ? 'pointer-events-none opacity-80' : ''}`}
      {...props}
    >
      {/* 1. Subtle Gloss Layer */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      {/* 2. Animated Shine Beam (Sweep) */}
      <motion.div
        className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-[120%] -skew-x-[35deg]"
        initial={{ x: '-180%' }}
        animate={{ x: '180%' }}
        transition={{ 
          duration: 3, 
          repeat: Infinity, 
          repeatDelay: 2,
          ease: "linear" 
        }}
      />

      {/* 3. Hover Glow Pulse */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl ${
        variant === 'primary' ? 'bg-white' : 
        variant === 'danger' ? 'bg-red-500' : 'bg-brand-cyan'
      }`} />

      <span className="relative z-10 flex items-center justify-center gap-2.5 drop-shadow-md">
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </span>

      {/* 4. Internal Radial Highlight for Primary */}
      {variant === 'primary' && (
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_white_0%,_transparent_75%)] pointer-events-none" />
      )}
    </motion.button>
  );
};

export default ButtonGlow;
