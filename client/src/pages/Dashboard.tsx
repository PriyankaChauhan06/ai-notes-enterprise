import { useMemo } from "react";
import { Link } from "react-router-dom";

import { StatsCard, Card } from "../components/common";
import { useNotesContext } from "../contexts/NotesContext";

function Dashboard() {
  const { notes } = useNotesContext();

  const totalNotes = notes.length;

  const favoriteNotes = useMemo(
    () => notes.filter((note) => note.isFavorite).length,
    [notes],
  );

  const aiGeneratedNotes = useMemo(
    () => notes.filter((note) => note.source === "ai").length,
    [notes],
  );

  return (
    <div>
      {/* Stats */}
      <section className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4 mb-4">
        <StatsCard
          title="Total Notes"
          value={totalNotes}
          description="All your notes"
          icon="📝"
        />

        <StatsCard
          title="AI Generated"
          value={aiGeneratedNotes}
          description="Created with AI"
          icon="🤖"
        />

        <StatsCard
          title="Favorites"
          value={favoriteNotes}
          description="Your starred notes"
          icon="⭐"
        />
      </section>

      {/* Notes */}
      <Card>
        {!notes.length ? (
          <div className="py-10 text-center">
            <p className="text-gray-500">No notes yet.</p>

            <Link
              to="/notes"
              className="mt-3 inline-block text-sm font-medium text-blue-600"
            >
              Create your first note
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
            {notes.map((note) => (
              <Card
                key={note.id}
                className="flex items-center justify-between py-4 mr-4 last:mr-0 w-full"
              >
                <div className="min-w-0">
                  <h3 className="truncate font-medium text-gray-900">
                    {note.title}
                  </h3>

                  <p className="mt-1 truncate text-sm text-gray-500">
                    {note.description}
                  </p>
                </div>

                {note.source === "ai" && (
                  <span className="shrink-0 rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
                    🤖 AI
                  </span>
                )}
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export default Dashboard;
