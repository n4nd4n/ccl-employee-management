import React from 'react';

export function Alert({ children, className = '' }) {
  return (
    <div className={`p-4 border rounded ${className}`}>
      {children}
    </div>
  );
}

export function AlertDescription({ children, className = '' }) {
  return <p className={className}>{children}</p>;
}
