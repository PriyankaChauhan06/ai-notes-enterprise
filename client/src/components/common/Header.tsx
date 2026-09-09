import { useLocation } from "react-router-dom";
import AInoteLogo from "../../assets/AInote-logo.svg";
import { getStoredUser } from "../../utils/auth-storage";

function Header() {
  const location = useLocation();
  const { name }: any = getStoredUser() || { name: "User" };

  let currentPage = location.pathname.split("/").filter(Boolean).pop() ?? "";
  currentPage =
    currentPage.charAt(0).toUpperCase() + currentPage.slice(1).toLowerCase();

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
      <div>
        <h2 className="text-lg font-semibold">{currentPage}</h2>

        <p className="text-sm text-gray-500">Welcome</p>
      </div>

      <div className="flex items-center">
        <div className="flex h-10 w-10 mt-2 mr-2 items-center justify-center rounded-full bg-gray-200 font-semibold">
          {name.charAt(0).toUpperCase()}
        </div>
        <img src={AInoteLogo} alt="NoteMind" className="h-14 w-auto" />
      </div>
    </header>
  );
}

export default Header;
