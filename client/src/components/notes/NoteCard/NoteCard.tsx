import type { NoteCardProps } from "../../../types/note-card-props";
import { Button, Card } from "../../../components/common";

function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
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

            <Button variant="danger" onClick={() => onDelete(note.id)}>
              Delete
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default NoteCard;
