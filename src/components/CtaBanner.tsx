import React from "react";
import { ArrowRight } from "lucide-react";
import { GithubIcon } from "./HaberryDeskLogo";

interface CtaBannerProps {
  onTryCloud?: () => void;
}

export function CtaBanner({ onTryCloud }: CtaBannerProps) {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      {/* Background radial glow */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center -z-10"
        aria-hidden="true"
      >
        <div className="h-[400px] w-[600px] rounded-full bg-zinc-800/25 blur-[140px]" />
      </div>

      <div className="max-w-5xl mx-auto px-6 lg:px-12 text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white tracking-tight leading-tight">
          Ready to spend less time managing
          <br />
          and more time shipping?
        </h2>

        <p className="mt-5 text-base sm:text-lg text-zinc-400 max-w-xl mx-auto">
          Start your 14-day Haberry Desk Cloud trial today, or run your own instance locally in seconds. No credit card required.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onTryCloud}
            className="inline-flex items-center gap-2 bg-white text-zinc-950 font-medium text-sm px-6 py-3 rounded-lg hover:bg-zinc-200 active:scale-[0.98] transition-all shadow-md cursor-pointer"
          >
            <span>Try Haberry Desk Cloud</span>
            <ArrowRight className="w-4 h-4 text-zinc-900" />
          </button>

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-medium text-sm px-5 py-3 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer"
          >
            <GithubIcon className="w-4 h-4" />
            <span>Star on GitHub</span>
          </a>
        </div>

        <p className="mt-3.5 text-xs text-zinc-500">
          14-day cloud trial • No credit card required • Cancel anytime
        </p>
      </div>
    </section>
  );
}

