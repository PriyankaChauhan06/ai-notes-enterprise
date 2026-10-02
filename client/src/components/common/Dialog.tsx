import type { ReactNode } from "react";

interface DialogProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  scrollable?: boolean;
}

function Dialog({
  open,
  title,
  children,
  onClose,
  scrollable = false,
}: DialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className="flex w-full max-w-lg max-h-[80vh] min-h-[300px] flex-col rounded-2xl bg-white p-5 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-4 flex shrink-0 items-center justify-between">
          <h2 className="text-xl font-semibold text-purple-900">
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div
          className={`min-h-0 flex-1 ${
            scrollable ? "scrollbar-none overflow-y-auto pr-1" : ""
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default Dialog;