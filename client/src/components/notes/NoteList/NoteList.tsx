import NoteCard from "../NoteCard/NoteCard";
import type { NoteListProps } from "../../../types/note-list-props";
import type { Note } from "../../../types/note";
import { Card, EmptyState } from "../../../components/common/index";

function NoteList({ notes, onEditNote, onDeleteNote }: NoteListProps) {
  return (
    <div className="w-full ml-2">
      <Card>
        <h2 className="text-purple-900 text-lg font-semibold mb-2">My Notes</h2>

        <div style={{ maxHeight: "308px" }} className="overflow-y-auto">
          {notes?.length ? (
            notes.map((note: Note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={onEditNote}
                onDelete={onDeleteNote}
              />
            ))
          ) : (
            <EmptyState
              title="No Notes Yet"
              description="Create your first note and start organizing your ideas."
            />
          )}
        </div>
      </Card>
    </div>
  );
}
export default NoteList;
