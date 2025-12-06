import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import {
  generateCompleteDemoData,
  activateDemoMode as activateDemo,
  deactivateDemoMode as deactivateDemo,
  isDemoMode as checkDemoMode
} from '../utils/demoData';

const DemoDataContext = createContext(null);

export const DemoDataProvider = ({ children }) => {
  const { user } = useAuth();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoData, setDemoData] = useState(null);

  useEffect(() => {
    // Check if demo mode is active on mount
    const demoModeActive = checkDemoMode();
    if (demoModeActive) {
      setIsDemoMode(true);
      setDemoData(generateCompleteDemoData());
    }
  }, []);

  // Automatically deactivate demo mode when user logs in
  useEffect(() => {
    if (user && isDemoMode) {
      deactivateDemoMode();
    }
  }, [user, isDemoMode]);

  const activateDemoMode = () => {
    activateDemo();
    setIsDemoMode(true);
    setDemoData(generateCompleteDemoData());
  };

  const deactivateDemoMode = () => {
    deactivateDemo();
    setIsDemoMode(false);
    setDemoData(null);
  };

  const value = {
    isDemoMode,
    demoData,
    activateDemoMode,
    deactivateDemoMode
  };

  return (
    <DemoDataContext.Provider value={value}>
      {children}
    </DemoDataContext.Provider>
  );
};

export const useDemoData = () => {
  const context = useContext(DemoDataContext);
  if (context === null) {
    throw new Error('useDemoData must be used within a DemoDataProvider');
  }
  return context;
};

export default DemoDataContext;
