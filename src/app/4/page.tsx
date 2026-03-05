"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap, MessageCircle, Heart, Star, CheckCircle2 } from "lucide-react";

// VARIATION 4: "NEO-POP / GUMROAD STYLE"
// Concept: Playful, bold, creator-focused. High saturation, black outlines.
// Aesthetic: Yellow/Pink/Purple, hard shadows, chunky borders.
// Influences: Gumroad, Figma, Notion (illustrations).

const features = [
  { 
    title: "Rule Scan", 
    desc: "We check the boring rules so you don't have to.", 
    color: "bg-[#FFD700]", // Yellow
    icon: <ShieldIcon />
  },
  { 
    title: "Magic Rewrite", 
    desc: "Turn 'meh' posts into viral bangers instantly.", 
    color: "bg-[#FF69B4]", // Pink
    icon: <WandIcon />
  },
  { 
    title: "Flair Finder", 
    desc: "Pick the right tag every single time. No guessing.", 
    color: "bg-[#87CEEB]", // Sky Blue
    icon: <TagIcon />
  },
];

function ShieldIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
    )
}

function WandIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h2"/><path d="M17.8 11.8 19 13"/><path d="M15 9h0"/><path d="M17.8 6.2 19 5"/><path d="m3 21 9-9"/><path d="M12.2 6.2 11 5"/></svg>
    )
}

function TagIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>
    )
}


export default function Variation4() {
  return (
    <div className="min-h-screen bg-[#FFFAF0] text-black font-sans selection:bg-[#000] selection:text-white overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap');
        .font-grotesk { font-family: 'Space Grotesk', sans-serif; }
        .font-outfit { font-family: 'Outfit', sans-serif; }
        .shadow-hard { box-shadow: 4px 4px 0px 0px #000; }
        .shadow-hard-lg { box-shadow: 8px 8px 0px 0px #000; }
        .shadow-hard-xl { box-shadow: 12px 12px 0px 0px #000; }
        .hover-lift:hover { transform: translate(-2px, -2px); box-shadow: 6px 6px 0px 0px #000; }
        .pattern-dots {
          background-image: radial-gradient(#000 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>

      {/* Nav */}
      <nav className="border-b-4 border-black bg-white px-6 py-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#FF69B4] border-2 border-black rounded-full flex items-center justify-center font-black font-grotesk">U</div>
            <span className="font-outfit font-black text-xl tracking-tight">unbannnable.</span>
          </div>
          <div className="flex gap-4">
             <Button className="font-grotesk font-bold bg-[#87CEEB] text-black border-2 border-black rounded-lg shadow-hard hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000] transition-all">
                Log In
             </Button>
             <Button className="font-grotesk font-bold bg-[#FFD700] text-black border-2 border-black rounded-lg shadow-hard hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000] transition-all">
                Get Started
             </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-20 md:py-32 overflow-hidden relative">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
           <div className="relative z-10">
              <Badge className="bg-[#E6E6FA] text-black border-2 border-black font-bold mb-6 px-4 py-1 rounded-full shadow-hard rotate-[-2deg] inline-block">
                 ✨ 100% Ban-Proof Guarantee
              </Badge>
              <h1 className="font-outfit font-extrabold text-6xl md:text-8xl leading-[0.9] mb-8">
                 Don't let mods <span className="text-[#FF69B4] underline decoration-4 underline-offset-4 decoration-black">delete</span> your hard work.
              </h1>
              <p className="font-grotesk text-xl md:text-2xl font-medium mb-10 max-w-md leading-tight">
                 AI that rewrites your Reddit posts so they actually stay up. Zero stress. More upvotes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                 <Button className="h-16 px-8 text-xl font-bold font-outfit bg-[#000] text-white border-2 border-black rounded-xl shadow-hard-lg hover:bg-[#333] hover:translate-y-[-4px] hover:shadow-hard-xl transition-all">
                    Start Fixing Posts ➔
                 </Button>
                 <div className="flex items-center gap-2 px-4">
                    <div className="flex -space-x-3">
                       {[1,2,3].map(i => (
                          <div key={i} className={`w-10 h-10 rounded-full border-2 border-black bg-gray-200 z-${i*10}`}></div>
                       ))}
                    </div>
                    <span className="font-bold font-grotesk text-sm">Join 500+ creators</span>
                 </div>
              </div>
           </div>

           {/* Hero Image / Graphic */}
           <div className="relative">
              <div className="absolute inset-0 bg-[#87CEEB] rounded-[2rem] border-4 border-black transform rotate-3 translate-x-4 translate-y-4"></div>
              <div className="relative bg-white rounded-[2rem] border-4 border-black p-8 shadow-hard-lg transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                 <div className="flex items-center gap-3 mb-6 border-b-2 border-black pb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500 border border-black"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400 border border-black"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500 border border-black"></div>
                    <div className="ml-auto font-mono text-xs font-bold bg-gray-100 px-2 py-1 rounded border border-black">r/startups</div>
                 </div>
                 <div className="space-y-4 font-grotesk">
                    <div className="flex gap-4 items-start opacity-30 line-through decoration-red-500 decoration-4">
                       <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-black flex-shrink-0"></div>
                       <div className="bg-gray-100 p-4 rounded-xl border-2 border-black w-full">
                          <h3 className="font-bold mb-1">Check out my new app!</h3>
                          <p className="text-sm">It's the best thing ever. Download now.</p>
                       </div>
                    </div>
                    <div className="flex justify-center text-2xl">⬇️</div>
                    <div className="flex gap-4 items-start">
                       <div className="w-10 h-10 rounded-full bg-[#FFD700] border-2 border-black flex-shrink-0"></div>
                       <div className="bg-[#E0F7FA] p-4 rounded-xl border-2 border-black w-full shadow-hard">
                          <Badge className="bg-[#90EE90] text-black border border-black mb-2 text-[10px] font-bold">✓ Approved</Badge>
                          <h3 className="font-bold mb-1">How I solved X for Y...</h3>
                          <p className="text-sm">I spent 3 months building a solution for this problem. Here's what I learned along the way...</p>
                       </div>
                    </div>
                 </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-10 -right-10 bg-[#FF69B4] p-4 rounded-full border-4 border-black shadow-hard animate-bounce">
                 <Sparkles className="w-8 h-8 text-white stroke-black stroke-2" />
              </div>
           </div>
        </div>
      </section>

      {/* Features - Bento Grid Style */}
      <section className="py-24 bg-white border-y-4 border-black pattern-dots">
         <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
               <h2 className="font-outfit font-black text-5xl md:text-6xl mb-6">Tools for <span className="bg-[#FFD700] px-2 border-2 border-black shadow-[4px_4px_0px_0px_#000] transform -rotate-1 inline-block">Serious</span> Posters</h2>
               <p className="font-grotesk text-xl max-w-2xl mx-auto">Stop guessing what mods want. Give them exactly what they need.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
               {features.map((f, i) => (
                  <div key={i} className={`${f.color} p-8 rounded-[1.5rem] border-4 border-black shadow-hard-lg hover:translate-y-[-8px] hover:shadow-hard-xl transition-all duration-300`}>
                     <div className="w-16 h-16 bg-white rounded-2xl border-4 border-black flex items-center justify-center mb-6 shadow-hard">
                        {f.icon}
                     </div>
                     <h3 className="font-outfit font-black text-3xl mb-3">{f.title}</h3>
                     <p className="font-grotesk font-bold text-lg leading-tight">{f.desc}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 px-6 bg-[#E6E6FA]">
         <div className="max-w-4xl mx-auto">
            <div className="bg-white p-8 md:p-12 rounded-[2rem] border-4 border-black shadow-hard-xl text-center relative">
               <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#FF69B4] px-6 py-2 rounded-full border-4 border-black font-bold font-mono text-white shadow-hard rotate-2">
                  REAL USER TWEET
               </div>
               <div className="flex justify-center mb-6">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-8 h-8 fill-[#FFD700] text-black stroke-2" />)}
               </div>
               <h3 className="font-outfit font-bold text-2xl md:text-4xl leading-tight mb-8">
                  "I used to get banned from r/marketing weekly. Since using Unbannnable, I've had 3 posts hit the front page. It's actually magic."
               </h3>
               <div className="flex items-center justify-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-300 border-2 border-black"></div>
                  <div className="text-left font-grotesk">
                     <div className="font-black text-lg">Alex G.</div>
                     <div className="text-sm font-bold opacity-60">SaaS Founder</div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6 bg-[#FFFAF0]">
         <div className="max-w-5xl mx-auto">
            <h2 className="font-outfit font-black text-5xl text-center mb-16">Simple Pricing. <br/>Pay Once, <span className="text-[#8A2BE2]">Win Forever.</span></h2>
            
            <div className="grid md:grid-cols-2 gap-8 items-center">
               {/* Basic Plan */}
               <div className="bg-white p-8 rounded-[2rem] border-4 border-black shadow-hard">
                  <h3 className="font-grotesk font-bold text-2xl mb-2">Starter</h3>
                  <div className="font-outfit font-black text-6xl mb-6">$19</div>
                  <p className="font-medium mb-8 border-b-2 border-black/10 pb-8">Perfect for your first launch.</p>
                  <ul className="space-y-4 mb-8 font-bold">
                     <li className="flex gap-3"><CheckCircle2 className="w-6 h-6 text-green-500 fill-green-100" /> 20 Credits</li>
                     <li className="flex gap-3"><CheckCircle2 className="w-6 h-6 text-green-500 fill-green-100" /> Basic Scan</li>
                  </ul>
                  <Button className="w-full py-6 font-bold text-lg bg-white text-black border-2 border-black rounded-xl shadow-hard hover:bg-gray-50 transition-all">Get Starter</Button>
               </div>

               {/* Pro Plan */}
               <div className="bg-[#FFD700] p-8 md:p-12 rounded-[2rem] border-4 border-black shadow-hard-xl transform md:scale-105 relative z-10">
                  <div className="absolute -top-5 right-10 bg-black text-white px-4 py-2 rounded-lg font-bold font-mono border-2 border-white rotate-2">MOST POPULAR</div>
                  <h3 className="font-grotesk font-bold text-2xl mb-2">Pro Bundle</h3>
                  <div className="font-outfit font-black text-6xl mb-6">$39</div>
                  <p className="font-medium mb-8 border-b-2 border-black/10 pb-8">For serious growth hackers.</p>
                  <ul className="space-y-4 mb-8 font-bold">
                     <li className="flex gap-3"><CheckCircle2 className="w-6 h-6 text-black fill-white" /> 100 Credits</li>
                     <li className="flex gap-3"><CheckCircle2 className="w-6 h-6 text-black fill-white" /> Deep AI Rewrite</li>
                     <li className="flex gap-3"><CheckCircle2 className="w-6 h-6 text-black fill-white" /> Priority Support</li>
                  </ul>
                  <Button className="w-full py-6 font-bold text-lg bg-black text-white border-2 border-black rounded-xl shadow-hard hover:translate-y-[-2px] hover:shadow-hard-lg transition-all">Get Pro Access</Button>
               </div>
            </div>
         </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-black text-white text-center">
         <div className="max-w-2xl mx-auto">
            <h2 className="font-outfit font-black text-5xl md:text-7xl mb-8 leading-tight">Ready to conquer <br/><span className="text-[#FF69B4]">Reddit?</span></h2>
            <Button className="py-8 px-12 text-2xl font-black bg-[#FFD700] text-black border-4 border-white rounded-2xl shadow-[8px_8px_0px_0px_#FFF] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_0px_#FFF] transition-all">
               Let's Go 🚀
            </Button>
         </div>
      </section>
      
      <footer className="py-12 px-6 border-t-4 border-black bg-white flex flex-col md:flex-row justify-between items-center gap-6">
         <div className="font-outfit font-black text-xl">unbannnable.</div>
         <div className="flex gap-6 font-bold font-grotesk">
            <a href="#" className="hover:underline decoration-4 decoration-[#FF69B4]">Twitter</a>
            <a href="#" className="hover:underline decoration-4 decoration-[#87CEEB]">Instagram</a>
            <a href="#" className="hover:underline decoration-4 decoration-[#FFD700]">Email</a>
         </div>
         <div className="font-mono text-sm">© 2025</div>
      </footer>
    </div>
  );
}
