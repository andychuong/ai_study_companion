"use client";

export function AuthBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-gray-50 via-gray-100 to-slate-50">
      {/* Mathematical formulas and school elements */}
      <div className="absolute inset-0 opacity-[0.45]">
        {/* Top section */}
        <div className="absolute top-8 left-16 text-3xl font-bold text-[#2563EB] rotate-12">E=mc²</div>
        <div className="absolute top-24 left-8 text-2xl text-[#2563EB] -rotate-6">∫ f(x)dx</div>
        <div className="absolute top-16 left-48 text-3xl text-[#2563EB]">π = 3.14</div>
        <div className="absolute top-12 right-28 text-3xl font-serif text-[#2563EB] rotate-6">H₂O</div>
        <div className="absolute top-32 right-16 text-4xl text-[#2563EB] -rotate-12">a² + b² = c²</div>
        <div className="absolute top-8 right-52 text-2xl text-[#2563EB] rotate-3">DNA</div>
        <div className="absolute top-20 left-[35%] text-2xl text-[#2563EB] -rotate-8">cos θ</div>
        <div className="absolute top-36 right-[45%] text-3xl text-[#2563EB] rotate-15">α β γ</div>
        <div className="absolute top-12 left-[60%] text-2xl text-[#2563EB]">e^(iπ)</div>
        
        {/* Upper-middle section */}
        <div className="absolute top-[28%] left-8 text-3xl text-[#2563EB] -rotate-6">√x</div>
        <div className="absolute top-[32%] left-28 text-2xl text-[#2563EB] rotate-8">dy/dx</div>
        <div className="absolute top-[25%] left-[18%] text-2xl text-[#2563EB]">∂/∂t</div>
        <div className="absolute top-[30%] left-[42%] text-3xl text-[#2563EB] rotate-45">∂</div>
        <div className="absolute top-[28%] right-20 text-3xl text-[#2563EB] rotate-6">CO₂</div>
        <div className="absolute top-[35%] right-[35%] text-2xl text-[#2563EB] -rotate-12">∫∫</div>
        <div className="absolute top-[22%] right-[55%] text-3xl text-[#2563EB] rotate-5">ω</div>
        
        {/* Middle section */}
        <div className="absolute top-[48%] left-12 text-4xl font-bold text-[#2563EB] rotate-12">F=ma</div>
        <div className="absolute top-[52%] left-[22%] text-2xl text-[#2563EB]">lim(x→∞)</div>
        <div className="absolute top-[45%] left-[38%] text-2xl text-[#2563EB] -rotate-10">∇·F</div>
        <div className="absolute top-[50%] right-20 text-4xl font-serif text-[#2563EB] -rotate-12">Δ</div>
        <div className="absolute top-[48%] right-[32%] text-3xl text-[#2563EB] rotate-6">∇</div>
        <div className="absolute top-[55%] right-[52%] text-2xl text-[#2563EB]">x² + y²</div>
        <div className="absolute top-[42%] left-[65%] text-3xl text-[#2563EB] rotate-18">φ</div>
        
        {/* Lower-middle section */}
        <div className="absolute top-[62%] left-14 text-2xl text-[#2563EB] rotate-3">sin θ</div>
        <div className="absolute top-[68%] left-[25%] text-3xl text-[#2563EB] -rotate-15">ℏ</div>
        <div className="absolute top-[65%] left-[48%] text-2xl text-[#2563EB] rotate-8">∑ᵢ</div>
        <div className="absolute top-[70%] right-24 text-3xl text-[#2563EB] rotate-12">Σ</div>
        <div className="absolute top-[62%] right-[40%] text-2xl text-[#2563EB] -rotate-5">∏</div>
        <div className="absolute top-[68%] right-[15%] text-2xl text-[#2563EB] rotate-10">tan α</div>
        
        {/* Bottom section */}
        <div className="absolute bottom-24 left-20 text-4xl text-[#2563EB] rotate-12">λ = c/f</div>
        <div className="absolute bottom-16 left-40 text-3xl font-bold text-[#2563EB] -rotate-6">PV=nRT</div>
        <div className="absolute bottom-32 left-8 text-2xl text-[#2563EB]">Σ</div>
        <div className="absolute bottom-20 right-28 text-3xl text-[#2563EB] -rotate-12">d/dx</div>
        <div className="absolute bottom-28 right-16 text-4xl font-serif text-[#2563EB] rotate-6">CH₄</div>
        <div className="absolute bottom-12 right-40 text-2xl text-[#2563EB] -rotate-3">∞</div>
        <div className="absolute bottom-24 left-[35%] text-2xl text-[#2563EB] rotate-15">θ</div>
        <div className="absolute bottom-16 left-[55%] text-3xl text-[#2563EB]">ε₀</div>
        <div className="absolute bottom-20 right-[45%] text-2xl text-[#2563EB] -rotate-8">μ</div>
        <div className="absolute bottom-32 right-[65%] text-3xl text-[#2563EB] rotate-5">σ</div>
      </div>
      
      {/* Geometric shapes and school items */}
      <div className="absolute inset-0 opacity-[0.25]">
        {/* Circles */}
        <div className="absolute top-16 left-[12%] w-32 h-32 border-3 border-[#2563EB] rounded-full"></div>
        <div className="absolute top-[18%] left-[70%] w-40 h-40 border-3 border-[#2563EB] rounded-full"></div>
        <div className="absolute bottom-28 right-[18%] w-48 h-48 border-3 border-[#2563EB] rounded-full"></div>
        <div className="absolute top-[38%] right-[8%] w-28 h-28 border-3 border-[#2563EB] rounded-full"></div>
        
        {/* Triangles */}
        <svg className="absolute top-[58%] left-[22%] w-32 h-32" viewBox="0 0 100 100">
          <polygon points="50,10 90,90 10,90" fill="none" stroke="#2563EB" strokeWidth="2"/>
        </svg>
        <svg className="absolute top-[22%] right-[32%] w-28 h-28" viewBox="0 0 100 100">
          <polygon points="50,10 90,90 10,90" fill="none" stroke="#2563EB" strokeWidth="2"/>
        </svg>
        
        {/* Squares */}
        <div className="absolute bottom-[42%] left-[32%] w-32 h-32 border-3 border-[#2563EB] rotate-45"></div>
        <div className="absolute top-[12%] left-[52%] w-24 h-24 border-3 border-[#2563EB] rotate-12"></div>
        
        {/* Pencil */}
        <svg className="absolute top-[15%] left-[25%] w-8 h-32 rotate-45" viewBox="0 0 24 96" fill="#2563EB">
          <rect x="8" y="0" width="8" height="70" />
          <polygon points="8,70 16,70 12,80" />
          <rect x="6" y="80" width="12" height="4" fill="#2563EB" opacity="0.6"/>
        </svg>
        <svg className="absolute bottom-[30%] right-[15%] w-8 h-32 -rotate-30" viewBox="0 0 24 96" fill="#2563EB">
          <rect x="8" y="0" width="8" height="70" />
          <polygon points="8,70 16,70 12,80" />
          <rect x="6" y="80" width="12" height="4" fill="#2563EB" opacity="0.6"/>
        </svg>
        
        {/* Test Tube */}
        <svg className="absolute top-[42%] left-[15%] w-12 h-36 rotate-12" viewBox="0 0 40 120" fill="none" stroke="#2563EB" strokeWidth="3">
          <rect x="12" y="5" width="16" height="90" rx="2"/>
          <path d="M 12 95 Q 20 110 28 95" fill="#2563EB" opacity="0.3"/>
          <line x1="10" y1="8" x2="30" y2="8" strokeWidth="2"/>
        </svg>
        <svg className="absolute bottom-[35%] right-[65%] w-12 h-36 -rotate-15" viewBox="0 0 40 120" fill="none" stroke="#2563EB" strokeWidth="3">
          <rect x="12" y="5" width="16" height="90" rx="2"/>
          <path d="M 12 95 Q 20 110 28 95" fill="#2563EB" opacity="0.3"/>
          <line x1="10" y1="8" x2="30" y2="8" strokeWidth="2"/>
        </svg>
        
        {/* Calculator */}
        <svg className="absolute top-[35%] right-[22%] w-24 h-32" viewBox="0 0 80 100" fill="none">
          <rect x="5" y="5" width="70" height="90" rx="4" stroke="#2563EB" strokeWidth="3" fill="#2563EB" opacity="0.1"/>
          <rect x="12" y="12" width="56" height="20" fill="#2563EB" opacity="0.3"/>
          <circle cx="25" cy="50" r="6" fill="#2563EB"/>
          <circle cx="40" cy="50" r="6" fill="#2563EB"/>
          <circle cx="55" cy="50" r="6" fill="#2563EB"/>
          <circle cx="25" cy="68" r="6" fill="#2563EB"/>
          <circle cx="40" cy="68" r="6" fill="#2563EB"/>
          <circle cx="55" cy="68" r="6" fill="#2563EB"/>
          <circle cx="25" cy="86" r="6" fill="#2563EB"/>
          <circle cx="40" cy="86" r="6" fill="#2563EB"/>
          <circle cx="55" cy="86" r="6" fill="#2563EB"/>
        </svg>
        <svg className="absolute bottom-[18%] left-[58%] w-24 h-32 rotate-15" viewBox="0 0 80 100" fill="none">
          <rect x="5" y="5" width="70" height="90" rx="4" stroke="#2563EB" strokeWidth="3" fill="#2563EB" opacity="0.1"/>
          <rect x="12" y="12" width="56" height="20" fill="#2563EB" opacity="0.3"/>
          <circle cx="25" cy="50" r="6" fill="#2563EB"/>
          <circle cx="40" cy="50" r="6" fill="#2563EB"/>
          <circle cx="55" cy="50" r="6" fill="#2563EB"/>
          <circle cx="25" cy="68" r="6" fill="#2563EB"/>
          <circle cx="40" cy="68" r="6" fill="#2563EB"/>
          <circle cx="55" cy="68" r="6" fill="#2563EB"/>
        </svg>
        
        {/* Beaker */}
        <svg className="absolute top-[50%] left-[72%] w-20 h-28" viewBox="0 0 60 84" fill="none" stroke="#2563EB" strokeWidth="2.5">
          <path d="M 15 10 L 15 40 L 10 70 Q 10 75 15 78 L 45 78 Q 50 75 50 70 L 45 40 L 45 10 Z"/>
          <line x1="10" y1="10" x2="50" y2="10" strokeWidth="3"/>
          <path d="M 12 60 L 48 60" stroke="#2563EB" opacity="0.4" strokeWidth="2"/>
          <ellipse cx="30" cy="60" rx="18" ry="3" fill="#2563EB" opacity="0.2"/>
        </svg>
        <svg className="absolute bottom-[45%] left-[45%] w-20 h-28 -rotate-10" viewBox="0 0 60 84" fill="none" stroke="#2563EB" strokeWidth="2.5">
          <path d="M 15 10 L 15 40 L 10 70 Q 10 75 15 78 L 45 78 Q 50 75 50 70 L 45 40 L 45 10 Z"/>
          <line x1="10" y1="10" x2="50" y2="10" strokeWidth="3"/>
          <path d="M 12 60 L 48 60" stroke="#2563EB" opacity="0.4" strokeWidth="2"/>
          <ellipse cx="30" cy="60" rx="18" ry="3" fill="#2563EB" opacity="0.2"/>
        </svg>
        
        {/* Book */}
        <svg className="absolute top-[68%] right-[28%] w-28 h-20 rotate-[-8deg]" viewBox="0 0 100 70" fill="none">
          <rect x="10" y="10" width="80" height="50" fill="#2563EB" opacity="0.2" stroke="#2563EB" strokeWidth="2.5"/>
          <line x1="50" y1="10" x2="50" y2="60" stroke="#2563EB" strokeWidth="2"/>
          <path d="M 10 10 Q 50 5 90 10" stroke="#2563EB" strokeWidth="2" fill="none"/>
        </svg>
        <svg className="absolute top-[25%] left-[5%] w-28 h-20 rotate-12" viewBox="0 0 100 70" fill="none">
          <rect x="10" y="10" width="80" height="50" fill="#2563EB" opacity="0.2" stroke="#2563EB" strokeWidth="2.5"/>
          <line x1="50" y1="10" x2="50" y2="60" stroke="#2563EB" strokeWidth="2"/>
          <path d="M 10 10 Q 50 5 90 10" stroke="#2563EB" strokeWidth="2" fill="none"/>
        </svg>
        
        {/* Ruler */}
        <svg className="absolute bottom-[55%] right-[8%] w-32 h-8 rotate-45" viewBox="0 0 120 30" fill="#2563EB" opacity="0.8">
          <rect x="5" y="8" width="110" height="14" stroke="#2563EB" strokeWidth="2"/>
          <line x1="20" y1="8" x2="20" y2="15" stroke="#2563EB" strokeWidth="1.5"/>
          <line x1="35" y1="8" x2="35" y2="15" stroke="#2563EB" strokeWidth="1.5"/>
          <line x1="50" y1="8" x2="50" y2="18" stroke="#2563EB" strokeWidth="2"/>
          <line x1="65" y1="8" x2="65" y2="15" stroke="#2563EB" strokeWidth="1.5"/>
          <line x1="80" y1="8" x2="80" y2="15" stroke="#2563EB" strokeWidth="1.5"/>
          <line x1="95" y1="8" x2="95" y2="18" stroke="#2563EB" strokeWidth="2"/>
        </svg>
        
        {/* Atom */}
        <svg className="absolute top-[52%] right-[48%] w-24 h-24" viewBox="0 0 100 100" fill="none" stroke="#2563EB">
          <circle cx="50" cy="50" r="6" fill="#2563EB"/>
          <ellipse cx="50" cy="50" rx="35" ry="12" strokeWidth="2" transform="rotate(0 50 50)"/>
          <ellipse cx="50" cy="50" rx="35" ry="12" strokeWidth="2" transform="rotate(60 50 50)"/>
          <ellipse cx="50" cy="50" rx="35" ry="12" strokeWidth="2" transform="rotate(120 50 50)"/>
          <circle cx="80" cy="50" r="4" fill="#2563EB"/>
          <circle cx="35" cy="65" r="4" fill="#2563EB"/>
          <circle cx="35" cy="35" r="4" fill="#2563EB"/>
        </svg>
        
        {/* Microscope */}
        <svg className="absolute bottom-[58%] left-[88%] w-20 h-32" viewBox="0 0 60 96" fill="none" stroke="#2563EB" strokeWidth="2.5">
          <ellipse cx="30" cy="88" rx="25" ry="4" fill="#2563EB" opacity="0.3"/>
          <rect x="25" y="75" width="10" height="13"/>
          <circle cx="30" cy="60" r="12"/>
          <rect x="26" y="35" width="8" height="28"/>
          <rect x="20" y="28" width="20" height="10" rx="2"/>
          <path d="M 28 28 L 28 15 L 35 8" strokeWidth="2.5"/>
          <circle cx="35" cy="8" r="5" fill="#2563EB" opacity="0.4"/>
        </svg>
        
        {/* Light Bulb (idea) */}
        <svg className="absolute top-[8%] right-[8%] w-16 h-24" viewBox="0 0 50 75" fill="none" stroke="#2563EB" strokeWidth="2">
          <path d="M 25 10 Q 15 10 12 20 Q 10 30 15 38 L 20 50 L 30 50 L 35 38 Q 40 30 38 20 Q 35 10 25 10 Z" fill="#2563EB" opacity="0.1"/>
          <rect x="20" y="50" width="10" height="8" fill="#2563EB" opacity="0.3"/>
          <rect x="22" y="58" width="6" height="4" rx="1" fill="#2563EB"/>
          <line x1="18" y1="25" x2="14" y2="25" strokeWidth="2"/>
          <line x1="32" y1="25" x2="36" y2="25" strokeWidth="2"/>
          <line x1="20" y1="15" x2="17" y2="12" strokeWidth="2"/>
          <line x1="30" y1="15" x2="33" y2="12" strokeWidth="2"/>
        </svg>
        
        {/* Compass (drawing tool) */}
        <svg className="absolute bottom-[8%] right-[52%] w-16 h-28 rotate-20" viewBox="0 0 48 84" fill="none" stroke="#2563EB" strokeWidth="2.5">
          <line x1="24" y1="8" x2="14" y2="76"/>
          <line x1="24" y1="8" x2="34" y2="76"/>
          <circle cx="24" cy="8" r="4" fill="#2563EB"/>
          <circle cx="14" cy="76" r="3" fill="#2563EB"/>
          <circle cx="34" cy="76" r="3" fill="#2563EB"/>
        </svg>
      </div>
    </div>
  );
}

