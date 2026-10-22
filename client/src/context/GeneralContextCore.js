import { createContext, useContext } from 'react';

export const GeneralContext = createContext(null);

export const useGeneralContext = () => {
  const context = useContext(GeneralContext);
  if (!context) {
    throw new Error('useGeneralContext must be used within a GeneralContextProvider');
  }
  return context;
};

export default GeneralContext;
