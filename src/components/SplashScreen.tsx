import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // Show splash screen for exactly 2 seconds as requested
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 text-white selection:bg-none">
      <div className="relative flex flex-col items-center max-w-sm px-6 text-center animate-in fade-in zoom-in-95 duration-500">
        {/* App Image from User prompt */}
        <div className="relative w-36 h-36 mb-6 rounded-3xl overflow-hidden shadow-2xl ring-4 ring-blue-500/30 bg-slate-800 flex items-center justify-center">
          <img
            src="https://i.postimg.cc/t4qbLfq5/tsmym-bdwn-%D8%B9nwan.jpg"
            alt="أرشيف الضرائب"
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              // Fallback to local icon if network blocked
              (e.target as HTMLImageElement).src = '/icon.svg';
              setImageLoaded(true);
            }}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-blue-900/60">
              <img src="/icon.svg" alt="أيقونة الضرائب" className="w-20 h-20 animate-pulse" />
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2 font-sans">
          أرشيف الضرائب
        </h1>
        <p className="text-blue-200/80 text-sm font-medium mb-6">
          نظام إدارة ملفات الضرائب والعملاء والمنشآت
        </p>

        {/* Subtle Progress Bar */}
        <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden mb-4">
          <div className="h-full bg-gradient-to-r from-blue-500 to-amber-400 rounded-full animate-[progress_2s_ease-in-out_forwards]" />
        </div>

        <span className="text-xs text-slate-400 tracking-wider">جاري بدء النظام...</span>
      </div>

      <style>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};
