import React, { useState, useEffect } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import { fetchRAWGGames } from "../utilities";
import PageShell from "../components/layout/PageShell";
import DisplayGames from "../components/DisplayGames";


export default function GenrePage() {
  const {
    isGameInLibrary,
    getLibraryGameIdForGame,
    registerLibraryGame,
    unregisterLibraryGame,
  } = useOutletContext();
  const { genre } = useParams();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [next, setNext] = useState(null);
  const [previous, setPrevious] = useState(null);

  useEffect(() => {
    async function loadGames() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchRAWGGames("", genre, "", page);
        setGames(data.results || []);
        setCount(data.count || 0);
        setNext(data.next || null);
        setPrevious(data.previous || null);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    loadGames();
  }, [genre, page]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading games: {error.message}</p>;

  return (
    <PageShell title={`${genre ? genre.toUpperCase() : ""} Games`} subtitle={`Browse ${genre || ""} games.`}>
      <DisplayGames 
        games={games} 
        count={count}
        isLoading={loading}
        errorMessage={error}
        hasNextPage={!!next}
        hasPreviousPage={!!previous}
        onNextPage={() => setPage((prev) => prev + 1)}
        onPreviousPage={() => setPage((prev) => prev - 1)}
        isGameInLibrary={isGameInLibrary}
        getLibraryGameIdForGame={getLibraryGameIdForGame}
        registerLibraryGame={registerLibraryGame}
        unregisterLibraryGame={unregisterLibraryGame}
      />
    </PageShell>
  );
}