"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Clock, Globe, ShieldCheck } from "lucide-react";
import { useRef } from "react";

// VARIATION 3: "EDITORIAL / HIGH FASHION"
// Concept: Luxury, refined, typographic. High-end magazine feel.
// Aesthetic: Charcoal/Black background, serif fonts (Playfair/Cinzel), subtle gold/bronze.
// Influences: Vogue, luxury watch brands, Awwwards sites.

export default function Variation3() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div ref={containerRef} className="bg-[#0a0a0a] text-[#e0e0e0] min-h-screen font-serif selection:bg-[#d4af37] selection:text-black overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,800;1,400&family=Lato:wght@300;400&display=swap');
        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-lato { font-family: 'Lato', sans-serif; }
        .bronze-gradient {
          background: linear-gradient(135deg, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-8 py-6 mix-blend-difference text-white flex justify-between items-center backdrop-blur-sm border-b border-white/5">
        <div className="text-2xl font-playfair italic tracking-wider">Unbannnable</div>
        <div className="hidden md:flex gap-12 font-lato text-xs tracking-[0.2em] uppercase">
          <a href="#" className="hover:text-[#d4af37] transition-colors">Collection</a>
          <a href="#" className="hover:text-[#d4af37] transition-colors">Journal</a>
          <a href="#" className="hover:text-[#d4af37] transition-colors">Membership</a>
        </div>
        <div className="text-xs font-lato tracking-[0.2em]">EST. 2025</div>
      </nav>

      {/* Hero */}
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
        <motion.div style={{ y, opacity }} className="text-center z-10 px-6 max-w-4xl mx-auto">
          <div className="font-lato text-[#d4af37] text-xs tracking-[0.4em] uppercase mb-8 flex items-center justify-center gap-4">
             <span className="w-8 h-px bg-[#d4af37]"></span>
             The Art of Compliance
             <span className="w-8 h-px bg-[#d4af37]"></span>
          </div>
          <h1 className="font-playfair text-6xl md:text-9xl leading-[0.9] mb-8">
            Post Without<br />
            <span className="italic text-white/30">Compromise</span>
          </h1>
          <p className="font-lato text-white/60 max-w-md mx-auto leading-relaxed text-sm tracking-wide mb-12 border-l border-[#d4af37] pl-6 text-left">
            An algorithmic masterpiece designed to elevate your Reddit presence. 
            Automated rule verification for the discerning poster who demands perfection.
          </p>
          <div className="flex justify-center gap-6">
            <Button className="bg-[#d4af37] text-black hover:bg-white transition-colors duration-500 rounded-none px-10 py-6 font-lato text-xs tracking-[0.2em] uppercase">
                Begin Experience
            </Button>
            <Button variant="outline" className="border-white/20 text-white hover:border-[#d4af37] hover:text-[#d4af37] transition-colors duration-500 rounded-none px-10 py-6 font-lato text-xs tracking-[0.2em] uppercase bg-transparent">
                View Film
            </Button>
          </div>
        </motion.div>

        {/* Abstract Background Elements */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
           <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#d4af37] rounded-full blur-[120px] animate-pulse duration-[5000ms]"></div>
           <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white rounded-full blur-[100px] animate-pulse duration-[7000ms]"></div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
           <div className="w-[1px] h-24 bg-gradient-to-b from-transparent via-[#d4af37] to-transparent"></div>
           <span className="font-lato text-[10px] tracking-[0.3em] uppercase text-[#d4af37]">Scroll</span>
        </div>
      </section>

      {/* Content Sections - Alternating Layout */}
      <section className="py-32 px-6 md:px-20 max-w-7xl mx-auto">
        {[
          { title: "Compliance", subtitle: "Algorithmic Perfection", desc: "Our AI dissects subreddit rules with the precision of a master watchmaker, ensuring total adherence.", align: "left", icon: ShieldCheck },
          { title: "Optimization", subtitle: "Linguistic Refinement", desc: "Transform crude drafts into eloquent prose. We enhance engagement without sacrificing authenticity.", align: "right", icon: Globe },
          { title: "Security", subtitle: "Shadowban Evasion", desc: "Navigate the complex landscape of automated moderation with our proprietary stealth protocols.", align: "left", icon: Clock },
        ].map((item, i) => (
          <div key={i} className={`flex flex-col md:flex-row items-center gap-24 mb-48 ${item.align === "right" ? "md:flex-row-reverse" : ""}`}>
            <div className="flex-1 aspect-[3/4] bg-[#0f0f0f] relative overflow-hidden group border border-white/5">
               {/* Placeholder for "High Fashion" abstract imagery */}
               <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#000] opacity-80 group-hover:scale-105 transition-transform duration-[2s] ease-out"></div>
               <div className="absolute inset-0 flex items-center justify-center opacity-10 font-playfair text-[200px] italic text-[#fff]">
                  {i + 1}
               </div>
               <div className="absolute inset-8 border border-[#d4af37]/30 transition-all duration-700 group-hover:inset-12"></div>
               <div className="absolute bottom-8 right-8 text-[#d4af37]">
                   <item.icon className="w-8 h-8 opacity-50" />
               </div>
            </div>
            <div className="flex-1 space-y-10 text-center md:text-left">
              <div className="font-lato text-[#d4af37] text-xs tracking-[0.3em] uppercase flex items-center gap-4 md:justify-start justify-center">
                  <span className="w-4 h-px bg-[#d4af37]"></span>
                  {item.subtitle}
              </div>
              <h2 className="font-playfair text-6xl md:text-8xl">{item.title}</h2>
              <p className="font-lato text-white/50 leading-loose max-w-md mx-auto md:mx-0 font-light">{item.desc}</p>
              <div className="pt-8">
                 <a href="#" className="font-lato text-xs tracking-[0.2em] uppercase border-b border-[#d4af37] pb-2 hover:text-[#d4af37] transition-colors hover:pb-4 duration-300">Discover More</a>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Testimonial / Quote */}
      <section className="py-40 bg-[#050505] text-center px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-[#d4af37] to-transparent"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <Star className="w-6 h-6 text-[#d4af37] mx-auto mb-12 animate-pulse" />
          <blockquote className="font-playfair text-4xl md:text-6xl italic leading-relaxed mb-16 text-[#ccc]">
            "In a digital world of chaos, Unbannnable provides the structure required for your voice to be heard."
          </blockquote>
          <cite className="font-lato text-xs tracking-[0.3em] uppercase text-[#d4af37] not-italic block mb-2">
            — The Digital Post
          </cite>
          <span className="font-lato text-[10px] tracking-[0.2em] uppercase text-white/30">Volume 4, Issue 12</span>
        </div>
      </section>

      {/* Pricing - Minimal */}
      <section className="py-32 px-6 border-t border-[#222]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-px bg-[#222]">
          {[
             { name: "Atelier", price: "19", features: ["20 Credits", "Standard Analysis", "Email Support"] },
             { name: "Couture", price: "39", features: ["100 Credits", "Deep Learning Model", "Concierge Support"] }
          ].map((plan, i) => (
             <div key={i} className="bg-[#0a0a0a] p-24 hover:bg-[#0f0f0f] transition-colors text-center group relative overflow-hidden">
                <div className="absolute top-4 right-4 text-[#222] group-hover:text-[#d4af37]/10 text-9xl font-playfair italic transition-colors duration-700 pointer-events-none -mr-8 -mt-8">
                    {plan.price.charAt(0)}
                </div>
                <div className="font-lato text-xs tracking-[0.3em] uppercase mb-12 text-[#666] group-hover:text-[#d4af37] transition-colors relative z-10">{plan.name}</div>
                <div className="font-playfair text-7xl md:text-8xl mb-12 relative z-10">${plan.price}</div>
                <ul className="space-y-6 mb-16 font-lato text-sm text-[#888] tracking-wide relative z-10">
                   {plan.features.map((f, j) => <li key={j} className="group-hover:text-[#aaa] transition-colors">{f}</li>)}
                </ul>
                <Button variant="outline" className="border-[#333] text-[#ccc] hover:border-[#d4af37] hover:text-[#d4af37] rounded-none px-12 py-8 font-lato text-xs tracking-[0.2em] uppercase bg-transparent relative z-10">
                   Select Plan
                </Button>
             </div>
          ))}
        </div>
      </section>

      <footer className="py-20 px-8 border-t border-[#222] flex flex-col md:flex-row justify-between items-center text-[#444] font-lato text-[10px] tracking-[0.2em] uppercase">
         <div className="mb-8 md:mb-0">
             <div className="text-[#d4af37] mb-2">Unbannnable</div>
             <div>&copy; 2025 All Rights Reserved.</div>
         </div>
         <div className="flex gap-12">
            <a href="#" className="hover:text-[#d4af37] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#d4af37] transition-colors">Terms</a>
            <a href="#" className="hover:text-[#d4af37] transition-colors">Contact</a>
         </div>
      </footer>
    </div>
  );
}
