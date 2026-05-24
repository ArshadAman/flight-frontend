import * as React from "react";

export function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="#D60D26" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

export function CheckmarkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function SupportClockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="#F2FBFF" className={className}>
      <circle cx="12" cy="12" r="11" />
      <circle cx="12" cy="12" r="8" fill="white" />
      <path d="M12 4v8l4 2" stroke="#D60D26" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function HeadsetIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="#D60D26" className={className}>
      <path d="M12 2A10 10 0 0 0 2 12c0 4.28 2.31 8 5.76 9.5l-.26 2.5 3-1.5A9.96 9.96 0 0 0 12 22a10 10 0 0 0 0-20z" />
      <circle cx="9" cy="10" r="1.5" fill="white" />
      <circle cx="15" cy="10" r="1.5" fill="white" />
      <path d="M9 14s1.5 2 3 2 3-2 3-2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
