import React from 'react';

interface VehicleBadgeProps {
  registrationNumber: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const VehicleBadge: React.FC<VehicleBadgeProps> = ({
  registrationNumber,
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  return (
    <div
      className={`inline-flex items-center justify-center font-mono font-bold tracking-wider rounded-md border border-amber-500 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 shadow-sm uppercase select-none ${sizeClasses[size]} ${className}`}
      title={`Vehicle Registration: ${registrationNumber}`}
    >
      <span>{registrationNumber}</span>
    </div>
  );
};
