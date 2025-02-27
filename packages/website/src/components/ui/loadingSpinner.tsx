"use client";

import { useEffect, useState } from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  fullScreen?: boolean;
  message?: string;
}

export default function LoadingSpinner({ 
  size = "md", 
  showText = true,
  fullScreen = true,
  message = "Loading..."
}: LoadingSpinnerProps) {
  const [dots, setDots] = useState("");
  
  // Animate the loading dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return "";
        return prev + ".";
      });
    }, 400);
    
    return () => clearInterval(interval);
  }, []);

  const sizeClasses = {
    sm: "w-8 h-8 border-2",
    md: "w-12 h-12 border-3",
    lg: "w-16 h-16 border-4",
    xl: "w-24 h-24 border-[6px]"
  };
  
  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl"
  };

  return (
    <div className={`flex flex-col items-center justify-center ${fullScreen ? 'fixed inset-0 z-50 bg-cbackground-light/95' : ''}`}>
      <div className="relative">
        {/* Main spinner */}
        <div className={`${sizeClasses[size]} rounded-full border-cprimary-light/20 border-t-cprimary-light animate-spin`}></div>
        
        {/* Overlay spinner for double-ring effect */}
        <div className={`absolute top-0 left-0 ${sizeClasses[size]} rounded-full border-csecondary-light/10 border-r-csecondary-light animate-spin-slower opacity-70`}></div>
      </div>
      
      {showText && (
        <p className={`mt-4 text-ctext-light ${textSizes[size]} font-medium flex items-center`}>
          <span>{message}</span>
          <span className="inline-block w-7 text-left">{dots}</span>
        </p>
      )}
    </div>
  );
}