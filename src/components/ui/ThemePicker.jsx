import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Palette, Check } from 'lucide-react';
import { useGlobalTheme } from '../../context/ThemeContext.jsx';
import { STUDIO_THEMES } from '../../utils/studioThemes.js';

// Define the light theme explicitly for the picker
const THEMES = [
  { id: 'light', name: 'Light', icon: Sun, color: '#f59e0b' },
  ...Object.entries(STUDIO_THEMES).map(([id, t]) => ({
    id,
    name: t.name,
    icon: id === 'default' ? Moon : Palette,
    color: t.accentHex || '#0ea5e9'
  }))
];

export default function ThemePicker() {
  const { studioTheme, setStudioTheme } = useGlobalTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentTheme = THEMES.find(t => t.id === studioTheme) || THEMES[0];
  const CurrentIcon = currentTheme.icon;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 nav-tool-btn text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
        title="Change Theme"
      >
        <CurrentIcon className="w-[18px] h-[18px]" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-48 py-1.5 bg-white dark:bg-slate-900 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xl z-50 overflow-hidden"
          >
            <div className="px-3 py-1.5 mb-1 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
              Themes
            </div>
            {THEMES.map((theme) => {
              const isActive = studioTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => {
                    setStudioTheme(theme.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${
                    isActive 
                      ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400' 
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full shadow-sm" 
                      style={{ backgroundColor: theme.color }}
                    />
                    <span className={isActive ? 'font-medium' : ''}>
                      {theme.name}
                    </span>
                  </div>
                  {isActive && <Check className="w-4 h-4" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
