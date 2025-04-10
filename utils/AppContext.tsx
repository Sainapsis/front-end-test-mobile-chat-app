import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define el tipo para tu contexto
type AppContextType = {
  // Define tus estados y funciones aquí
  // Por ejemplo:
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  // Más estados según necesites
};

// Crea el contexto
const AppContext = createContext<AppContextType | undefined>(undefined);

// Hook personalizado para usar el contexto
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// Props para el proveedor
interface AppProviderProps {
  children: ReactNode;
}

// El proveedor del contexto
export const AppProvider = ({ children }: AppProviderProps) => {
  // Define tus estados
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // Más estados según necesites

  // Valor para el contexto
  const value = {
    isLoggedIn,
    setIsLoggedIn,
    // Más valores según necesites
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};