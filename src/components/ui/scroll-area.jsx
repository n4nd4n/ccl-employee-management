import React from 'react';

export function ScrollArea({ children, className = '' }) {
  return (
    <div
      className={`overflow-y-auto max-h-64 p-2 ${className}`}
      style={{ scrollbarWidth: 'thin' }}
    >
      {children}
    </div>
  );
}
