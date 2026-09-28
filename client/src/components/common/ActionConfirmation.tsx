interface ActionConfirmationProps {
  action: "update_note" | "delete_note";
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

function ActionConfirmation({
  action,
  onConfirm,
  onCancel,
  isLoading = false,
}: ActionConfirmationProps) {
  const actionLabel =
    action === "update_note" ? "update this note" : "delete this note";

  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm font-medium">
        Are you sure you want to {actionLabel}?
      </p>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="rounded-md border px-4 py-2 text-sm"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className="rounded-md px-4 py-2 text-sm"
        >
          {isLoading ? "Processing..." : "Confirm"}
        </button>
      </div>
    </div>
  );
}

export default ActionConfirmation;
