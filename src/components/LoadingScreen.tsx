import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'جاري التحميل...' }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 dark:bg-slate-950/90 backdrop-blur-md transition-all">
      <div className="flex flex-col items-center p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 max-w-xs w-full text-center">
        {/* App Logo */}
        <div className="w-16 h-16 mb-4 rounded-2xl bg-blue-600/10 dark:bg-blue-500/20 flex items-center justify-center p-2.5">
          <img src="/icon.svg" alt="أرشيف الضرائب" className="w-full h-full object-contain" />
        </div>

        {/* Spinner */}
        <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin mb-3" />

        {/* Text */}
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
          أرشيف الضرائب
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          {message}
        </p>
      </div>
    </div>
  );
};
