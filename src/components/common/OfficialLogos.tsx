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

const dimensionMap = {
  xs: 28,
  sm: 36,
  md: 44,
  lg: 56,
  xl: 80
};

/**
 * Official Government of the Punjab Insignia / Coat of Arms
 * Features:
 * - Green circular shield with five river waves (representing 5 rivers of Punjab)
 * - Crescent and 5-pointed star
 * - Golden wheat sheaves garland encircling the crest
 * - Bottom official ribbon scroll with 'حکومت پنجاب'
 */
export const PunjabGovLogo: React.FC<LogoProps> = ({
  size = 'md',
  className = '',
  showBorder = true
}) => {
  const sizeClass = sizeMap[size] || sizeMap.md;
  const dim = dimensionMap[size] || 44;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full bg-white shadow-xs ${
        showBorder ? 'border border-emerald-700/40 p-0.5' : ''
      } ${sizeClass} ${className}`}
      title="Government of the Punjab · حکومت پنجاب"
    >
      <svg
        viewBox="0 0 100 100"
        width={dim}
        height={dim}
        className="w-full h-full rounded-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Circular Rim */}
        <circle cx="50" cy="50" r="48" fill="#064e3b" stroke="#f59e0b" strokeWidth="2.5" />
        <circle cx="50" cy="50" r="44" fill="#047857" stroke="#ffffff" strokeWidth="1" strokeDasharray="2,2" />

        {/* Inner Shield / Disc */}
        <circle cx="50" cy="46" r="28" fill="#065f46" stroke="#fbbf24" strokeWidth="1.5" />

        {/* Crescent Moon & Star at Top of Crest */}
        <g fill="#ffffff">
          {/* Crescent */}
          <path d="M 52,26 A 7,7 0 1,1 46,38 A 6,6 0 1,0 52,26 Z" />
          {/* Star */}
          <polygon points="54,29 55.2,32.5 58.8,32.5 56,34.5 57,38 54,36 51,38 52,34.5 49.2,32.5 52.8,32.5" transform="scale(0.85) translate(10, 3)" fill="#ffffff" />
        </g>

        {/* Five Flowing Waves (Five Rivers of Punjab: Jhelum, Chenab, Ravi, Sutlej, Beas) */}
        <g stroke="#ffffff" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.95">
          <path d="M 32,46 Q 36,43 41,46 T 50,46 T 59,46 T 68,46" />
          <path d="M 30,51 Q 35,48 40,51 T 50,51 T 60,51 T 70,51" />
          <path d="M 31,56 Q 36,53 41,56 T 50,56 T 60,56 T 69,56" />
          <path d="M 34,61 Q 38,58 43,61 T 50,61 T 57,61 T 66,61" />
          <path d="M 38,66 Q 42,63 46,66 T 50,66 T 54,66 T 62,66" strokeWidth="1.4" />
        </g>

        {/* Golden Wheat Sheaves / Laurel surrounding the shield */}
        <g fill="#fbbf24" stroke="#d97706" strokeWidth="0.5">
          {/* Left Sheaf */}
          <ellipse cx="18" cy="42" rx="3.5" ry="2" transform="rotate(-35 18 42)" />
          <ellipse cx="16" cy="48" rx="3.5" ry="2" transform="rotate(-15 16 48)" />
          <ellipse cx="16" cy="55" rx="3.5" ry="2" transform="rotate(10 16 55)" />
          <ellipse cx="19" cy="62" rx="3.5" ry="2" transform="rotate(30 19 62)" />
          <ellipse cx="23" cy="69" rx="3.5" ry="2" transform="rotate(50 23 69)" />

          {/* Right Sheaf */}
          <ellipse cx="82" cy="42" rx="3.5" ry="2" transform="rotate(35 82 42)" />
          <ellipse cx="84" cy="48" rx="3.5" ry="2" transform="rotate(15 84 48)" />
          <ellipse cx="84" cy="55" rx="3.5" ry="2" transform="rotate(-10 84 55)" />
          <ellipse cx="81" cy="62" rx="3.5" ry="2" transform="rotate(-30 81 62)" />
          <ellipse cx="77" cy="69" rx="3.5" ry="2" transform="rotate(-50 77 69)" />
        </g>

        {/* Bottom Banner Ribbon with Urdu Calligraphy 'حکومت پنجاب' */}
        <g>
          {/* Ribbon Base */}
          <path
            d="M 22,76 C 36,73 64,73 78,76 L 85,86 C 68,82 32,82 15,86 Z"
            fill="#064e3b"
            stroke="#f59e0b"
            strokeWidth="1.2"
          />
          {/* Ribbon Ends */}
          <polygon points="15,86 19,81 12,78" fill="#047857" stroke="#d97706" strokeWidth="0.8" />
          <polygon points="85,86 81,81 88,78" fill="#047857" stroke="#d97706" strokeWidth="0.8" />

          {/* Text 'حکومت پنجاب' */}
          <text
            x="50"
            y="82"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="7.5"
            fontWeight="bold"
            fontFamily="'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', Arial, sans-serif"
          >
            حکومت پنجاب
          </text>
        </g>
      </svg>
    </div>
  );
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
        showBorder ? 'border border-emerald-600/40 p-0.5' : ''
      } ${sizeClass} ${className}`}
      title="School Education Department · Government of the Punjab"
    >
      <img
        src="/assets/aistudio/image_3b85f1cc.png"
        alt="School Education Department Punjab Logo"
        className="w-full h-full object-contain rounded-full"
        loading="eager"
      />
    </div>
  );
};

/**
 * Dual Official Logos Pair (Government of the Punjab + School Education Department)
 */
export const DualPunjabLogos: React.FC<{
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  spacing?: string;
  className?: string;
}> = ({ size = 'md', spacing = 'gap-2', className = '' }) => {
  return (
    <div className={`flex items-center ${spacing} shrink-0 ${className}`}>
      {/* 1. Government of Punjab Logo */}
      <PunjabGovLogo size={size} />
      {/* 2. School Education Department Logo */}
      <SchoolEducationDeptLogo size={size} />
    </div>
  );
};
