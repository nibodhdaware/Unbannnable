"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bookmark, Search, Star, MessageSquare } from "lucide-react";

// VARIATION 8: "BOLD EDITORIAL / THE PUBLISHER"
// Concept: Fixes the "too thin" issue of Variation 3. Substantial, weighty, confident.
// Aesthetic: Cream background, deep forest green/burgundy text, chunky serif fonts.
// Influences: The Atlantic, New York Magazine, Medium (but bolder).

const articles = [
  { category: "Strategy", title: "The End of Shadowbanning", excerpt: "How new algorithmic transparency is changing the game for creators.", author: "System" },
  { category: "Analysis", title: "Why Your Posts Get Removed", excerpt: "It's not a conspiracy. It's a keyword filter. Here is how to beat it.", author: "AI Core" },
  { category: "Case Study", title: "0 to 10k Karma in 3 Days", excerpt: "A breakdown of the perfect launch strategy using Unbannnable.", author: "User #442" },
];

export default function Variation8() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1a2e1a] font-serif selection:bg-[#2c4c2c] selection:text-[#FDFBF7] overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,600;9..144,800&family=Karla:wght@400;500;700&display=swap');
        .font-soft-serif { font-family: 'Fraunces', serif; }
        .font-clean-sans { font-family: 'Karla', sans-serif; }
        .bg-cream { background-color: #FDFBF7; }
        .text-forest { color: #1a2e1a; }
        .bg-forest { background-color: #1a2e1a; }
        .text-accent { color: #D94A4A; } /* Muted Red */
      `}</style>

      {/* Header - Centered Magazine Style */}
      <header className="pt-8 pb-8 px-6 border-b-4 border-[#1a2e1a] sticky top-0 bg-[#FDFBF7]/95 backdrop-blur z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-clean-sans font-bold text-xs uppercase tracking-widest order-2 md:order-1 flex gap-6">
            <a href="#" className="hover:text-accent transition-colors">Features</a>
            <a href="#" className="hover:text-accent transition-colors">Pricing</a>
            <a href="#" className="hover:text-accent transition-colors">Login</a>
          </div>
          <div className="font-soft-serif font-black text-4xl tracking-tight order-1 md:order-2">
            Unbannnable<span className="text-accent">.</span>
          </div>
          <div className="font-clean-sans text-xs font-bold order-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            System Operational
          </div>
        </div>
      </header>

      {/* Hero - The "Cover Story" */}
      <section className="py-20 px-6 max-w-5xl mx-auto text-center">
        <div className="mb-6 font-clean-sans font-bold text-accent uppercase tracking-widest text-sm">
          The Cover Story
        </div>
        <h1 className="font-soft-serif font-black text-6xl md:text-8xl lg:text-9xl leading-[0.9] mb-8 text-[#1a2e1a]">
          Publish Without <br/>
          <span className="italic font-light text-[#2c4c2c]/80">Permission</span>.
        </h1>
        <p className="font-soft-serif text-2xl md:text-3xl text-[#1a2e1a]/70 leading-relaxed max-w-3xl mx-auto mb-12">
          The definitive tool for navigating the complex era of algorithmic moderation. 
          We rewrite your content to ensure it is heard.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button className="h-16 px-12 rounded-full bg-[#1a2e1a] text-[#FDFBF7] hover:bg-[#2c4c2c] font-clean-sans font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
            Start Writing
          </Button>
          <Button variant="outline" className="h-16 px-12 rounded-full border-2 border-[#1a2e1a] text-[#1a2e1a] hover:bg-[#1a2e1a]/5 font-clean-sans font-bold text-lg bg-transparent">
            Read Manifesto
          </Button>
        </div>
      </section>

      {/* Featured Articles Grid */}
      <section className="py-20 px-6 bg-[#EBE8E0] border-y border-[#1a2e1a]/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-12">
            <Star className="w-6 h-6 text-accent fill-accent" />
            <h2 className="font-soft-serif font-bold text-3xl">From the Desk</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {articles.map((article, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="aspect-[4/3] bg-[#dcd9d0] mb-6 relative overflow-hidden rounded-md border border-[#1a2e1a]/10">
                   {/* Abstract Placeholder */}
                   <div className={`absolute inset-0 bg-[#1a2e1a] opacity-5 group-hover:opacity-10 transition-opacity duration-500`}></div>
                   <div className="absolute bottom-4 left-4 bg-[#FDFBF7] px-3 py-1 font-clean-sans text-xs font-bold uppercase tracking-wider text-[#1a2e1a] rounded-full">
                      {article.category}
                   </div>
                </div>
                <h3 className="font-soft-serif font-bold text-3xl mb-3 leading-tight group-hover:underline decoration-2 decoration-accent underline-offset-4 decoration-[#1a2e1a] transition-all">
                  {article.title}
                </h3>
                <p className="font-clean-sans text-lg text-[#1a2e1a]/70 mb-4 leading-relaxed">
                  {article.excerpt}
                </p>
                <div className="flex items-center gap-2 font-clean-sans text-xs font-bold uppercase tracking-widest opacity-50">
                   <span>By {article.author}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* "The Quote" - Big Type */}
      <section className="py-32 px-6 max-w-4xl mx-auto text-center">
        <MessageSquare className="w-12 h-12 mx-auto mb-8 text-[#1a2e1a]/20" />
        <blockquote className="font-soft-serif font-semibold text-4xl md:text-5xl leading-tight mb-8">
          "Unbannnable isn't just a tool; it's a necessity for anyone serious about digital discourse. It turns the chaotic lottery of moderation into a predictable science."
        </blockquote>
        <cite className="font-clean-sans font-bold text-sm uppercase tracking-widest not-italic">
          — The Digital Observer, Spring 2025
        </cite>
      </section>

      {/* Pricing - "The Subscription" */}
      <section className="py-24 px-6 bg-[#1a2e1a] text-[#FDFBF7]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-soft-serif font-black text-5xl md:text-6xl mb-6">
              Subscribe to <br/>
              <span className="text-accent">Certainty</span>.
            </h2>
            <p className="font-clean-sans text-xl opacity-80 leading-relaxed mb-8 max-w-md">
              Join the ranks of elite creators who publish without fear. Select the plan that fits your editorial volume.
            </p>
            <div className="flex gap-8 text-sm font-clean-sans font-bold uppercase tracking-widest opacity-60">
               <span className="flex items-center gap-2"><div className="w-2 h-2 bg-accent rounded-full"></div> Cancel Anytime</span>
               <span className="flex items-center gap-2"><div className="w-2 h-2 bg-accent rounded-full"></div> Secure Billing</span>
            </div>
          </div>

          <div className="space-y-4">
             {/* Plan 1 */}
             <div className="bg-[#FDFBF7] text-[#1a2e1a] p-8 rounded-2xl flex items-center justify-between hover:scale-[1.02] transition-transform duration-300 cursor-pointer">
                <div>
                   <div className="font-clean-sans font-bold text-xs uppercase tracking-widest text-accent mb-1">Standard Edition</div>
                   <div className="font-soft-serif font-bold text-3xl">Monthly Access</div>
                   <div className="font-clean-sans text-sm opacity-60 mt-2">20 Credits • Basic Analysis</div>
                </div>
                <div className="text-right">
                   <div className="font-soft-serif font-black text-4xl">$19</div>
                   <Button size="sm" className="mt-2 rounded-full bg-[#1a2e1a] text-white hover:bg-[#2c4c2c]">Select</Button>
                </div>
             </div>

             {/* Plan 2 */}
             <div className="bg-[#D94A4A] text-white p-8 rounded-2xl flex items-center justify-between shadow-2xl scale-[1.05] relative z-10 cursor-pointer">
                <div>
                   <div className="font-clean-sans font-bold text-xs uppercase tracking-widest text-white/80 mb-1">Pro Edition</div>
                   <div className="font-soft-serif font-bold text-3xl">Unlimited Access</div>
                   <div className="font-clean-sans text-sm opacity-90 mt-2">100 Credits • Deep AI • Priority</div>
                </div>
                <div className="text-right">
                   <div className="font-soft-serif font-black text-4xl">$39</div>
                   <Button size="sm" className="mt-2 rounded-full bg-white text-[#D94A4A] hover:bg-gray-100 font-bold">Select</Button>
                </div>
             </div>
          </div>
        </div>
      </section>

      <footer className="py-12 px-6 text-center font-clean-sans text-sm font-bold opacity-50 uppercase tracking-widest">
         <p>&copy; 2025 Unbannnable Publishing Group.</p>
      </footer>
    </div>
  );
}
