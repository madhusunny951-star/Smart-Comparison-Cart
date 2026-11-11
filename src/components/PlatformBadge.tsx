import React from 'react';
import { ExternalLink } from 'lucide-react';

interface PlatformBadgeProps {
  platformName: string;
  size?: 'sm' | 'md' | 'lg';
  showRedirectIcon?: boolean;
}

export const PLATFORM_INFO: Record<
  string,
  {
    name: string;
    bg: string;
    text: string;
    border: string;
    tagline: string;
    defaultUrl: string;
    logoColor: string;
  }
> = {
  Blinkit: {
    name: 'Blinkit',
    bg: 'bg-amber-100',
    text: 'text-amber-900',
    border: 'border-amber-300',
    tagline: '10 min delivery',
    defaultUrl: 'https://blinkit.com',
    logoColor: '#F7D000',
  },
  Zepto: {
    name: 'Zepto',
    bg: 'bg-purple-100',
    text: 'text-purple-900',
    border: 'border-purple-300',
    tagline: '10 min delivery',
    defaultUrl: 'https://www.zeptonow.com',
    logoColor: '#8000FF',
  },
  'Swiggy Instamart': {
    name: 'Swiggy Instamart',
    bg: 'bg-orange-100',
    text: 'text-orange-900',
    border: 'border-orange-300',
    tagline: 'Instant grocery',
    defaultUrl: 'https://www.swiggy.com/instamart',
    logoColor: '#FC8019',
  },
  BigBasket: {
    name: 'BigBasket',
    bg: 'bg-red-50',
    text: 'text-red-900',
    border: 'border-red-200',
    tagline: 'Tata enterprise',
    defaultUrl: 'https://www.bigbasket.com',
    logoColor: '#84C225',
  },
  DMart: {
    name: 'DMart',
    bg: 'bg-emerald-50',
    text: 'text-emerald-900',
    border: 'border-emerald-300',
    tagline: 'Everyday lowest price',
    defaultUrl: 'https://www.dmart.in',
    logoColor: '#008738',
  },
  Flipkart: {
    name: 'Flipkart',
    bg: 'bg-blue-50',
    text: 'text-blue-900',
    border: 'border-blue-300',
    tagline: 'Grocery Supermart',
    defaultUrl: 'https://www.flipkart.com/grocery-supermart-store',
    logoColor: '#2874F0',
  },
  SmartCart: {
    name: 'SmartCart',
    bg: 'bg-emerald-600',
    text: 'text-white',
    border: 'border-emerald-700',
    tagline: 'Direct Express Hub',
    defaultUrl: '#',
    logoColor: '#059669',
  },
};

export const PlatformBadge: React.FC<PlatformBadgeProps> = ({
  platformName,
  size = 'md',
  showRedirectIcon = false,
}) => {
  const info = PLATFORM_INFO[platformName] || {
    name: platformName,
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-300',
    tagline: 'Official Store',
    defaultUrl: '#',
    logoColor: '#6B7280',
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3 py-1.5 font-bold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${info.bg} ${info.text} ${info.border} ${sizeClasses[size]} shadow-xs`}
    >
      <span
        className="w-2 h-2 rounded-full inline-block"
        style={{ backgroundColor: info.logoColor }}
      />
      {info.name}
      {showRedirectIcon && <ExternalLink className="w-3 h-3 opacity-70" />}
    </span>
  );
};
