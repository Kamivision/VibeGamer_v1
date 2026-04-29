import imageNotFound from "../assets/image-not-found.jpg";
import logoName from "../assets/logo-name.jpg";
import BannerCard from "../components/layout/BannerCard";
import PageShell from "../components/layout/PageShell";
import SectionCard from "../components/layout/SectionCard";
import DisplayGames from "../components/DisplayGames";
import { useState, useEffect } from "react";
import { useNavigate, Navigate, useOutletContext } from "react-router-dom";
import { fetchLibrary } from "../utilities";
import SearchForm from "../components/SearchForm";
import { sharedStyles } from "../styles/sharedStyles";

export default function UserLibrary() {
  const {
    user,
    isGameInLibrary,
    getLibraryGameIdForGame,
    getLibraryStatusForGame,
    registerLibraryGame,
    updateLibraryGameStatus,
    unregisterLibraryGame,
  } = useOutletContext();
  const navigate = useNavigate();
  const [library, setLibrary] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  function normalizeLibraryGame(savedItem) {
    const game = savedItem?.game || {};
    const metadata = game?.metadata || {};

    return {
      id: Number(game.external_id) || game.id,
      libraryGameId: game.id,
      savedId: savedItem.id,
      savedStatus: savedItem.status || "saved",
      name: game.title || "Unknown",
      released: game.released_at || "Unknown",
      rating: metadata.rawg_rating || "N/A",
      background_image: game.image_url || imageNotFound,
      genres: Array.isArray(game.tags) ? game.tags : [],
      platforms: Array.isArray(metadata.platforms) ? metadata.platforms : [],
      slug: game.slug || "",
    };
  }

  useEffect(() => {
    if (!user) {
      return;
    }

    async function loadLibrary() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const data = await fetchLibrary();
        const normalizedLibrary = Array.isArray(data)
          ? data.map((savedItem) => normalizeLibraryGame(savedItem))
          : [];
        setLibrary(normalizedLibrary);
      } catch (error) {
        if (error?.response?.status === 401) {
          setErrorMessage("Please sign in to view your library.");
        } else {
          setErrorMessage("Failed to load your library.");
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadLibrary();
  }, [user]);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  function handleRemoveFromLibrary(libraryGameId) {
    setLibrary((currentLibrary) =>
      currentLibrary.filter((game) => game.libraryGameId !== libraryGameId)
    );
  }

  return (
    <PageShell>
      <BannerCard
        title={`${user.username}'s Game Library`}
        imageSrc={logoName}
        imageAlt="library banner"
      >
        <button
          type="button"
          className={sharedStyles.actionBtn}
          onClick={() => navigate("/recommended")}
        >
          View Recommendations
        </button>
        <button
          type="button"
          className={sharedStyles.actionBtn}
          onClick={() => navigate("/quiz")}
        >
          Take Quiz
        </button>
      </BannerCard>

      <SectionCard title="Search">
        <SearchForm />
      </SectionCard>

      <SectionCard title="Your Saved Games">
        <DisplayGames
          games={library}
          count={library.length}
          isLoading={isLoading}
          errorMessage={errorMessage}
          onGameRemove={handleRemoveFromLibrary}
          isGameInLibrary={isGameInLibrary}
          getLibraryGameIdForGame={getLibraryGameIdForGame}
          getLibraryStatusForGame={getLibraryStatusForGame}
          registerLibraryGame={registerLibraryGame}
          updateLibraryGameStatus={updateLibraryGameStatus}
          unregisterLibraryGame={unregisterLibraryGame}
        />
      </SectionCard>

      {/* <SectionCard title="Your Owned Games">
        <p>This is a placeholder for the user's owned games.</p>
      </SectionCard> */}
    </PageShell>
  );
}