"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Globe, ShieldCheck, PenTool, Zap, CheckCircle2 } from "lucide-react";
import { useRef } from "react";

// VARIATION 6: "THE HEAVY EDIT"
// Concept: Editorial layout but with substantial weight. "Ink on paper" feel.
// Aesthetic: Warm paper background, deep black ink, heavy serif typography.
// Influences: The New York Times Magazine, Monocle, print journalism.

export default function Variation6() {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: targetRef });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <div ref={targetRef} className="min-h-screen bg-[#F2F0E9] text-[#1A1A1A] font-serif selection:bg-[#1A1A1A] selection:text-[#F2F0E9] overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');
        .font-heavy-serif { font-family: 'DM Serif Display', serif; }
        .font-sans-body { font-family: 'Instrument Sans', sans-serif; }
        .border-ink { border-color: #1A1A1A; }
        .bg-ink { background-color: #1A1A1A; }
        .text-paper { color: #F2F0E9; }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b-2 border-ink bg-[#F2F0E9] px-6 py-5 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-ink rounded-full"></div>
          <span className="font-heavy-serif text-xl tracking-tight">Unbannnable.</span>
        </div>
        <div className="hidden md:flex gap-8 font-sans-body font-medium text-sm tracking-wide uppercase">
          <a href="#" className="hover:underline decoration-2 underline-offset-4 decoration-ink">Manifesto</a>
          <a href="#" className="hover:underline decoration-2 underline-offset-4 decoration-ink">Features</a>
          <a href="#" className="hover:underline decoration-2 underline-offset-4 decoration-ink">Pricing</a>
        </div>
        <Button className="rounded-none bg-ink text-paper hover:bg-ink/90 font-sans-body font-bold text-xs uppercase tracking-widest px-8 py-6 border border-ink shadow-[4px_4px_0px_0px_#1A1A1A] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
          Get Access
        </Button>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 border-b-2 border-ink relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 relative z-10">
            <div className="inline-block border-b-2 border-ink pb-1 mb-8 font-sans-body font-bold text-sm uppercase tracking-widest">
              Vol. 1 — The Art of Evasion
            </div>
            <h1 className="font-heavy-serif text-6xl md:text-8xl lg:text-[7rem] leading-[0.9] mb-8 tracking-tight">
              Post with <br />
              <span className="italic relative">
                Impunity
                <span className="absolute -bottom-2 left-0 w-full h-4 bg-[#FF4D00]/20 -z-10 skew-x-12"></span>
              </span>.
            </h1>
            <p className="font-sans-body text-xl md:text-2xl font-medium leading-relaxed max-w-2xl mb-12 border-l-4 border-[#FF4D00] pl-6 text-black/80">
              An algorithmic shield for your Reddit content. We rewrite, scan, and optimize your posts to bypass automated moderation filters with precision.
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <Button size="lg" className="h-16 px-10 rounded-none bg-[#FF4D00] text-white hover:bg-[#E04400] font-sans-body font-bold text-lg uppercase tracking-wide border-2 border-ink shadow-[6px_6px_0px_0px_#1A1A1A] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#1A1A1A] transition-all">
                Start Analysis <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button variant="outline" size="lg" className="h-16 px-10 rounded-none border-2 border-ink bg-transparent text-ink hover:bg-ink hover:text-paper font-sans-body font-bold text-lg uppercase tracking-wide transition-all">
                View Case Study
              </Button>
            </div>
          </div>
          
          <div className="lg:col-span-5 relative">
            <div className="aspect-[4/5] bg-ink relative overflow-hidden border-2 border-ink">
              <motion.div style={{ scale }} className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center grayscale mix-blend-overlay opacity-60"></motion.div>
              <div className="absolute inset-0 flex flex-col justify-between p-8 text-paper">
                <div className="w-12 h-12 border-2 border-paper rounded-full flex items-center justify-center font-heavy-serif text-2xl italic">U</div>
                <div>
                  <div className="font-sans-body text-xs uppercase tracking-widest mb-2 border-b border-paper/30 pb-2">Status: Protected</div>
                  <div className="font-heavy-serif text-4xl leading-tight">
                    "Finally, a tool that understands the nuance of community guidelines."
                  </div>
                </div>
              </div>
            </div>
            {/* Decorative element */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[repeating-linear-gradient(45deg,#1A1A1A,#1A1A1A_2px,transparent_2px,transparent_8px)] border-2 border-ink z-[-1]"></div>
          </div>
        </div>
      </section>

      {/* Marquee Divider */}
      <div className="border-b-2 border-ink bg-ink text-paper py-4 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap font-sans-body font-bold text-lg uppercase tracking-widest">
          {[...Array(6)].map((_, i) => (
            <span key={i} className="mx-8 flex items-center gap-4">
              <span className="w-2 h-2 bg-[#FF4D00] rounded-full"></span> No More Shadowbans
              <span className="w-2 h-2 bg-[#FF4D00] rounded-full"></span> 100% Uptime
            </span>
          ))}
        </div>
        <style>{`
          .animate-marquee { animation: marquee 25s linear infinite; }
          @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        `}</style>
      </div>

      {/* Features Grid */}
      <section className="grid md:grid-cols-3 border-b-2 border-ink">
        {[
          { title: "Linguistic Camouflage", icon: PenTool, desc: "Our AI rewrites your content to match the specific dialect and tone of any subreddit, making it indistinguishable from native posts." },
          { title: "Automated Pre-Screening", icon: ShieldCheck, desc: "Run your post against thousands of known automod triggers and shadowban filters before you hit submit." },
          { title: "Global Discovery Engine", icon: Globe, desc: "Identify high-traffic, low-moderation communities where your content is most likely to survive and thrive." },
        ].map((f, i) => (
          <div key={i} className="group p-12 border-r-2 border-ink last:border-r-0 hover:bg-[#EBE8DE] transition-colors relative overflow-hidden">
            <div className="mb-8 flex justify-between items-start">
              <div className="w-14 h-14 bg-ink text-paper flex items-center justify-center rounded-none shadow-[4px_4px_0px_0px_#FF4D00]">
                <f.icon className="w-6 h-6" />
              </div>
              <span className="font-heavy-serif text-5xl opacity-10 group-hover:opacity-100 transition-opacity duration-500">0{i + 1}</span>
            </div>
            <h3 className="font-heavy-serif text-3xl mb-4 group-hover:translate-x-2 transition-transform duration-300">{f.title}</h3>
            <p className="font-sans-body text-lg leading-relaxed text-black/70 border-t-2 border-black/10 pt-4 group-hover:border-black transition-colors">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Large Typography Section */}
      <section className="py-32 px-6 bg-ink text-paper relative overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <Zap className="w-16 h-16 mx-auto mb-8 text-[#FF4D00] stroke-[1.5]" />
          <h2 className="font-heavy-serif text-5xl md:text-7xl lg:text-8xl leading-none mb-12">
            "The most essential<br/>
            tool for the modern<br/>
            <span className="text-[#FF4D00] italic">digital strategist</span>."
          </h2>
          <div className="inline-block border border-paper/30 px-6 py-3 rounded-full font-sans-body text-sm uppercase tracking-widest">
            — Wired Magazine, 2025
          </div>
        </div>
        
        {/* Abstract Background */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <div className="absolute top-1/2 left-1/4 w-96 h-96 border-[40px] border-paper rounded-full mix-blend-overlay"></div>
           <div className="absolute bottom-[-100px] right-[-100px] w-[600px] h-[600px] bg-[#FF4D00] rounded-full blur-[150px]"></div>
        </div>
      </section>

      {/* Pricing - "The Menu" */}
      <section className="py-24 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-heavy-serif text-5xl mb-4">Membership Plans</h2>
          <p className="font-sans-body text-xl opacity-60">Choose your level of protection.</p>
        </div>

        <div className="border-2 border-ink bg-white shadow-[8px_8px_0px_0px_#1A1A1A]">
          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x-2 divide-ink">
            <div className="p-12 flex flex-col hover:bg-[#F9F9F9] transition-colors">
              <div className="mb-auto">
                <div className="flex justify-between items-baseline mb-2">
                  <h3 className="font-heavy-serif text-3xl">Standard</h3>
                  <span className="font-sans-body font-bold text-2xl">$19<span className="text-sm font-normal text-gray-500">/mo</span></span>
                </div>
                <p className="font-sans-body text-sm text-gray-600 mb-8 leading-relaxed">Essential tools for the casual poster. Includes basic rule scanning and rewrite credits.</p>
                <ul className="space-y-4 font-sans-body text-sm font-medium">
                  <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-ink" /> 20 Monthly Credits</li>
                  <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-ink" /> Basic Rule Engine</li>
                  <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-ink" /> Email Support</li>
                </ul>
              </div>
              <Button className="mt-10 w-full rounded-none bg-transparent border-2 border-ink text-ink hover:bg-ink hover:text-paper font-bold uppercase tracking-widest py-6 transition-all">
                Select Standard
              </Button>
            </div>

            <div className="p-12 flex flex-col bg-[#FF4D00]/5 relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-[#FF4D00] text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1">Best Value</div>
              <div className="mb-auto">
                <div className="flex justify-between items-baseline mb-2">
                  <h3 className="font-heavy-serif text-3xl">Professional</h3>
                  <span className="font-sans-body font-bold text-2xl">$39<span className="text-sm font-normal text-gray-500">/mo</span></span>
                </div>
                <p className="font-sans-body text-sm text-gray-600 mb-8 leading-relaxed">Advanced algorithmic evasion for serious growth. Unlocked velocity limits.</p>
                <ul className="space-y-4 font-sans-body text-sm font-medium">
                  <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-[#FF4D00]" /> 100 Monthly Credits</li>
                  <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-[#FF4D00]" /> Deep Linguistic AI</li>
                  <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-[#FF4D00]" /> Shadowban Evasion</li>
                  <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-[#FF4D00]" /> Priority Support</li>
                </ul>
              </div>
              <Button className="mt-10 w-full rounded-none bg-ink border-2 border-ink text-paper hover:bg-ink/80 font-bold uppercase tracking-widest py-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] transition-all">
                Go Professional
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t-2 border-ink bg-ink text-paper py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <h4 className="font-heavy-serif text-2xl mb-2">Unbannnable.</h4>
            <p className="font-sans-body text-sm opacity-50">Algorithmic Content Assurance.</p>
          </div>
          <div className="flex gap-8 font-sans-body text-xs uppercase tracking-widest font-bold">
            <a href="#" className="hover:text-[#FF4D00] transition-colors">Twitter</a>
            <a href="#" className="hover:text-[#FF4D00] transition-colors">Instagram</a>
            <a href="#" className="hover:text-[#FF4D00] transition-colors">Legal</a>
          </div>
          <div className="font-sans-body text-xs opacity-30">
            © 2025 All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
