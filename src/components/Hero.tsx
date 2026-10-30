"use client";

import React from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { GithubIcon, ProductHuntIcon } from "./HaberryDeskLogo";

interface HeroProps {
  onTryCloud?: () => void;
  onViewDemo?: () => void;
}

export function Hero({ onTryCloud, onViewDemo }: HeroProps) {
  return (
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
      {/* Subtle background ambient gradient */}
      <div
        className="pointer-events-none absolute -top-40 left-1/4 -z-10 h-[500px] w-[600px] rounded-full bg-zinc-800/20 blur-[130px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-48 -left-32 -z-10 h-[350px] w-[450px] rounded-full bg-zinc-700/10 blur-[120px]"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="max-w-4xl text-left">
          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[68px] font-semibold text-white tracking-[-0.035em] leading-[1.08]">
            Project management
            <br />
            that doesn&apos;t become the project.
          </h1>

          {/* Subtitle */}
          <p className="mt-7 text-base sm:text-lg md:text-[19px] text-zinc-400 font-normal leading-[1.6] max-w-2xl tracking-[-0.01em]">
            Boards, Gantt charts, and GitHub integration for teams that
            would rather ship than manage a tracker. Haberry Desk Cloud handles
            hosting, backups, and updates, so you can start in minutes.
          </p>

          {/* CTA Buttons */}
          <div className="mt-9 flex flex-wrap items-center gap-3.5">
            <button
              onClick={onTryCloud}
              className="group inline-flex items-center gap-2.5 bg-white text-zinc-950 font-medium text-[14.5px] px-5 py-2.5 rounded-lg hover:bg-zinc-200 active:scale-[0.99] transition-all duration-150 shadow-sm cursor-pointer"
            >
              <span>Try Haberry Desk Cloud</span>
              <ArrowRight className="w-4 h-4 text-zinc-900 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>

            <a
              href="#product-demo"
              onClick={onViewDemo}
              className="inline-flex items-center justify-center bg-[#18181b]/90 hover:bg-zinc-800 text-zinc-200 hover:text-white font-medium text-[14.5px] px-5 py-2.5 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-all duration-150 cursor-pointer"
            >
              View live demo
            </a>
          </div>

          {/* Subtext */}
          <p className="mt-3.5 text-[13px] text-zinc-500 font-normal tracking-tight">
            14-day cloud trial. No credit card required.
          </p>

          {/* Social Proof / Integrations Links */}
          <div className="mt-12 sm:mt-16 flex items-center gap-6 text-[13.5px] text-zinc-400">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
              <GithubIcon className="w-4 h-4" />
              <span>GitHub</span>
            </a>

            <a
              href="https://www.producthunt.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors"
            >
              <ProductHuntIcon className="w-4 h-4 text-zinc-400" />
              <span>Product Hunt</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
