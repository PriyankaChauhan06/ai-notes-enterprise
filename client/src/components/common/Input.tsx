import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="font-medium text-gray-700">{label}</label>}

      <input
        className={`w-full rounded-xl border border-gray-300 px-4 py-2 outline-none
          focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${className}`}
        {...props}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

export default Input;
