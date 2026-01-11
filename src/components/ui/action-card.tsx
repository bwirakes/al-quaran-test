"use client";

import Link from "next/link";
import { 
  ArrowRight, 
  BookOpen, 
  MessageCircle, 
  Search, 
  Heart, 
  Star,
  Clock,
  Calendar,
  type LucideIcon 
} from "lucide-react";
import { type ReactNode } from "react";

// Icon map for server-to-client serialization
const iconMap: Record<string, LucideIcon> = {
  BookOpen,
  MessageCircle,
  Search,
  Heart,
  Star,
  Clock,
  Calendar,
};

// Theme palette type definition
type ThemePalette = {
  bg: string;
  border: string;
  hoverBorder: string;
  hoverBg: string;
  iconBg: string;
  iconColor: string;
  text: string;
  subtext: string;
  tagBg: string;
  tagText: string;
  arrowDefault: string;
  arrowHover: string;
};

// Islamic theme configuration - Royal Minimalist (Gold & Slate)
const themes: Record<"royal" | "jannah" | "iznik" | "medina" | "noor", ThemePalette> = {
  // Royal Minimalist - Premium Blue & Slate (Default)
  royal: {
    bg: "bg-white",
    border: "border-stone-200",
    hoverBorder: "hover:border-sky-300",
    hoverBg: "hover:bg-sky-50",
    iconBg: "bg-sky-50",
    iconColor: "text-[#496580]",
    text: "text-slate-900",
    subtext: "text-slate-600",
    tagBg: "bg-sky-50",
    tagText: "text-[#496580]",
    arrowDefault: "text-stone-300",
    arrowHover: "group-hover:text-sky-700",
  },
  // Theme A: Jannah (Nature / Quran Reader)
  jannah: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    hoverBorder: "hover:border-emerald-500",
    hoverBg: "hover:bg-emerald-100/50",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-700",
    text: "text-emerald-950",
    subtext: "text-emerald-700",
    tagBg: "bg-emerald-100",
    tagText: "text-emerald-700",
    arrowDefault: "text-emerald-300",
    arrowHover: "group-hover:text-emerald-700",
  },
  // Theme B: Iznik (Art / AI Assistant)
  iznik: {
    bg: "bg-cyan-50",
    border: "border-cyan-200",
    hoverBorder: "hover:border-cyan-500",
    hoverBg: "hover:bg-cyan-100/50",
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-700",
    text: "text-cyan-950",
    subtext: "text-cyan-700",
    tagBg: "bg-cyan-100",
    tagText: "text-cyan-700",
    arrowDefault: "text-cyan-300",
    arrowHover: "group-hover:text-cyan-700",
  },
  // Theme C: Medina (Earth / Tafsir & History)
  medina: {
    bg: "bg-stone-50",
    border: "border-stone-200",
    hoverBorder: "hover:border-stone-400",
    hoverBg: "hover:bg-stone-100/50",
    iconBg: "bg-stone-200",
    iconColor: "text-stone-600",
    text: "text-stone-900",
    subtext: "text-stone-600",
    tagBg: "bg-stone-200",
    tagText: "text-stone-600",
    arrowDefault: "text-stone-300",
    arrowHover: "group-hover:text-stone-600",
  },
  // Theme D: Noor (Night / Dark Mode)
  noor: {
    bg: "bg-slate-950",
    border: "border-slate-800",
    hoverBorder: "hover:border-amber-400",
    hoverBg: "hover:bg-slate-900",
    iconBg: "bg-slate-900",
    iconColor: "text-amber-400",
    text: "text-slate-50",
    subtext: "text-slate-400",
    tagBg: "bg-slate-800",
    tagText: "text-amber-400",
    arrowDefault: "text-slate-600",
    arrowHover: "group-hover:text-amber-400",
  },
};

export type ActionCardVariant = keyof typeof themes;

interface ActionCardProps {
  /** The visual theme variant */
  variant: ActionCardVariant;
  /** The URL to navigate to */
  href: string;
  /** The icon name (string) for server component compatibility */
  icon: keyof typeof iconMap;
  /** The main title */
  title: string;
  /** The description text */
  description: string;
  /** Optional tags/badges to display */
  tags?: string[];
  /** Optional call-to-action text */
  cta?: string;
  /** Additional className for the outer wrapper */
  className?: string;
  /** Optional children to render at the bottom */
  children?: ReactNode;
}

export function ActionCard({
  variant,
  href,
  icon,
  title,
  description,
  tags = [],
  cta,
  className = "",
  children,
}: ActionCardProps) {
  const theme = themes[variant];
  const Icon = iconMap[icon];

  return (
    <Link href={href} className={`block group ${className}`}>
      <div
        className={`
          h-full p-6 rounded-xl border transition-colors duration-200
          ${theme.bg} ${theme.border} ${theme.hoverBorder} ${theme.hoverBg}
        `}
      >
        {/* Icon Badge */}
        <div
          className={`w-10 h-10 rounded-md flex items-center justify-center mb-5 ${theme.iconBg}`}
        >
          <Icon className={`w-5 h-5 ${theme.iconColor}`} strokeWidth={1.5} />
        </div>

        {/* Content */}
        <h2 className={`text-lg font-semibold tracking-tight mb-2 ${theme.text}`}>
          {title}
        </h2>
        <p className={`text-sm mb-5 leading-relaxed ${theme.subtext}`}>
          {description}
        </p>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {tags.map((tag) => (
              <span
                key={tag}
                className={`px-2.5 py-1 text-xs font-medium rounded-md ${theme.tagBg} ${theme.tagText}`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Optional children */}
        {children}

        {/* CTA with arrow */}
        {cta && (
          <div
            className={`flex items-center gap-1 text-sm transition-colors ${theme.arrowDefault} ${theme.arrowHover}`}
          >
            <span>{cta}</span>
            <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </div>
        )}
      </div>
    </Link>
  );
}

// Export themes for external use if needed
export { themes as actionCardThemes };
