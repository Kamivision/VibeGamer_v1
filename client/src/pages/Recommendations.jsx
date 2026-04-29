import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import PageShell from "../components/layout/PageShell";
import SectionCard from "../components/layout/SectionCard";
import GameCard from "../components/GameCard";
import { api, fetchRecommendedGames } from "../utilities";

export default function Recommendations() {
  const {
    user,
    isGameInLibrary,
    getLibraryGameIdForGame,
    getLibraryStatusForGame,
    registerLibraryGame,
    updateLibraryGameStatus,
    unregisterLibraryGame,
  } = useOutletContext();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [strategy, setStrategy] = useState("");
  const [personality, setPersonality] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadRecommendations() {
      setLoading(true);
      setError("");

      try {
        const profileResponse = await api.get("profile/");
        const genreTags = Array.isArray(profileResponse?.data?.genre_tags)
          ? profileResponse.data.genre_tags
          : [];
        const platformTags = Array.isArray(profileResponse?.data?.platform_tags)
          ? profileResponse.data.platform_tags
          : [];
        const excludedTags = Array.isArray(profileResponse?.data?.excluded_tags)
          ? profileResponse.data.excluded_tags
          : [];
        const personalityTags = Array.isArray(profileResponse?.data?.personality_tags)
          ? profileResponse.data.personality_tags
          : [];
        const playTimePreference =
          typeof profileResponse?.data?.play_time_preference === "string"
            ? profileResponse.data.play_time_preference
            : "";
        const profilePersonality =
          typeof profileResponse?.data?.personality === "string"
            ? profileResponse.data.personality
            : "";

        const data = await fetchRecommendedGames(personalityTags, playTimePreference, genreTags, platformTags, excludedTags);

        if (!isMounted) return;

        setGames(Array.isArray(data?.results) ? data.results : []);
        setStrategy(typeof data?.strategy === "string" ? data.strategy : "");
        setPersonality(profilePersonality);
      } catch {
        if (!isMounted) return;
        setError("We could not load your recommendations right now.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadRecommendations();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <PageShell
      title="Your Game Recommendations"
      subtitle="Based on your Vibe Profile, here are some games we think you'll love."
    >
      <SectionCard
        title={`Recommendation Type: ${personality || "Unknown"}`}
        cardClassName="bg-cyan-500"
        bodyClassName="bg-gradient-to-r from-cyan-500 to-cyan-700"
      >
        {loading ? <p>Loading recommendations...</p> : null}

        {!loading && error ? <p className="text-red-600">{error}</p> : null}

        {!loading && !error && games.length === 0 ? (
          <p>No recommendations yet. Try updating your profile tags and quiz results.</p>
        ) : null}

        {!loading && !error && games.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {games.map((game) => (
              // showWhyButton={true} tells GameCard to display the "Why this game?" button.
              // We only pass this here on the Recommendations page, so it won't appear anywhere else.
              <GameCard
                key={game.id || game.name}
                game={game}
                user={user}
                showWhyButton={true}
                isGameInLibrary={isGameInLibrary}
                getLibraryGameIdForGame={getLibraryGameIdForGame}
                getLibraryStatusForGame={getLibraryStatusForGame}
                registerLibraryGame={registerLibraryGame}
                updateLibraryGameStatus={updateLibraryGameStatus}
                unregisterLibraryGame={unregisterLibraryGame}
              />
            ))}
          </div>
        ) : null}
      </SectionCard>
    </PageShell>
  );
}