'use client';

import { useState, useEffect } from 'react';
import { X, Share, Download } from 'lucide-react';

const STORAGE_KEY = 'cekatan-install-banner-dismissed';
const VISIT_COUNT_KEY = 'cekatan_visit_count';

interface InstallBannerProps {
  className?: string;
}

/**
 * Detects if the user is on iOS based on user agent
 */
export function isIOSDevice(userAgent: string): boolean {
  return /iPad|iPhone|iPod/.test(userAgent);
}

/**
 * Determines if the banner should be visible based on state
 */
export function shouldShowBanner(isStandalone: boolean, isDismissed: boolean, visitCount: number): boolean {
  return !isStandalone && !isDismissed && visitCount >= 2;
}

export function InstallBanner({ className = '' }: InstallBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (PWA)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    // Check if previously dismissed
    const isDismissed = localStorage.getItem(STORAGE_KEY) === 'true';

    // Increment visit count
    const currentCount = parseInt(localStorage.getItem(VISIT_COUNT_KEY) || '0', 10);
    const newCount = currentCount + 1;
    localStorage.setItem(VISIT_COUNT_KEY, String(newCount));

    // Detect iOS
    setIsIOS(isIOSDevice(navigator.userAgent));

    // Show banner only if not standalone, not dismissed, and visited at least twice
    setIsVisible(shouldShowBanner(isStandalone, isDismissed, newCount));
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg p-4 z-50 ${className}`}
      role="banner"
      aria-label="Install app banner"
    >
      <div className="flex items-center justify-between max-w-lg mx-auto">
        <div className="flex items-center gap-3 flex-1">
          {isIOS ? (
            <Share className="h-5 w-5 text-blue-600 flex-shrink-0" />
          ) : (
            <Download className="h-5 w-5 text-blue-600 flex-shrink-0" />
          )}
          <div className="text-sm">
            <p className="font-medium text-slate-900">Install Cekatan</p>
            <p className="text-slate-500 text-xs">
              {isIOS 
                ? "Tap the Share icon, then 'Add to Home Screen'" 
                : "Install this app from your browser menu"}
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Dismiss install banner"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

export default InstallBanner;
