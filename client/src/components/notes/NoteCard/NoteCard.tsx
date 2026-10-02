import { useState } from "react";
import toast from "react-hot-toast";

import type { NoteCardProps } from "../../../types/note-card-props";
import { Button, Card, Dialog } from "../../../components/common";

function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDelete = () => {
    try {
      onDelete(note.id);
      setIsDeleteDialogOpen(false);
      // toast.success("Note deleted successfully.");
    } catch (error) {
      console.error("Delete note error:", error);
      toast.error("Failed to delete note.");
    }
  };

  return (
    <div className="mb-2 p-2">
      <Card>
        <div className="flex items-start justify-between">
          <div>
            <h3>{note.title}</h3>

            <p className="text-sm">{note.description}</p>

            <div className="mt-2 flex flex-wrap gap-2">
              <span>{note.category}</span>

              {note.tags.map((tag) => (
                <span key={tag}>#{tag}</span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center">
            <Button className="mr-2" onClick={() => onEdit(note)}>
              Edit
            </Button>

            <Button
              variant="danger"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              Delete
            </Button>
          </div>
        </div>
      </Card>

      <Dialog
        open={isDeleteDialogOpen}
        title="Delete Note?"
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <p>
          Are you sure you want to delete <strong>{note.title}</strong>?
        </p>

        <p className="mt-2 text-sm text-gray-500">
          This action cannot be undone.
        </p>

        <div className="mt-5 flex justify-end gap-2">
          <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>

          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

export default NoteCard;
