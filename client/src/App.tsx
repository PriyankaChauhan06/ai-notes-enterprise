import AppRoutes from "./routes/AppRoutes";
import { NotesProvider } from "./contexts/NotesContext";

function App() {
  return (
    <NotesProvider>
      <AppRoutes />
    </NotesProvider>
  );
}

export default App;
