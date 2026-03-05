"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Plus, Minus, Square, Box } from "lucide-react";

// VARIATION 2: "SWISS GRID / INTERNATIONAL"
// Concept: Brutalist but refined. Massive typography, strict grid, high contrast.
// Aesthetic: White background, huge black text, orange accents (brand color).
// Influences: Josef Müller-Brockmann, modern art galleries.

const features = [
  { id: "01", title: "Rule Scan", desc: "Automated compliance verification." },
  { id: "02", title: "Rewrite", desc: "Linguistic optimization engine." },
  { id: "03", title: "Discovery", desc: "Community targeting system." },
  { id: "04", title: "Flair", desc: "Categorization protocol." },
];

export default function Variation2() {
  return (
    <div className="min-h-screen bg-[#F4F4F0] text-black font-sans selection:bg-[#FF4500] selection:text-white overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        .font-swiss { font-family: 'Inter', sans-serif; }
        .grid-bg {
          background-image: linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px);
          background-size: 100px 100px;
          opacity: 0.05;
        }
      `}</style>

      <div className="fixed inset-0 grid-bg pointer-events-none" />

      {/* Nav */}
      <nav className="fixed top-0 left-0 w-full z-50 border-b-2 border-black bg-[#F4F4F0] px-6 py-4 flex justify-between items-center backdrop-blur-md bg-opacity-90">
        <div className="text-xl font-black tracking-tighter uppercase flex items-center gap-2">
            <div className="w-4 h-4 bg-[#FF4500]"></div>
            Unbannnable®
        </div>
        <div className="hidden md:flex gap-8 text-sm font-bold tracking-tight uppercase">
          <a href="#" className="hover:underline decoration-2 underline-offset-4 decoration-[#FF4500]">Index</a>
          <a href="#" className="hover:underline decoration-2 underline-offset-4 decoration-[#FF4500]">Manifesto</a>
          <a href="#" className="hover:underline decoration-2 underline-offset-4 decoration-[#FF4500]">Pricing</a>
        </div>
        <Button className="rounded-none bg-[#FF4500] hover:bg-black text-white font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase px-6">
          Start Now
        </Button>
      </nav>

      <main className="pt-20 font-swiss relative z-10">
        
        {/* Hero */}
        <section className="px-6 min-h-[90vh] flex flex-col justify-center border-b-2 border-black relative overflow-hidden">
            <div className="absolute right-0 top-0 w-1/2 h-full bg-[#FF4500] opacity-5 mix-blend-multiply pointer-events-none transform skew-x-12 translate-x-20"></div>
            
          <div className="max-w-[95vw] relative z-10">
            <motion.div
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "circOut" }}
                className="mb-8"
            >
                <div className="inline-block px-4 py-1 bg-black text-white font-bold text-xs uppercase tracking-widest mb-6 rotate-[-2deg]">
                    System v2.0 // Active
                </div>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="text-[13vw] leading-[0.8] font-black tracking-tighter uppercase mb-12 mix-blend-darken"
            >
              Post<span className="text-[#FF4500]">.</span><br />
              Without<br />
              Fear<span className="text-[#FF4500]">.</span>
            </motion.h1>
          </div>

          <div className="grid md:grid-cols-12 gap-12 items-end pb-12">
            <div className="md:col-span-5 text-xl md:text-2xl font-bold leading-tight tracking-tight border-l-4 border-[#FF4500] pl-6">
              An AI-powered intervention tool for Reddit content. 
              We prevent removals before they happen through rigorous algorithmic pre-screening.
            </div>
            <div className="md:col-span-7 flex justify-end items-end gap-4">
               <div className="text-right">
                   <div className="text-sm font-bold uppercase tracking-widest mb-1 opacity-50">Scroll to Explore</div>
                   <div className="h-px w-32 bg-black ml-auto"></div>
               </div>
               <ArrowUpRight className="w-16 h-16 md:w-32 md:h-32 stroke-[1] text-[#FF4500] animate-pulse" />
            </div>
          </div>
        </section>

        {/* Marquee */}
        <div className="bg-black text-white py-6 overflow-hidden border-b-2 border-black rotate-[1deg] scale-105 origin-left z-20 relative shadow-xl">
          <div className="animate-marquee whitespace-nowrap text-4xl font-black uppercase tracking-widest flex items-center">
             {[...Array(8)].map((_, i) => (
               <span key={i} className="mx-12 flex items-center gap-6">
                 <Square className="w-4 h-4 fill-[#FF4500] stroke-none" /> No More Bans <span className="text-[#FF4500]">//</span>
               </span>
             ))}
          </div>
          <style>{`
            .animate-marquee { animation: marquee 20s linear infinite; }
            @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-25%); } }
          `}</style>
        </div>

        {/* Grid Layout */}
        <section className="grid md:grid-cols-2 lg:grid-cols-4 border-b-2 border-black bg-white mt-[-10px] pt-10 relative z-10">
          {features.map((f, i) => (
            <div key={i} className={`p-8 md:p-12 border-r-2 border-black last:border-r-0 min-h-[500px] flex flex-col justify-between hover:bg-[#FF4500] hover:text-white transition-all duration-300 group relative cursor-crosshair overflow-hidden`}>
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-20 transition-opacity duration-500">
                  <Box className="w-32 h-32 stroke-[0.5]" />
              </div>
              <div className="flex justify-between items-start border-b-2 border-black/10 group-hover:border-white/20 pb-4 mb-4">
                <span className="text-lg font-black font-mono">({f.id})</span>
                <Plus className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity group-hover:rotate-90 duration-300" />
              </div>
              <div className="relative z-10">
                <h3 className="text-5xl font-black uppercase mb-4 leading-none tracking-tighter group-hover:translate-x-2 transition-transform duration-300">{f.title}</h3>
                <p className="text-lg font-bold opacity-60 max-w-[200px] leading-tight group-hover:opacity-90">{f.desc}</p>
              </div>
              <div className="mt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                  <span className="text-xs font-bold uppercase tracking-widest border border-white px-2 py-1">View Detail</span>
              </div>
            </div>
          ))}
        </section>

        {/* Big Statement */}
        <section className="px-6 py-40 border-b-2 border-black bg-[#F4F4F0] relative">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] border border-black/5 pointer-events-none"></div>
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] mb-16">
              The <span className="bg-[#FF4500] text-white px-4 inline-block transform -rotate-2">End</span> of<br />
              Arbitrary<br />
              Moderation.
            </h2>
            <div className="flex justify-center gap-6">
               <Button size="lg" className="h-20 px-16 rounded-none bg-black text-white text-2xl font-black hover:bg-white hover:text-black transition-all border-4 border-black shadow-[8px_8px_0px_0px_#FF4500] hover:shadow-none hover:translate-x-2 hover:translate-y-2 uppercase">
                 Get Started
               </Button>
            </div>
          </div>
        </section>

        {/* Pricing Table */}
        <section className="grid md:grid-cols-2 bg-black text-white border-b-2 border-black">
           <div className="p-12 md:p-24 border-b md:border-b-0 md:border-r border-white/20 flex flex-col justify-between group hover:bg-[#111] transition-colors">
              <div>
                <h3 className="text-3xl font-black mb-12 uppercase tracking-widest text-white flex items-center gap-4">
                    <span className="w-4 h-4 bg-white rounded-full"></span> Basic
                </h3>
                <div className="text-[120px] leading-none font-black mb-4 tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">$19</div>
                <p className="text-white/60 mb-12 text-xl font-medium max-w-sm">Essential protection for casual posters and early adopters.</p>
              </div>
              <ul className="space-y-6 text-xl font-bold border-t border-white/20 pt-12">
                <li className="flex items-center gap-4"><div className="w-3 h-3 bg-[#FF4500]"></div> 20 Credits</li>
                <li className="flex items-center gap-4"><div className="w-3 h-3 bg-[#FF4500]"></div> Rule Check</li>
                <li className="flex items-center gap-4"><div className="w-3 h-3 bg-[#FF4500]"></div> Standard Support</li>
              </ul>
           </div>
           <div className="p-12 md:p-24 bg-[#FF4500] text-black flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 bg-black text-white font-black uppercase text-sm tracking-widest rotate-90 origin-top-right translate-x-full">
                Recommended
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-black mb-12 uppercase tracking-widest flex items-center gap-4">
                    <span className="w-4 h-4 bg-black rounded-full animate-pulse"></span> Pro
                </h3>
                <div className="text-[120px] leading-none font-black mb-4 tracking-tighter">$39</div>
                <p className="text-black/70 mb-12 text-xl font-bold max-w-sm">Full arsenal for power users and agency growth.</p>
              </div>
              <ul className="space-y-6 text-xl font-bold border-t border-black/20 pt-12 relative z-10">
                <li className="flex items-center gap-4"><div className="w-3 h-3 bg-black"></div> 100 Credits</li>
                <li className="flex items-center gap-4"><div className="w-3 h-3 bg-black"></div> Priority AI Processing</li>
                <li className="flex items-center gap-4"><div className="w-3 h-3 bg-black"></div> 24/7 Founder Support</li>
              </ul>
              <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-black opacity-10 rounded-full blur-3xl pointer-events-none group-hover:scale-150 transition-transform duration-700"></div>
           </div>
        </section>
        
        <footer className="p-16 border-t-2 border-black bg-[#F4F4F0] grid md:grid-cols-4 gap-12 text-sm font-bold uppercase tracking-tight relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#FF4500] via-black to-[#FF4500]"></div>
          <div className="flex flex-col justify-between h-full">
            <div className="text-2xl font-black mb-4">Unbannnable®</div>
            <div className="opacity-50">&copy; 2025 Unbannnable Inc.</div>
          </div>
          <div className="space-y-4">
            <div className="text-xs opacity-50 mb-4">Legal</div>
            <a href="#" className="block hover:text-[#FF4500] hover:translate-x-2 transition-transform">Terms of Service</a>
            <a href="#" className="block hover:text-[#FF4500] hover:translate-x-2 transition-transform">Privacy Policy</a>
            <a href="#" className="block hover:text-[#FF4500] hover:translate-x-2 transition-transform">Cookie Policy</a>
          </div>
          <div className="space-y-4">
            <div className="text-xs opacity-50 mb-4">Social</div>
            <a href="#" className="block hover:text-[#FF4500] hover:translate-x-2 transition-transform">Twitter / X</a>
            <a href="#" className="block hover:text-[#FF4500] hover:translate-x-2 transition-transform">Instagram</a>
            <a href="#" className="block hover:text-[#FF4500] hover:translate-x-2 transition-transform">LinkedIn</a>
          </div>
          <div className="md:text-right flex flex-col justify-between">
             <div className="text-[#FF4500] text-lg font-black">Zurich / New York / Tokyo</div>
             <div className="text-[100px] leading-none opacity-5 font-black absolute bottom-0 right-0 pointer-events-none select-none">2025</div>
          </div>
        </footer>

      </main>
    </div>
  );
}
