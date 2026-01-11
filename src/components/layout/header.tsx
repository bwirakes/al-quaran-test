"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { type ReactNode } from "react";

interface HeaderProps {
  /** Back link URL */
  backHref?: string;
  /** Left side content (icon + title) */
  children: ReactNode;
  /** Right side content (optional) */
  rightContent?: ReactNode;
  /** Whether to use floating style (default: true) */
  floating?: boolean;
}

export function Header({ 
  backHref, 
  children, 
  rightContent,
  floating = true 
}: HeaderProps) {
  if (floating) {
    return (
      <header className="fixed top-4 left-4 right-4 z-50">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl shadow-sm px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Left: Back button + Content */}
              <div className="flex items-center gap-3">
                {backHref && (
                  <Link href={backHref}>
                    <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/80 border border-stone-200 transition-colors hover:bg-stone-100">
                      <ArrowLeft className="h-4 w-4 text-slate-900" strokeWidth={1.5} />
                    </button>
                  </Link>
                )}
                {children}
              </div>
              
              {/* Right: Optional content */}
              {rightContent && (
                <div className="flex items-center gap-2">
                  {rightContent}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Non-floating sticky header
  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 backdrop-blur-sm">
      <div className="max-w-3xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Back button + Content */}
          <div className="flex items-center gap-3">
            {backHref && (
              <Link href={backHref}>
                <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100 transition-colors hover:bg-stone-200">
                  <ArrowLeft className="h-4 w-4 text-slate-900" strokeWidth={1.5} />
                </button>
              </Link>
            )}
            {children}
          </div>
          
          {/* Right: Optional content */}
          {rightContent && (
            <div className="flex items-center gap-2">
              {rightContent}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

interface HeaderIconProps {
  children: ReactNode;
  className?: string;
}

export function HeaderIcon({ children, className = "" }: HeaderIconProps) {
  return (
    <div className={`w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center ${className}`}>
      {children}
    </div>
  );
}

interface HeaderTitleProps {
  title: string;
  subtitle?: string;
}

export function HeaderTitle({ title, subtitle }: HeaderTitleProps) {
  return (
    <div>
      <h1 className="text-base font-semibold tracking-tight text-slate-900">
        {title}
      </h1>
      {subtitle && (
        <p className="text-xs text-slate-500 -mt-0.5">
          {subtitle}
        </p>
      )}
    </div>
  );
}
