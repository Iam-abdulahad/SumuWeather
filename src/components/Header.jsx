import { Cloud } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="p-4 shadow-md bg-blue-500 text-white">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Cloud className="w-8 h-8 text-yellow-300" />
          <h1 className="text-2xl font-bold">SuMo Weather</h1>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
