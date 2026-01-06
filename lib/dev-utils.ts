// Development utilities for easy data source switching

export const toggleDataSource = () => {
  const currentValue = process.env.NEXT_PUBLIC_USE_MOCK_DATA;
  const newValue = currentValue === 'true' ? 'false' : 'true';
  
  console.log(`�� Switching data source from ${currentValue === 'true' ? 'Mock' : 'Real API'} to ${newValue === 'true' ? 'Mock' : 'Real API'}`);
  console.log(`�� Update your .env.local file: NEXT_PUBLIC_USE_MOCK_DATA=${newValue}`);
  console.log(`🔄 Restart your development server to apply changes`);
  
  return newValue;
};

export const getCurrentDataSource = () => {
  return process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' ? 'Mock Data' : 'Real API';
};

