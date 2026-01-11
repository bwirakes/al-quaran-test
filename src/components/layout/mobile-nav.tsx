"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Menu, 
  X, 
  Home, 
  BookOpen, 
  Search, 
  MessageCircle,
  ChevronRight
} from "lucide-react";

const navItems = [
  { href: "/", label: "Beranda", icon: Home, description: "Halaman utama" },
  { href: "/quran", label: "Daftar Surah", icon: BookOpen, description: "114 Surah Al-Quran" },
  { href: "/quran/search", label: "Cari Ayat", icon: Search, description: "Temukan ayat Al-Quran" },
  { href: "/chat", label: "Asisten AI", icon: MessageCircle, description: "Tanya jawab Islam" },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Check if current path matches nav item
  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex md:hidden h-9 w-9 items-center justify-center rounded-lg bg-stone-100 transition-colors hover:bg-stone-200"
        aria-label={isOpen ? "Tutup menu" : "Buka menu"}
        aria-expanded={isOpen}
      >
        <div className="relative w-4 h-4">
          <span
            className={`absolute left-0 w-4 h-0.5 bg-slate-900 transition-all duration-300 ease-out ${
              isOpen ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0.5"
            }`}
          />
          <span
            className={`absolute left-0 top-1/2 -translate-y-1/2 w-4 h-0.5 bg-slate-900 transition-all duration-300 ease-out ${
              isOpen ? "opacity-0 scale-x-0" : "opacity-100 scale-x-100"
            }`}
          />
          <span
            className={`absolute left-0 w-4 h-0.5 bg-slate-900 transition-all duration-300 ease-out ${
              isOpen ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-0.5"
            }`}
          />
        </div>
      </button>

      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Slide-out Menu */}
      <nav
        className={`fixed top-0 right-0 z-[70] h-full w-[85%] max-w-sm bg-white shadow-2xl transition-transform duration-300 ease-out md:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Mobile navigation"
      >
        {/* Menu Header */}
        <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-9 h-9 border border-sky-200 rounded-lg flex items-center justify-center bg-sky-50"
            >
              <span className="font-bold text-sm" style={{ color: '#496580' }}>ق</span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Al-Quran Digital</p>
              <p 
                className="text-xs" 
                lang="ar" 
                dir="rtl"
                style={{ fontFamily: '"Scheherazade New", serif', color: '#496580' }}
              >
                القرآن الكريم
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100 transition-colors hover:bg-stone-200"
            aria-label="Tutup menu"
          >
            <X className="h-4 w-4 text-slate-900" strokeWidth={1.5} />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="px-3 py-4">
          <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-widest text-stone-400">
            Menu
          </p>
          <ul className="space-y-1">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <li 
                  key={item.href}
                  style={{ 
                    animationDelay: `${index * 50}ms`,
                  }}
                  className={`transform transition-all duration-300 ${
                    isOpen ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
                  }`}
                >
                  <Link
                    href={item.href}
                    className={`flex items-center justify-between gap-3 rounded-xl px-3 py-3.5 transition-all ${
                      active
                        ? "bg-sky-50 border border-sky-200"
                        : "hover:bg-stone-50 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          active 
                            ? "bg-white border border-sky-200" 
                            : "bg-stone-100"
                        }`}
                      >
                        <Icon 
                          className="h-5 w-5 transition-colors" 
                          style={{ color: active ? '#496580' : '#64748b' }}
                          strokeWidth={1.5} 
                        />
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${
                          active ? "text-slate-900" : "text-slate-700"
                        }`}>
                          {item.label}
                        </p>
                        <p className="text-xs text-slate-400">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight 
                      className={`h-4 w-4 transition-colors ${
                        active ? "text-sky-600" : "text-stone-300"
                      }`} 
                      strokeWidth={1.5} 
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Popular Surahs Quick Access */}
        <div className="px-3 py-4 border-t border-stone-100">
          <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-widest text-stone-400">
            Surah Populer
          </p>
          <div className="flex flex-wrap gap-2 px-2">
            {[
              { id: 1, name: "Al-Fatihah" },
              { id: 36, name: "Yasin" },
              { id: 67, name: "Al-Mulk" },
              { id: 55, name: "Ar-Rahman" },
            ].map((surah) => (
              <Link
                key={surah.id}
                href={`/quran/${surah.id}`}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 border border-stone-200 rounded-lg hover:border-sky-300 hover:text-sky-700 hover:bg-sky-50 transition-colors"
              >
                {surah.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-stone-100 bg-stone-50/50 px-5 py-4">
          <p className="text-center text-xs text-slate-400">
            Baca Al-Quran kapan saja, di mana saja
          </p>
        </div>
      </nav>
    </>
  );
}
