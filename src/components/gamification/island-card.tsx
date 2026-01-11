"use client";

/**
 * Island Card Component
 * 
 * Displays a thematic island in the journey map with
 * progress indicator and node count.
 */

import Link from "next/link";
import {
  Compass,
  BookOpen,
  Scale,
  Sunrise,
  Heart,
  Users,
  Shield,
  Globe,
  MessageCircle,
  Star,
  Lock,
  CheckCircle2,
} from "lucide-react";

interface IslandCardProps {
  id: number;
  nameId: string;
  nameAr?: string;
  description?: string;
  theme: string;
  icon: string;
  color: string;
  nodeCount: number;
  completedNodes: number;
  isUnlocked: boolean;
  orderIndex: number;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  compass: Compass,
  "book-open": BookOpen,
  scale: Scale,
  sunrise: Sunrise,
  heart: Heart,
  users: Users,
  shield: Shield,
  globe: Globe,
  "message-circle": MessageCircle,
  star: Star,
};

export function IslandCard({
  id,
  nameId,
  nameAr,
  description,
  icon,
  color,
  nodeCount,
  completedNodes,
  isUnlocked,
  orderIndex,
}: IslandCardProps) {
  const IconComponent = iconMap[icon] || Compass;
  const progress = nodeCount > 0 ? (completedNodes / nodeCount) * 100 : 0;
  const isCompleted = completedNodes >= nodeCount && nodeCount > 0;

  return (
    <Link
      href={isUnlocked ? `/safar/${id}` : "#"}
      className={`
        relative block rounded-xl p-5 transition-all duration-200 border
        ${isUnlocked 
          ? "bg-white hover:shadow-md hover:border-sky-300 hover:bg-sky-50 cursor-pointer border-stone-200" 
          : "bg-slate-50 cursor-not-allowed opacity-60 border-slate-200"
        }
      `}
      onClick={(e) => !isUnlocked && e.preventDefault()}
    >
      {/* Order badge */}
      <div 
        className="absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md"
        style={{ backgroundColor: isUnlocked ? '#496580' : "#94a3b8" }}
      >
        {orderIndex}
      </div>

      {/* Lock/Complete indicator */}
      {!isUnlocked && (
        <div className="absolute top-3 right-3">
          <Lock className="w-5 h-5 text-slate-400" />
        </div>
      )}
      {isCompleted && (
        <div className="absolute top-3 right-3">
          <CheckCircle2 className="w-6 h-6" style={{ color: '#496580' }} />
        </div>
      )}

      {/* Icon */}
      <div 
        className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 bg-sky-50 border border-sky-200"
      >
        <div style={{ color: '#496580' }}>
          <IconComponent className="w-7 h-7" />
        </div>
      </div>

      {/* Content */}
      <h3 className="font-bold text-slate-900 mb-1">{nameId}</h3>
      {nameAr && (
        <p 
          className="text-sm mb-2"
          style={{ fontFamily: '"Scheherazade New", serif', color: '#496580' }}
          lang="ar"
          dir="rtl"
        >
          {nameAr}
        </p>
      )}
      {description && (
        <p className="text-sm text-slate-500 line-clamp-2 mb-4">{description}</p>
      )}

      {/* Progress */}
      <div className="mt-auto">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-slate-500">{completedNodes}/{nodeCount} surah</span>
          <span style={{ color: '#496580' }} className="font-medium">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${progress}%`,
              backgroundColor: '#496580',
            }}
          />
        </div>
      </div>
    </Link>
  );
}
