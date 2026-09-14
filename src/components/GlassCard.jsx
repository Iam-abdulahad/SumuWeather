import { forwardRef } from 'react';

/**
 * Reusable glass-card wrapper.
 * Applies the glass surface token: rgba fill, 1px border, backdrop-blur, 20px radius.
 * Hierarchy comes from size/grid placement, not extra shadows.
 */
const GlassCard = forwardRef(function GlassCard(
  { children, className = '', as: Tag = 'div', ...props },
  ref
) {
  return (
    <Tag ref={ref} className={`glass-card ${className}`} {...props}>
      {children}
    </Tag>
  );
});

export default GlassCard;
