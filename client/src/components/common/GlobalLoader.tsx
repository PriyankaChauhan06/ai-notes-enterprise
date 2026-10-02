import { Spinner } from "./index";
import { useApiLoading } from "../../hooks/useApiLoading";

function GlobalLoader() {
  const isLoading = useApiLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20">
      <div className="rounded-xl bg-white p-4 shadow-lg">
        <Spinner size="md" />
      </div>
    </div>
  );
}

export default GlobalLoader;
