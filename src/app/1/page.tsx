"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Terminal, Shield, Zap, Eye, Lock, Cpu, Tag } from "lucide-react";
import { useState, useEffect } from "react";

// VARIATION 1: "THE GLITCH PROTOCOL"
// Concept: Cyberpunk / Hacker terminal. Raw, data-heavy, slightly unsettling but powerful.
// Aesthetic: Scanlines, CRT flicker, neon green/red, monospace.

const ScrambleText = ({ text }: { text: string }) => {
  const [display, setDisplay] = useState(text);
  const chars = "!@#$%^&*()_+-=[]{}|;:,.<>?/";

  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplay(
        text
          .split("")
          .map((char, index) => {
            if (index < iteration) return text[index];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );
      if (iteration >= text.length) clearInterval(interval);
      iteration += 1 / 3;
    }, 30);
    return () => clearInterval(interval);
  }, [text]);

  return <span>{display}</span>;
};

export default function Variation1() {
  return (
    <div className="min-h-screen bg-black text-green-500 font-mono overflow-x-hidden selection:bg-green-500 selection:text-black">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
        .font-tech { font-family: 'Share Tech Mono', monospace; }
        .crt::before {
          content: " ";
          display: block;
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
          background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
          z-index: 50;
          background-size: 100% 2px, 3px 100%;
          pointer-events: none;
        }
        .scanline {
          width: 100%;
          height: 100px;
          z-index: 50;
          background: linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(0, 255, 0, 0.2) 50%, rgba(0,0,0,0) 100%);
          opacity: 0.1;
          position: absolute;
          bottom: 100%;
          animation: scanline 10s linear infinite;
          pointer-events: none;
        }
        @keyframes scanline {
          0% { bottom: 100%; }
          100% { bottom: -100px; }
        }
      `}</style>

      <div className="crt fixed inset-0 pointer-events-none" />
      <div className="scanline fixed" />

      {/* Grid Background */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <main className="relative z-10 font-tech">
        {/* Header */}
        <header className="p-6 border-b border-green-900/50 flex justify-between items-center bg-black/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 animate-pulse" />
            <span className="text-xl tracking-widest">UNBANNNABLE_V2.0</span>
          </div>
          <div className="flex gap-6 text-sm">
             <span className="opacity-50 hover:opacity-100 cursor-pointer">[SYSTEM]</span>
             <span className="opacity-50 hover:opacity-100 cursor-pointer">[MODULES]</span>
             <span className="text-red-500 hover:text-red-400 cursor-pointer animate-pulse">[EXECUTE]</span>
          </div>
        </header>

        {/* Hero */}
        <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto min-h-[80vh] flex flex-col justify-center relative">
            <div className="absolute top-20 right-0 w-64 h-64 border border-green-900/30 opacity-20 rotate-45 animate-spin-slow pointer-events-none"></div>
            
          <motion.div 
            initial={{ opacity: 0, x: -50 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.8 }}
            className="border-l-2 border-green-500 pl-8 mb-12 max-w-4xl"
          >
            <div className="text-sm mb-4 text-green-700 font-bold tracking-[0.2em]">ID: U-7734 // TARGET: REDDIT_MODS</div>
            <h1 className="text-6xl md:text-8xl leading-none uppercase mb-6 text-transparent bg-clip-text bg-gradient-to-b from-green-300 to-green-900 drop-shadow-[0_0_10px_rgba(0,255,0,0.5)] font-bold tracking-tighter">
              <ScrambleText text="EVADE" /><br />
              <ScrambleText text="DETECTION" />
            </h1>
            <p className="max-w-xl text-xl text-green-400/80 leading-relaxed font-mono">
              Algorithmic post optimization. Bypass automod filters. 
              Neutralize shadowbans. Deploy content with 99.9% survival rate.
            </p>
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button className="bg-green-600 hover:bg-green-500 text-black font-bold text-lg px-8 py-6 rounded-none border border-green-400 shadow-[0_0_20px_rgba(0,255,0,0.3)] hover:shadow-[0_0_40px_rgba(0,255,0,0.6)] transition-all uppercase tracking-widest">
              INITIALIZE_SEQ
            </Button>
            <Button variant="outline" className="bg-transparent border-green-700 text-green-500 hover:bg-green-900/20 hover:text-green-300 rounded-none px-8 py-6 font-tech uppercase tracking-widest border-2">
              Read_Docs
            </Button>
          </div>
        </section>

        {/* Data Stream / Stats */}
        <div className="border-y border-green-900/50 bg-green-900/10 overflow-hidden py-4">
          <div className="animate-marquee whitespace-nowrap flex">
            {[...Array(4)].map((_, i) => (
              <span key={i} className="mx-8 text-green-600 font-bold tracking-widest text-sm uppercase">
                :: SYSTEM_OPTIMAL :: BAN_RATE_0% :: UPVOTE_PROTOCOL_ACTIVE :: AUTOMOD_BYPASS_ENGAGED :: NEURAL_NET_ONLINE ::
              </span>
            ))}
          </div>
          <style>{`
            .animate-marquee { animation: marquee 20s linear infinite; }
            @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-25%); } }
            .animate-spin-slow { animation: spin 20s linear infinite; }
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          `}</style>
        </div>

        {/* Features Grid */}
        <section className="py-24 px-6 max-w-7xl mx-auto">
            <div className="mb-12 border-b border-green-900/50 pb-4 flex justify-between items-end">
                <h2 className="text-4xl font-bold uppercase tracking-tighter text-green-400">/MODULES</h2>
                <span className="text-xs text-green-800">STATUS: ONLINE</span>
            </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border border-green-900/50">
            {[
              { title: "RULE_PARSER", icon: Shield, desc: "Scans subreddit rulesets. Identifies violation vectors." },
              { title: "CONTENT_REWRITE", icon: Cpu, desc: "Reconstructs payload to match community linguistic patterns." },
              { title: "FLAIR_INJECTION", icon: Tag, desc: "Auto-selects optimal categorization tags for max visibility." },
              { title: "SUB_DISCOVERY", icon: Eye, desc: "Locates alternative high-traffic deployment zones." },
              { title: "SHADOW_CHECK", icon: Lock, desc: "Pre-flight verification against shadowban databases." },
              { title: "VELOCITY_BOOST", icon: Zap, desc: "Timing optimization for maximum algorithmic uptake." },
            ].map((feature, i) => (
              <div key={i} className="group border border-green-900/30 p-8 hover:bg-green-900/20 transition-all relative overflow-hidden h-64 flex flex-col justify-between">
                <div className="absolute top-2 right-2 text-xs text-green-800 font-bold">0{i + 1}</div>
                <feature.icon className="w-10 h-10 mb-4 text-green-500 group-hover:text-white transition-colors group-hover:scale-110 duration-300" />
                <div>
                    <h3 className="text-xl font-bold mb-2 tracking-wider group-hover:translate-x-2 transition-transform text-green-300">{feature.title}</h3>
                    <p className="text-sm text-green-700 group-hover:text-green-400 transition-colors leading-relaxed">{feature.desc}</p>
                </div>
                <div className="absolute bottom-0 left-0 w-0 h-1 bg-green-500 group-hover:w-full transition-all duration-300" />
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Terminal */}
        <section className="py-20 px-6 max-w-5xl mx-auto">
          <div className="border border-green-500 bg-black p-1 shadow-[0_0_40px_rgba(0,255,0,0.1)]">
            <div className="bg-green-500 text-black px-2 py-1 text-xs font-bold flex justify-between uppercase tracking-widest">
              <span>PRICING_MODULE.exe</span>
              <span>[X]</span>
            </div>
            <div className="p-8 md:p-12 grid md:grid-cols-2 gap-12 relative">
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-green-900/50 hidden md:block"></div>
              <div>
                <h3 className="text-3xl font-bold mb-2 text-green-400">STARTER_PACK</h3>
                <div className="text-5xl font-bold mb-6 text-white">$19.00</div>
                <ul className="space-y-4 text-sm text-green-600 mb-8 font-bold tracking-wider">
                  <li className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500"></div> [20] Credits/Mo</li>
                  <li className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500"></div> Basic Scanning</li>
                  <li className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500"></div> Auto-Flair</li>
                </ul>
                <Button className="w-full bg-transparent border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-black rounded-none py-6 font-bold tracking-widest uppercase transition-all">
                  INITIATE_TRANSFER
                </Button>
              </div>
              <div className="relative">
                <div className="absolute -top-4 -right-4 bg-red-600 text-black text-xs font-bold px-2 py-1 animate-pulse">RECOMMENDED</div>
                <h3 className="text-3xl font-bold mb-2 text-red-500">PRO_ACCESS</h3>
                <div className="text-5xl font-bold mb-6 text-white">$39.00</div>
                <ul className="space-y-4 text-sm text-green-600 mb-8 font-bold tracking-wider">
                  <li className="flex items-center gap-2"><div className="w-2 h-2 bg-red-500"></div> [100] Credits/Mo</li>
                  <li className="flex items-center gap-2"><div className="w-2 h-2 bg-red-500"></div> Deep Analysis</li>
                  <li className="flex items-center gap-2"><div className="w-2 h-2 bg-red-500"></div> Priority Queue</li>
                  <li className="flex items-center gap-2"><div className="w-2 h-2 bg-red-500"></div> Admin Support</li>
                </ul>
                <Button className="w-full bg-red-600 text-black hover:bg-red-500 rounded-none border-2 border-red-400 py-6 font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(255,0,0,0.4)]">
                  OVERRIDE_AUTH
                </Button>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-green-900/50 py-12 px-6 bg-black text-center text-xs text-green-800 font-bold tracking-[0.2em] uppercase">
            <p>Unbannnable © 2025 // End of Line_</p>
        </footer>

      </main>
    </div>
  );
}
