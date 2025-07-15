import React, { useState } from 'react';

export function Tabs({ defaultValue, children }) {
  const [value, setValue] = useState(defaultValue);
  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div>{children}</div>
    </TabsContext.Provider>
  );
}

const TabsContext = React.createContext();

export function TabsList({ children }) {
  return (
    <div className="flex border-b border-gray-300 space-x-4 mb-4">
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children }) {
  const { value: active, setValue } = React.useContext(TabsContext);
  const isActive = value === active;

  return (
    <button
      onClick={() => setValue(value)}
      className={`px-4 py-2 text-sm font-medium ${
        isActive ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'
      }`}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children }) {
  const { value: active } = React.useContext(TabsContext);
  if (value !== active) return null;
  return <div>{children}</div>;
}
