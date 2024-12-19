import { useState } from "react";

const SearchBar = ({ onSearch }) => {
  const [city, setCity] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (city.trim() === "") {
      alert("Please enter a city name.");
      return;
    }
    onSearch(city);
    setCity("");
  };

  return (
    <div className="w-full max-w-md mx-auto mt-8">
      <form
        onSubmit={handleSearch}
        className="flex items-center border rounded-lg shadow-sm overflow-hidden"
      >
        <input
          type="text"
          className="flex-grow p-3 text-gray-700 focus:outline-none"
          placeholder="Enter city name..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 hover:bg-blue-600 focus:outline-none"
        >
          Search
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
