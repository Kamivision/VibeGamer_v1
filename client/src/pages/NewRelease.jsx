import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import DisplayGames from "../components/DisplayGames";
import PageShell from "../components/layout/PageShell";
import { fetchNewReleases } from "../utilities";

export default function NewRelease() {
  const {
    isGameInLibrary,
    getLibraryGameIdForGame,
    getLibraryStatusForGame,
    registerLibraryGame,
    updateLibraryGameStatus,
    unregisterLibraryGame,
  } = useOutletContext();
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [next, setNext] = useState(null);
  const [previous, setPrevious] = useState(null);

  useEffect(() => {
    async function loadNewReleases() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchNewReleases(page);
        setGames(data.results || []);
        setCount(data.count || 0);
        setNext(data.next || null);
        setPrevious(data.previous || null);
      } catch {
        setError("Failed to fetch games.");
      } finally {
        setIsLoading(false);
      }
    }

    loadNewReleases();
  }, [page]);

  return (
    <PageShell
      title="New Releases"
      subtitle="Browse the latest games."
    >
      <DisplayGames
        games={games}
        count={count}
        isLoading={isLoading}
        errorMessage={error}
        hasNextPage={!!next}
        hasPreviousPage={!!previous}
        onNextPage={() => setPage((prev) => prev + 1)}
        onPreviousPage={() => setPage((prev) => prev - 1)}
        isGameInLibrary={isGameInLibrary}
        getLibraryGameIdForGame={getLibraryGameIdForGame}
        getLibraryStatusForGame={getLibraryStatusForGame}
        registerLibraryGame={registerLibraryGame}
        updateLibraryGameStatus={updateLibraryGameStatus}
        unregisterLibraryGame={unregisterLibraryGame}
      />
    </PageShell>
  );
}