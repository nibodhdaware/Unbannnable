"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRef } from "react";
import { Play, Pause, ChevronRight, Apple, Smartphone, Command, Zap, ShieldCheck, Globe } from "lucide-react";

// VARIATION 5: "CINEMATIC / SPATIAL"
// Concept: Deep depth, glassmorphism 2.0, Apple-esque animations.
// Aesthetic: Deep dark mode, subtle gradients, 3D transforms.
// Influences: Apple Vision Pro site, Linear, Raycast.

export default function Variation5() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.5]);
  const featureY = useTransform(scrollYProgress, [0.1, 0.3], [100, 0]);

  return (
    <div ref={containerRef} className="bg-[#050507] text-white min-h-[200vh] font-sans overflow-x-hidden selection:bg-indigo-500/30">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=SF+Pro+Display:wght@100;300;400;500;600;700&display=swap'); 
        /* Fallback to system fonts if SF Pro isn't available */
        .font-spatial { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
        .glass-panel {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        }
        .text-gradient {
          background: linear-gradient(180deg, #fff, #999);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .glow-spot {
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(100, 100, 255, 0.08) 0%, transparent 70%);
          filter: blur(80px);
          pointer-events: none;
        }
      `}</style>

      {/* Ambient Glows */}
      <div className="glow-spot top-[-200px] left-[20%] animate-pulse duration-[8000ms]"></div>
      <div className="glow-spot bottom-[10%] right-[10%] bg-[radial-gradient(circle,rgba(255,100,100,0.05)_0%,transparent_70%)] animate-pulse duration-[10000ms]"></div>

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 flex justify-center py-6">
        <div className="glass-panel rounded-full px-6 py-3 flex items-center gap-8 shadow-2xl">
          <div className="font-spatial font-semibold tracking-tight">Unbannnable</div>
          <div className="flex gap-6 text-sm text-white/60 font-medium">
            <a href="#" className="hover:text-white transition-colors">Product</a>
            <a href="#" className="hover:text-white transition-colors">Safety</a>
            <a href="#" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <Button size="sm" className="bg-white text-black hover:bg-white/90 rounded-full px-5 font-medium text-xs">
            Download
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="h-screen flex flex-col items-center justify-center relative perspective-1000">
        <motion.div style={{ scale: heroScale, opacity: heroOpacity }} className="text-center z-10 max-w-4xl px-6">
          <Badge className="mb-8 bg-white/10 text-white hover:bg-white/20 border-0 rounded-full px-4 py-1 backdrop-blur-md transition-colors">
             <span className="mr-2 text-indigo-400">●</span> Intelligence 2.0
          </Badge>
          <h1 className="font-spatial text-6xl md:text-8xl font-bold tracking-tight mb-8 text-gradient">
            Post with <br/>confidence.
          </h1>
          <p className="font-spatial text-xl md:text-2xl text-white/50 max-w-2xl mx-auto leading-relaxed font-light mb-12">
            Advanced linguistic analysis to ensure your content thrives on Reddit.
            Avoid moderation filters before you hit submit.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full px-8 py-6 text-lg shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] transition-all hover:scale-105">
               Start Analysis <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="ghost" className="text-white hover:bg-white/10 rounded-full px-8 py-6 text-lg font-light flex items-center gap-3">
               <Play className="w-4 h-4 fill-white" /> Watch Keynote
            </Button>
          </div>
        </motion.div>
        
        {/* Hero Visual - Simulated 3D Interface */}
        <motion.div 
           initial={{ rotateX: 20, opacity: 0, y: 100 }}
           animate={{ rotateX: 10, opacity: 1, y: 50 }}
           transition={{ duration: 1.5, ease: "easeOut" }}
           className="absolute bottom-[-10%] w-[90%] md:w-[70%] aspect-video glass-panel rounded-t-[3rem] border-b-0 shadow-[0_-20px_80px_rgba(0,0,0,0.5)] overflow-hidden"
        >
           <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
           <div className="p-8 md:p-12 flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-6">
                 <Zap className="w-8 h-8 text-indigo-400" />
              </div>
              <div className="text-2xl font-medium mb-2">Analysis Complete</div>
              <div className="text-white/40 mb-8">Your post is 99% compliant.</div>
              <div className="w-full max-w-md h-2 bg-white/10 rounded-full overflow-hidden">
                 <div className="w-[99%] h-full bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,1)]"></div>
              </div>
           </div>
        </motion.div>
      </section>

      {/* Spatial Feature Grid */}
      <section className="py-40 px-6 relative z-10">
         <motion.div style={{ y: featureY }} className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
               {[
                  { title: "Real-time", desc: "Checks rules as you type.", icon: Command, col: "lg:col-span-2" },
                  { title: "Secure", desc: "Private by default.", icon: ShieldCheck, col: "" },
                  { title: "Global", desc: "Works on all subreddits.", icon: Globe, col: "" },
                  { title: "Smart", desc: "Understands context deeply.", icon: Zap, col: "lg:col-span-2" },
               ].map((f, i) => (
                  <div key={i} className={`glass-panel p-10 rounded-[2rem] hover:bg-white/5 transition-colors duration-500 group ${f.col}`}>
                     <f.icon className="w-10 h-10 text-white/80 mb-6 group-hover:scale-110 transition-transform duration-500" />
                     <h3 className="text-3xl font-semibold mb-2">{f.title}</h3>
                     <p className="text-white/50 text-lg">{f.desc}</p>
                  </div>
               ))}
            </div>
         </motion.div>
      </section>

      {/* Parallax Quote */}
      <section className="py-40 flex items-center justify-center relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-900/10 to-transparent pointer-events-none"></div>
         <div className="text-center max-w-5xl px-6 relative z-10">
            <h2 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight text-gradient opacity-90">
               "The most essential tool for the modern digital citizen."
            </h2>
         </div>
      </section>

      {/* Pricing - Cards */}
      <section className="py-32 px-6">
         <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            <div className="glass-panel p-10 rounded-[2.5rem] flex flex-col justify-between h-full hover:border-white/20 transition-colors">
               <div>
                  <div className="text-lg font-medium text-white/60 mb-2">Standard</div>
                  <div className="text-5xl font-bold mb-6">$19</div>
                  <p className="text-white/40 mb-10 leading-relaxed">Perfect for individuals starting their journey. Essential protection included.</p>
               </div>
               <Button className="w-full bg-white/10 hover:bg-white/20 text-white rounded-full py-6 backdrop-blur-md transition-all">
                  Get Standard
               </Button>
            </div>
            
            <div className="p-10 rounded-[2.5rem] flex flex-col justify-between h-full bg-gradient-to-b from-indigo-600 to-indigo-800 shadow-2xl shadow-indigo-900/50 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-30">
                  <Zap className="w-32 h-32 text-white rotate-12" />
               </div>
               <div className="relative z-10">
                  <div className="text-lg font-medium text-white/80 mb-2">Professional</div>
                  <div className="text-5xl font-bold mb-6 text-white">$39</div>
                  <p className="text-white/70 mb-10 leading-relaxed font-medium">For power users who demand the highest level of analysis and speed.</p>
               </div>
               <Button className="w-full bg-white text-indigo-900 hover:bg-gray-100 rounded-full py-6 shadow-lg transition-all font-semibold relative z-10">
                  Get Professional
               </Button>
            </div>
         </div>
      </section>

      <footer className="py-20 border-t border-white/5 text-center">
         <div className="mb-8">
            <span className="font-spatial font-bold text-2xl tracking-tight">Unbannnable</span>
         </div>
         <div className="flex justify-center gap-8 text-sm text-white/40 mb-12">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
         </div>
         <div className="text-xs text-white/20">
            Designed in California. © 2025.
         </div>
      </footer>
    </div>
  );
}
