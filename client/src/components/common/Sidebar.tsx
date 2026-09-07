import { NavLink } from "react-router-dom";

function Sidebar() {
  const navItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
    },
    {
      label: "Notes",
      path: "/notes",
    },
    {
      label: "AI Assistant",
      path: "/ai-assistant",
    },
  ];

  return (
    <aside className="hidden w-64 shrink-0 border-r border-gray-200 bg-white lg:block">
      <div className="px-6 py-4">
        <h1 className="text-xl font-bold">AI Notes Enterprise</h1>
      </div>

      <nav className="p-4 mt-5 border-t border-gray-200">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block rounded-lg px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
