import { useEffect, useRef, type TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  autoGrow?: boolean;
  maxHeight?: number;
}

function Textarea({
  label,
  error,
  autoGrow = false,
  maxHeight = 180,
  value,
  className = "",
  ...props
}: TextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!autoGrow || !textareaRef.current) {
      return;
    }

    const textarea = textareaRef.current;

    textarea.style.height = "auto";

    const nextHeight = Math.min(textarea.scrollHeight, maxHeight);

    textarea.style.height = `${nextHeight}px`;

    textarea.style.overflowY =
      textarea.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [value, autoGrow, maxHeight]);

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="font-medium text-gray-700">{label}</label>}

      <textarea
        ref={textareaRef}
        value={value}
        className={`w-full rounded-xl border border-gray-300 px-4 py-2 outline-none 
          focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none ${className}`}
        {...props}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

export default Textarea;
