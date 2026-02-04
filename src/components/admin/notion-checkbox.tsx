"use client";

interface NotionCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  indeterminate?: boolean;
}

export function NotionCheckbox({ checked, onChange, indeterminate }: NotionCheckboxProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={`w-4 h-4 rounded border flex items-center justify-center transition-all duration-100 flex-shrink-0 ${
        checked || indeterminate
          ? "bg-blue-500 border-blue-500"
          : "border-notion-border hover:border-blue-400 bg-white"
      }`}
    >
      {checked && (
        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      )}
      {indeterminate && !checked && (
        <div className="w-2 h-0.5 bg-white rounded" />
      )}
    </button>
  );
}
