import { useState } from "react";
import { fetchRAWGGames } from "../utilities";

export default function useSearch() {
  const [results, setResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [searchCount, setSearchCount] = useState(0);

  async function search(searchTerm = "", genre = "", platform = "", page = 1) {
    setSearchLoading(true);
    setSearchError(null);

    try {
      const data = await fetchRAWGGames(searchTerm, genre, platform, page);
      setResults(data.results || []);
      setSearchCount(data.count || 0);
    } catch (err) {
      setSearchError(err);
    } finally {
      setSearchLoading(false);
    }
  }

  return { results, searchLoading, searchError, searchCount, search };
}