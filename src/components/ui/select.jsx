import React, { useState } from 'react';

export function Select({ value, onValueChange, children }) {
  const [open, setOpen] = useState(false);

  function handleSelect(optionValue) {
    onValueChange(optionValue);
    setOpen(false);
  }

  // Find the selected option's display text
  const selectedOption = React.Children.toArray(children).find(child => {
    if (child.type === SelectContent) {
      return React.Children.toArray(child.props.children).find(item => 
        item.props.value === value
      );
    }
    return false;
  });

  const selectedText = selectedOption ? 
    React.Children.toArray(selectedOption.props.children).find(item => 
      item.props.value === value
    )?.props.children : value;

  return (
    <div className="relative w-full">
      <div
        onClick={() => setOpen(!open)}
        className="cursor-pointer px-3 py-2 border rounded bg-white flex justify-between items-center min-h-[40px]"
      >
        <span className="flex items-center gap-2">{selectedText || "Select"}</span>
        <svg 
          className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {open && (
        <div className="absolute top-full left-0 w-full border bg-white mt-1 rounded shadow-lg z-10 max-h-60 overflow-y-auto">
          {React.Children.map(children, child => {
            if (child.type === SelectContent) {
              return React.Children.map(child.props.children, item =>
                React.cloneElement(item, {
                  onClick: () => handleSelect(item.props.value)
                })
              );
            }
            return child;
          })}
        </div>
      )}
    </div>
  );
}

export function SelectTrigger({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}

export function SelectValue({ placeholder }) {
  return <span className="text-gray-600">{placeholder}</span>;
}

export function SelectContent({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}

export function SelectItem({ value, children, onClick, className = "" }) {
  return (
    <div
      onClick={onClick}
      className={`px-3 py-2 hover:bg-blue-100 cursor-pointer flex items-center gap-2 ${className}`}
    >
      {children}
    </div>
  );
}

