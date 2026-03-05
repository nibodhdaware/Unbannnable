"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Grid, Layers, Zap, Circle, Square } from "lucide-react";

// VARIATION 7: "SWISS DARK / INTERNATIONAL NIGHT"
// Concept: The "Swiss Grid" (Variation 2) but darker, sleeker, and more digital.
// Aesthetic: Deep black/navy, stark white text, electric blue accents.
// Influences: Dark mode architectural sites, Dieter Rams (if he went cyberpunk).

const steps = [
  { id: "01", label: "Input", title: "Drafting", desc: "Write naturally. Our engine parses your intent instantly." },
  { id: "02", label: "Process", title: "Refining", desc: "Linguistic rules applied. Banned phrases neutralized." },
  { id: "03", label: "Output", title: "Publishing", desc: "Optimized payload deployed to target community." }
];

export default function Variation7() {
  return (
    <div className="min-h-screen bg-[#050505] text-[#E0E0E0] font-sans selection:bg-[#0033FF] selection:text-white overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;700&family=Roboto:wght@300;400;500;700&display=swap');
        .font-condensed { font-family: 'Oswald', sans-serif; }
        .font-standard { font-family: 'Roboto', sans-serif; }
        .grid-line {
          position: absolute;
          background-color: rgba(255, 255, 255, 0.1);
          z-index: 0;
        }
        .text-electric { color: #2E5CFF; }
        .bg-electric { background-color: #2E5CFF; }
        .border-electric { border-color: #2E5CFF; }
        
        .hover-slide-text {
            display: inline-block;
            transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .group:hover .hover-slide-text {
            transform: translateX(10px);
        }
      `}</style>

      {/* Grid Lines Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 flex justify-between px-6 max-w-7xl mx-auto">
        <div className="w-px h-full bg-white/5"></div>
        <div className="w-px h-full bg-white/5"></div>
        <div className="w-px h-full bg-white/5"></div>
        <div className="w-px h-full bg-white/5"></div>
      </div>
      <div className="fixed top-32 left-0 w-full h-px bg-white/5 z-0"></div>
      <div className="fixed bottom-32 left-0 w-full h-px bg-white/5 z-0"></div>

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-[#050505]/90 backdrop-blur-sm border-b border-white/10 px-6 h-20 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-electric"></div>
            <span className="font-condensed text-xl font-bold tracking-widest uppercase">Unbannnable</span>
         </div>
         <div className="flex gap-1 items-center">
            <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/5 rounded-none font-condensed tracking-wider uppercase">Login</Button>
            <div className="w-px h-4 bg-white/20 mx-2"></div>
            <Button className="bg-electric text-white hover:bg-blue-600 rounded-none font-condensed tracking-wider uppercase px-6">System Access</Button>
         </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 pt-40 pb-20 px-6 min-h-screen flex flex-col justify-center">
         <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
               <div className="flex items-center gap-4 mb-8">
                  <span className="font-condensed text-electric tracking-widest uppercase text-sm border border-electric/30 px-3 py-1">V 2.0.4</span>
                  <span className="w-12 h-px bg-white/20"></span>
                  <span className="font-standard text-xs text-white/40 uppercase tracking-widest">System Online</span>
               </div>
               <h1 className="font-condensed text-7xl md:text-9xl font-bold leading-[0.85] uppercase tracking-tighter mb-12">
                  Content<br />
                  <span className="text-electric">Assurance</span><br />
                  Protocol
               </h1>
               <div className="max-w-md">
                  <p className="font-standard text-xl text-white/60 leading-relaxed mb-8">
                     Advanced linguistic restructuring for hostile moderation environments.
                     We ensure your message survives the filter.
                  </p>
                  <Button className="h-14 px-8 bg-white text-black hover:bg-gray-200 rounded-none font-condensed font-bold text-lg uppercase tracking-widest flex items-center gap-4 group">
                     Initiate Sequence <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </Button>
               </div>
            </div>
            
            {/* Visual Abstract */}
            <div className="relative hidden md:block border border-white/10 bg-white/5 p-8">
               <div className="absolute top-0 right-0 p-2">
                  <Grid className="w-6 h-6 text-white/20" />
               </div>
               <div className="h-full flex flex-col justify-between">
                  <div className="space-y-2 font-mono text-xs text-electric">
                     <div>&gt; ANALYSIS_RUNNING...</div>
                     <div>&gt; DETECTED_FLAGS: 0</div>
                     <div>&gt; OPTIMIZATION: 100%</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                     {[...Array(16)].map((_, i) => (
                        <div key={i} className={`aspect-square border border-white/10 ${i === 5 || i === 10 ? 'bg-electric' : 'bg-transparent'}`}></div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Process - Horizontal Scroll Feel */}
      <section className="border-t border-white/10 bg-[#0A0A0A] relative z-10">
         <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10 max-w-7xl mx-auto border-x border-white/10">
            {steps.map((step, i) => (
               <div key={i} className="p-12 group hover:bg-white/5 transition-colors duration-500 cursor-default">
                  <div className="flex justify-between items-start mb-12">
                     <span className="font-condensed text-6xl font-bold text-white/10 group-hover:text-electric transition-colors duration-500">{step.id}</span>
                     <span className="font-mono text-xs text-electric border border-electric/30 px-2 py-1 uppercase">{step.label}</span>
                  </div>
                  <h3 className="font-condensed text-3xl font-bold uppercase mb-4 group-hover:translate-x-2 transition-transform">{step.title}</h3>
                  <p className="font-standard text-white/50 leading-relaxed">{step.desc}</p>
               </div>
            ))}
         </div>
      </section>

      {/* Metric Big Type */}
      <section className="py-40 px-6 border-b border-white/10 relative z-10 overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent opacity-50"></div>
         <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
            <div>
               <h2 className="font-condensed text-5xl md:text-7xl font-bold uppercase leading-none mb-8">
                  Zero<br/>
                  <span className="text-white/20">Tolerance</span><br/>
                  For<br/>
                  <span className="text-white/20">Removals</span>
               </h2>
            </div>
            <div className="space-y-12">
               <div className="border-l-2 border-electric pl-8">
                  <div className="font-condensed text-6xl font-bold mb-2">99.8%</div>
                  <div className="font-standard text-sm uppercase tracking-widest text-white/50">Success Rate</div>
               </div>
               <div className="border-l-2 border-white/20 pl-8">
                  <div className="font-condensed text-6xl font-bold mb-2">50k+</div>
                  <div className="font-standard text-sm uppercase tracking-widest text-white/50">Posts Protected</div>
               </div>
            </div>
         </div>
      </section>

      {/* Pricing - Technical Spec */}
      <section className="py-24 px-6 relative z-10">
         <div className="max-w-5xl mx-auto">
            <div className="flex items-end justify-between mb-12 border-b border-white/10 pb-4">
               <h2 className="font-condensed text-4xl uppercase">Access Plans</h2>
               <div className="font-mono text-xs text-electric">SELECT_TIER</div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-px bg-white/10 border border-white/10">
               <div className="bg-[#050505] p-12 hover:bg-[#080808] transition-colors relative group">
                  <div className="absolute top-4 right-4 w-3 h-3 border border-white/20 rounded-full group-hover:bg-white transition-colors"></div>
                  <h3 className="font-condensed text-2xl uppercase text-white/60 mb-8">Standard License</h3>
                  <div className="font-condensed text-6xl font-bold mb-8">$19</div>
                  <ul className="space-y-4 font-standard text-sm text-white/60 mb-12">
                     <li className="flex items-center gap-3"><Square className="w-2 h-2 fill-white" /> 20 Credits / Mo</li>
                     <li className="flex items-center gap-3"><Square className="w-2 h-2 fill-white" /> Basic Protection</li>
                  </ul>
                  <Button variant="outline" className="w-full rounded-none border-white/20 text-white hover:bg-white hover:text-black font-condensed uppercase tracking-widest">
                     Acquire
                  </Button>
               </div>

               <div className="bg-[#050505] p-12 hover:bg-[#080808] transition-colors relative group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-electric"></div>
                  <div className="absolute top-4 right-4 w-3 h-3 border border-electric rounded-full bg-electric animate-pulse"></div>
                  <h3 className="font-condensed text-2xl uppercase text-white mb-8">Professional License</h3>
                  <div className="font-condensed text-6xl font-bold mb-8 text-electric">$39</div>
                  <ul className="space-y-4 font-standard text-sm text-white mb-12">
                     <li className="flex items-center gap-3"><Square className="w-2 h-2 fill-electric text-electric" /> 100 Credits / Mo</li>
                     <li className="flex items-center gap-3"><Square className="w-2 h-2 fill-electric text-electric" /> Advanced Evasion</li>
                     <li className="flex items-center gap-3"><Square className="w-2 h-2 fill-electric text-electric" /> Priority Support</li>
                  </ul>
                  <Button className="w-full rounded-none bg-electric text-white hover:bg-blue-600 font-condensed uppercase tracking-widest border border-electric">
                     Acquire
                  </Button>
               </div>
            </div>
         </div>
      </section>

      <footer className="border-t border-white/10 py-12 px-6 bg-[#020202] text-center">
         <div className="font-condensed text-2xl font-bold tracking-widest uppercase mb-8">Unbannnable</div>
         <div className="flex justify-center gap-8 font-mono text-xs text-white/40 mb-8">
            <a href="#" className="hover:text-electric">[TWITTER]</a>
            <a href="#" className="hover:text-electric">[DISCORD]</a>
            <a href="#" className="hover:text-electric">[EMAIL]</a>
         </div>
         <div className="font-mono text-[10px] text-white/20">
            SYSTEM_ID: UNB-2025 // ALL RIGHTS RESERVED
         </div>
      </footer>
    </div>
  );
}
