'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

type AdSenseAdProps = {
  slot: string;
  className?: string;
};

export default function AdSenseAd({ slot, className }: AdSenseAdProps) {
  useEffect(() => {
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch (error) {
      console.error('AdSense initialization failed:', error);
    }
  }, []);

  return (
    <div className={className} aria-label="Advertisement">
      <p style={{ margin: '0 0 6px', fontSize: 11, opacity: 0.65, textAlign: 'center' }}>ADVERTISEMENT</p>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', minHeight: 100 }}
        data-ad-client="ca-pub-6174663240539746"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
