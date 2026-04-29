import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SearchForm() {
  const [searchTerm, setSearchTerm] = useState("");
  const [genre, setGenre] = useState("");
  const [platform, setPlatform] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Build query string from form values
    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (genre) params.append("genre", genre);
    if (platform) params.append("platform", platform);
    
    // Navigate to search page with query parameters
    navigate(`/search?${params.toString()}`);
  }

  return (
    <div className="">
      <h2 className="text-2xl font-semibold mb-4 text-white text-left">Search for Games</h2>
      <form
      className=""
      onSubmit={handleSubmit}>
        <input
          className="border rounded w-full p-2 mb-2 text-black bg-violet-50/50 placeholder-gray-700"
          label="Search for games"
          type="text"
          placeholder="Crime Scene Cleaner, RPG, etc..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="border rounded w-1/3 p-2 mb-2 bg-violet-50/50"
          value={genre} onChange={(e) => setGenre(e.target.value)}>
          <option value="">All Genres</option>
          <option value="action">Action</option>
          <option value="adventure">Adventure</option>
          <option value="arcade">Arcade</option>
          <option value="board">Board</option>
          <option value="casual">Casual</option>
          <option value="educational">Educational</option>
          <option value="family">Family</option>
          <option value="fighting">Fighting</option>
          <option value="indie">Indie</option>
          <option value="massively-multiplayer">Massively Multiplayer</option>
          <option value="platformer">Platformer</option>
          <option value="puzzle">Puzzle</option>
          <option value="racing">Racing</option>
          <option value="rpg">RPG</option>
          <option value="shooter">Shooter</option>
          <option value="strategy">Strategy</option>
          <option value="simulation">Simulation</option>
          <option value="sports">Sports</option>
        </select>
        <select 
          className="border rounded w-1/3 p-2 mb-2 bg-violet-50/50"
          value={platform} onChange={(e) => setPlatform(e.target.value)}>
          <option value="">All Platforms</option>
          <option value="pc">PC</option>
          <option value="macOS">MacOS</option>
          <option value="linux">Linux</option>
          <option value="playstation5">PlayStation 5</option>
          <option value="playstation4">PlayStation 4</option>
          <option value="xbox-series-x">Xbox Series X/S</option>
          <option value="xbox-one">Xbox One</option>
          <option value="nintendo-switch">Nintendo Switch</option>
          <option value="android">Android</option>
          <option value="ios">iOS</option>
        </select>
        <button 
        type="submit"
        className="mt-4 bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
        >Search</button>
      </form>
    </div>
  );
}