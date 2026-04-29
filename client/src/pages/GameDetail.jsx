import PageShell from "../components/layout/PageShell";
import DisplayDetail from "../components/DisplayDetail";
import { addToLibrary, fetchGameDetails } from "../utilities";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Typography } from "@material-tailwind/react";


export default function GameDetail() {
  const [game, setGame] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [savingLibrary, setSavingLibrary] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [libraryMessage, setLibraryMessage] = useState({ text: "", type: "" });
  const developers = Array.isArray(game?.developers)
    ? game.developers
        .map((developer) => {
          if (typeof developer === "string") {
            return developer;
          }

          if (developer && typeof developer === "object") {
            return developer.name || null;
          }

          return null;
        })
        .filter(Boolean)
    : [];

  function handleBackClick() {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/");
  }

  async function handleLibraryClick() {
    if (!game) {
      return;
    }

    setSavingLibrary(true);
    setLibraryMessage({ text: "", type: "" });

    try {
      const result = await addToLibrary(game);
      setIsSaved(true);

      if (result.alreadySaved) {
        setLibraryMessage({ text: "Game is already in your library.", type: "info" });
      } else {
        setLibraryMessage({ text: "Game added to your library!", type: "success" });
      }
    } catch (addError) {
      if (addError?.response?.status === 401) {
        setLibraryMessage({ text: "Please sign in to save games.", type: "error" });
      } else {
        const detail =
          addError?.response?.data?.detail ||
          addError?.response?.data?.error ||
          addError?.message ||
          "Failed to add game to library.";

        setLibraryMessage({ text: detail, type: "error" });
      }
    } finally {
      setSavingLibrary(false);
    }
  }

  useEffect(() => {
    let isActive = true;

    const fetchData = async () => {
      if (!id) {
        setError("Invalid game ID.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setGame(null);
      setLibraryMessage({ text: "", type: "" });
      setIsSaved(false);

      try {
        const gameDetails = await fetchGameDetails(id);
        if (!isActive) {
          return;
        }

        setGame(gameDetails);
      } catch (err) {
        if (!isActive) {
          return;
        }

        const errorMessage =
          err?.response?.data?.detail ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to load game details. Please try again.";

        setError(errorMessage);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isActive = false;
    };
  }, [id, retryCount]);

  if (loading) {
    return <div>Loading...</div>;
  }

  else if (error) {
    return (
      <div>
        <p>Error: {error}</p>
        <button type="button" onClick={() => setRetryCount((count) => count + 1)}>
          Try Again
        </button>
      </div>
    );
  }

  else if (!game) {
    return <div>No game details found.</div>;
  }
  else {
    return (
      <PageShell title={`${game.name}`} subtitle={`Developer: ${developers.join(", ") || "Unknown"}`}>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button type="button" onClick={handleBackClick} className="rounded-md bg-gray-700 px-4 py-2">
            Back
          </Button>
          <Button
            type="button"
            onClick={handleLibraryClick}
            disabled={savingLibrary || isSaved}
            className="rounded-md bg-purple-500 px-4 py-2 disabled:opacity-50"
          >
            {savingLibrary ? "Saving..." : isSaved ? "Added to Library" : "Add to Library"}
          </Button>
        </div>
        {libraryMessage.text ? (
          <Typography className={`text-center text-sm ${messageStyles[libraryMessage.type] || "text-black"}`}>
            {libraryMessage.text}
          </Typography>
        ) : null}
        <DisplayDetail game={game} />
      </PageShell>
    );
  }
}

const messageStyles = {
  success: "text-green-700",
  error: "text-red-700",
  info: "text-blue-700",
};