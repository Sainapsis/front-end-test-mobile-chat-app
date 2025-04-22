import React from 'react';
import { IconSymbol } from '@/design_system/ui/vendors';
import { IconSymbolName } from '@/design_system/ui/vendors/IconSymbol';

interface TabIconProps {
  /** Name of the icon to be displayed */
  name: IconSymbolName; 
  /** Color of the icon */
  color: string;
  /** Whether the icon is in a loading state */
  isLoading: boolean;
}

/**
 * TabIcon component is used to display icons in tab bars.
 * It supports loading states by adjusting the icon's opacity.
 */
export const TabIcon: React.FC<TabIconProps> = ({ name, color, isLoading }) => (
  <IconSymbol 
    size={28} 
    name={name} 
    color={color}
    style={{ opacity: isLoading ? 0.5 : 1 }}
  />
);
