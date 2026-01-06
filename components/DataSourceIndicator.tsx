'use client';

import React from 'react';

export const DataSourceIndicator = (): React.ReactNode => {
  // Only render in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  const dataSource = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' ? 'Mock Data' : 'Real API';
  const isMock = dataSource === 'Mock Data';
  
  return (
    <div
      style={{
        position: 'fixed',
        right: '80px',
        bottom: '15px',
        background: isMock ? '#ff9800' : '#4caf50',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 'bold',
        zIndex: 9999,
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      }}
    >
      {isMock ? '🧪 Mock Data' : '🌐 Real API'}
    </div>
  );
};
