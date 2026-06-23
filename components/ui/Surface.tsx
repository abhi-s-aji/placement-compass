import React from 'react';

interface SurfaceProps {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
}

/**
 * Surface – a reusable UI primitive that replaces the generic `.card` styling.
 * It applies the premium SaaS design system defined in `globals.css`.
 *
 * Props:
 * - `children`: Content inside the surface.
 * - `className`: Additional CSS classes for custom styling.
 * - `elevated`: When true, uses the `.surface.elevated` variant for a deeper background.
 */
const Surface: React.FC<SurfaceProps> = ({ children, className = '', elevated = false }) => {
  const baseClass = 'surface';
  const variantClass = elevated ? 'elevated' : '';
  const combinedClass = `${baseClass} ${variantClass} ${className}`.trim();

  return <div className={combinedClass}>{children}</div>;
};

export default Surface;
