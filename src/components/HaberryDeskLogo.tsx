import React from "react";

export function HaberryDeskIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Left vertical pill */}
      <rect x="3" y="3" width="4.5" height="18" rx="2.25" />
      {/* Right vertical pill */}
      <rect x="16.5" y="3" width="4.5" height="18" rx="2.25" />
      {/* Modern connecting bridge */}
      <rect x="6.5" y="10" width="11" height="4" rx="2" />
    </svg>
  );
}

export function HaberryDeskLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 font-bold tracking-tight text-white select-none ${className}`}>
      <HaberryDeskIcon className="w-5 h-5 text-white" />
      <span className="text-[17px] font-semibold tracking-[-0.02em] text-white">Haberry Desk</span>
    </div>
  );
}

export function GithubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export function ProductHuntIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-1.05 16.5H8.7V7.5h4.25c2.485 0 4.05 1.565 4.05 4.05 0 2.485-1.565 4.05-4.05 4.05H10.95v.9zm0-4.05h3.05c1.242 0 1.95-.708 1.95-1.95s-.708-1.95-1.95-1.95H10.95v3.9z" />
    </svg>
  );
}

