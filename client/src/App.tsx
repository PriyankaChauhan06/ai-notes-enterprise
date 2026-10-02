import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes/AppRoutes";
import { NotesProvider } from "./contexts/NotesContext";
import GlobalLoader from "./components/common/GlobalLoader";

function App() {
  return (
    <NotesProvider>
      <AppRoutes />

      <GlobalLoader />

      <Toaster position="top-right" />
    </NotesProvider>
  );
}

export default App;
