import { Outlet } from "react-router-dom";
import { Header, Sidebar } from "../components/common/index";

function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col relative h-screen">
          <Header />

          {/* Page Content */}
          <main className="flex-1 min-h-0 p-5">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
