import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

function Textarea({ label, error, className = "", ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="font-medium text-gray-700">{label}</label>}

      <textarea
        className={`w-full rounded-xl border border-gray-300 px-4 py-2 mb-3 outline-none
            focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none ${className}`}
        {...props}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

export default Textarea;
