import React from "react";

interface ArrowRightIconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const ArrowRightIcon: React.FC<ArrowRightIconProps> = ({ 
  size = 12, 
  className = "",
  style = {} 
}) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
      style={style}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
};

export default ArrowRightIcon;