import React from 'react';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBorder?: boolean;
}

const sizeMap = {
  xs: 'w-7 h-7',
  sm: 'w-9 h-9',
  md: 'w-11 h-11',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20'
};

/**
 * School Education Department (SED) Official Insignia
 * Based on user-provided attachment at /assets/aistudio/image_3b85f1cc.png
 * Contains:
 * - "SCHOOL EDUCATION DEPARTMENT"
 * - Children silhouettes
 * - "اپنا مقام پیدا کر" banner
 * - "GOVERNMENT OF PUNJAB"
 */
export const SchoolEducationDeptLogo: React.FC<LogoProps> = ({
  size = 'md',
  className = '',
  showBorder = true
}) => {
  const sizeClass = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full bg-white shadow-xs overflow-hidden ${
        showBorder ? 'border border-emerald-600/40 p-0.5 ring-1 ring-emerald-500/20' : ''
      } ${sizeClass} ${className}`}
      title="School Education Department · Government of the Punjab"
    >
      <img
        src="/assets/aistudio/image_3b85f1cc.png"
        alt="School Education Department Logo"
        className="w-full h-full object-contain rounded-full"
        loading="eager"
      />
    </div>
  );
};

export const OfficialLogo = SchoolEducationDeptLogo;

/**
 * Legacy compatibility helper: renders ONLY the official School Education Department logo
 */
export const DualPunjabLogos: React.FC<{
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  spacing?: string;
  className?: string;
}> = ({ size = 'md', className = '' }) => {
  return (
    <div className={`flex items-center shrink-0 ${className}`}>
      <SchoolEducationDeptLogo size={size} />
    </div>
  );
};
