import React from "react";

interface LogoProps {
  className?: string;
}

export function Logo({ className = "" }: LogoProps) {
  return (
    <div className={`flex items-center -space-x-6 ${className}`}>
      <div className="w-10 h-10 bg-[#00875F] rounded-full" />
      <span className="text-2xl font-bold text-white">nest cash</span>
    </div>
  );
}
