import { Cloud } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="p-4 shadow-md bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 text-white">
      <div className="container mx-auto flex flex-col items-center justify-center sm:flex-row sm:justify-between">
        <div className="flex items-center gap-2">
          <Cloud className="w-8 h-8 text-yellow-300" />
          <h1 className="text-2xl font-bold text-center sm:text-left">
            SuMo Weather
          </h1>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
