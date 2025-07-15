import React, { useState } from 'react';

export function Select({ value, onValueChange, children }) {
  const [open, setOpen] = useState(false);

  function handleSelect(optionValue) {
    onValueChange(optionValue);
    setOpen(false);
  }

  return (
    <div className="relative w-full">
      <div
        onClick={() => setOpen(!open)}
        className="cursor-pointer px-3 py-2 border rounded bg-white"
      >
        {value || "Select"}
      </div>
      {open && (
        <div className="absolute top-full left-0 w-full border bg-white mt-1 rounded shadow">
          {React.Children.map(children, child =>
            React.cloneElement(child, {
              onClick: () => handleSelect(child.props.value)
            })
          )}
        </div>
      )}
    </div>
  );
}

export function SelectTrigger({ children }) {
  return <div>{children}</div>;
}

export function SelectValue({ placeholder }) {
  return <span className="text-gray-600">{placeholder}</span>;
}

export function SelectContent({ children }) {
  return <div>{children}</div>;
}

export function SelectItem({ value, children, onClick }) {
  return (
    <div
      onClick={onClick}
      className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
    >
      {children}
    </div>
  );
}
