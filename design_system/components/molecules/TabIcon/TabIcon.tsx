import React from 'react';
import { IconSymbol } from '@/design_system/ui/vendors';
import { IconSymbolName } from '@/design_system/ui/vendors/IconSymbol';

interface TabIconProps {
  name: IconSymbolName; 
  color: string;
  isLoading: boolean;
}

export const TabIcon: React.FC<TabIconProps> = ({ name, color, isLoading }) => (
  <IconSymbol 
    size={28} 
    name={name} 
    color={color}
    style={{ opacity: isLoading ? 0.5 : 1 }}
  />
);
