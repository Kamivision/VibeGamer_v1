import GameCard from "./GameCard";

export default function DisplayGames({
  games,
  count,
  isLoading,
  errorMessage,
  hasNextPage,
  hasPreviousPage,
  onNextPage,
  onPreviousPage,
  onGameRemove,
  isGameInLibrary,
  getLibraryGameIdForGame,
  getLibraryStatusForGame,
  registerLibraryGame,
  updateLibraryGameStatus,
  unregisterLibraryGame,
}) {
  if (isLoading) {
    return <p className="text-lg">Loading games...</p>;
  }

  if (errorMessage) {
    return <p className="text-red-600">{errorMessage}</p>;
  }

  if (!games.length) {
    return <p>No games found.</p>;
  }

  //DON'T FORGET! Move "Cards" to GameCard component. You only built the logic here to test the API connection and be done for today. THIS IS NOT THE FINAL DESIGN.
  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">{typeof count === "number" ? count : games.length} games found</p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            onRemoveFromLibrary={onGameRemove}
            isGameInLibrary={isGameInLibrary}
            getLibraryGameIdForGame={getLibraryGameIdForGame}
            getLibraryStatusForGame={getLibraryStatusForGame}
            registerLibraryGame={registerLibraryGame}
            updateLibraryGameStatus={updateLibraryGameStatus}
            unregisterLibraryGame={unregisterLibraryGame}
          />
        ))}
      </div>

      {(onPreviousPage || onNextPage) ? (
        <div className="flex gap-4">
          <button
            type="button"
            onClick={onPreviousPage}
            disabled={!hasPreviousPage}
            className="rounded-md bg-gray-200 px-4 py-2 disabled:opacity-50"
          >
            Previous
          </button>

          <button
            type="button"
            onClick={onNextPage}
            disabled={!hasNextPage}
            className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}