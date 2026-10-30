"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { ProductDemo } from "@/components/ProductDemo";
import { Features } from "@/components/Features";
import { Comparison } from "@/components/Comparison";
import { Testimonials } from "@/components/Testimonials";
import { Faq } from "@/components/Faq";
import { CtaBanner } from "@/components/CtaBanner";
import { Footer } from "@/components/Footer";
import { CommandPalette } from "@/components/CommandPalette";
import { AuthModal } from "@/components/AuthModal";

export default function Home() {
  const router = useRouter();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "trial">("trial");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // If already logged in, redirect straight to dashboard
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace("/dashboard");
      } else {
        setIsCheckingAuth(false);
      }
    });
  }, [router]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-zinc-700 border-t-white animate-spin" />
      </div>
    );
  }

  const handleOpenSignIn = () => {
    setAuthMode("signin");
    setAuthModalOpen(true);
  };

  const handleOpenTrial = () => {
    setAuthMode("trial");
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] selection:bg-zinc-800 selection:text-white flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        onOpenAuthModal={handleOpenSignIn}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section (Pixel-accurate to provided screenshot) */}
        <Hero
          onTryCloud={handleOpenTrial}
          onViewDemo={() => {
            const demoEl = document.getElementById("product-demo");
            demoEl?.scrollIntoView({ behavior: "smooth" });
          }}
        />

        {/* Interactive Live Product Demo */}
        <ProductDemo />

        {/* Feature Deep Dives & Philosophy */}
        <Features />

        {/* Feature Comparison Table vs Jira / Linear */}
        <Comparison />

        {/* Testimonials from Engineers */}
        <Testimonials />

        {/* Frequently Asked Questions */}
        <Faq />

        {/* Pre-footer Call to Action */}
        <CtaBanner onTryCloud={handleOpenTrial} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Command Palette (⌘K) Modal */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      {/* Sign In & Free Trial Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
}
