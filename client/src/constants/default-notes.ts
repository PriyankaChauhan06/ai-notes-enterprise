import type { Note } from "../types/note";

export const DEFAULT_NOTES: Note[] = [
  {
    id: "1",
    title: "Learn React",
    description: "Complete useState and useEffect.",
    category: "React",
    tags: ["hooks", "frontend"],
    isFavorite: false,
    source: "manual",
  },
  {
    id: "2",
    title: "Redis Basics",
    description: "Learn caching and Redis fundamentals.",
    category: "Backend",
    tags: ["redis", "cache"],
    isFavorite: true,
    source: "manual",
  },
];
