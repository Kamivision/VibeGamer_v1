import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Button,
} from "@material-tailwind/react";
import { fetchVibeExplanation, addToLibrary, removeFromLibrary, updateSavedGameStatus } from "../utilities";
import { useNavigate } from "react-router-dom";
import imageNotFound from "../assets/image-not-found.jpg";


// showWhyButton is a new prop (true/false). When it is true, the "Why this game?" button
// will be displayed on the card. When it is false or not provided, the button is hidden.
// This lets us reuse GameCard everywhere but only show that button on the Recommendations page.
export default function GameCard({
  game,
  user,
  onRemoveFromLibrary,
  showWhyButton,
  isGameInLibrary,
  getLibraryGameIdForGame,
  getLibraryStatusForGame,
  registerLibraryGame,
  updateLibraryGameStatus,
  unregisterLibraryGame,
}) {
  const [explanation, setExplanation] = useState("");
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [savingLibrary, setSavingLibrary] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [libraryMessage, setLibraryMessage] = useState({ text: "", type: "" });
  const [isSaved, setIsSaved] = useState(Boolean(game?.libraryGameId));
  const [savedLibraryGameId, setSavedLibraryGameId] = useState(game?.libraryGameId || null);
  const [savedStatus, setSavedStatus] = useState(game?.savedStatus || "saved");
  const navigate = useNavigate();

  const isSharedSaved =
    typeof isGameInLibrary === "function" ? isGameInLibrary(game) : Boolean(game?.libraryGameId);

  const sharedLibraryGameId =
    typeof getLibraryGameIdForGame === "function"
      ? getLibraryGameIdForGame(game)
      : game?.libraryGameId || null;

  const sharedSavedStatus =
    typeof getLibraryStatusForGame === "function"
      ? getLibraryStatusForGame(game)
      : game?.savedStatus || null;

  useEffect(() => {
    setIsSaved(Boolean(isSharedSaved));
  }, [isSharedSaved]);

  useEffect(() => {
    setSavedLibraryGameId(sharedLibraryGameId || null);
  }, [sharedLibraryGameId]);

  useEffect(() => {
    if (!isSaved) {
      setSavedStatus("saved");
      return;
    }

    setSavedStatus(sharedSavedStatus || game?.savedStatus || "saved");
  }, [game?.savedStatus, isSaved, sharedSavedStatus]);

  async function handleWhyClick() {
    if (explanation) return;
    setLoadingExplanation(true);
    try {
      const text = await fetchVibeExplanation({
        gameName: game.name,
        genres: game.genres || [],
        personality: user?.personality || "",
        personalityTags: user?.personality_tags || [],
      });
      setExplanation(text);
    } catch {
      setExplanation("Could not load explanation right now.");
    } finally {
      setLoadingExplanation(false);
    }
  }

  function handleMoreClick() {
    navigate(`/game/${game.id}`);
  }

  async function handleLibraryClick() {
    setSavingLibrary(true);
    setLibraryMessage({ text: "", type: "" });

    try {
      const result = await addToLibrary(game);
      const nextStatus = result?.savedGame?.status || "saved";
      const libraryGameId = result?.game?.id || null;

      if (result.alreadySaved) {
        setIsSaved(true);
        setSavedLibraryGameId(libraryGameId);
        setSavedStatus(nextStatus);
        if (registerLibraryGame) {
          registerLibraryGame(game, libraryGameId, nextStatus);
        }
        setLibraryMessage({ text: "Game is already in your library.", type: "info" });
      } else {
        setIsSaved(true);
        setSavedLibraryGameId(libraryGameId);
        setSavedStatus(nextStatus);
        if (registerLibraryGame) {
          registerLibraryGame(game, libraryGameId, nextStatus);
        }
        setLibraryMessage({ text: "Game added to your library!", type: "success" });
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        setLibraryMessage({ text: "Please sign in to save games.", type: "error" });
      } else {
        const detail =
          error?.response?.data?.detail ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to add game to library.";
        setLibraryMessage({ text: detail, type: "error" });
      }
    } finally {
      setSavingLibrary(false);
    }
  }

  async function handleRemoveLibraryClick() {
    const libraryGameId =
      savedLibraryGameId ||
      (typeof getLibraryGameIdForGame === "function" ? getLibraryGameIdForGame(game) : null) ||
      game?.libraryGameId ||
      null;

    if (!libraryGameId) {
      setLibraryMessage({ text: "Could not find this saved game in your library.", type: "error" });
      return;
    }

    setSavingLibrary(true);
    setLibraryMessage({ text: "", type: "" });

    try {
      await removeFromLibrary(libraryGameId);
      setIsSaved(false);
      setSavedLibraryGameId(null);
      setSavedStatus("saved");
      if (unregisterLibraryGame) {
        unregisterLibraryGame(game);
      }
      setLibraryMessage({ text: "Game removed from your library.", type: "success" });

      if (onRemoveFromLibrary) {
        onRemoveFromLibrary(libraryGameId);
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        setLibraryMessage({ text: "Please sign in to manage your library.", type: "error" });
      } else {
        setLibraryMessage({ text: "Failed to remove game from library.", type: "error" });
      }
    } finally {
      setSavingLibrary(false);
    }
  }

  async function handleStatusChange(event) {
    const nextStatus = event.target.value;
    const libraryGameId =
      savedLibraryGameId ||
      (typeof getLibraryGameIdForGame === "function" ? getLibraryGameIdForGame(game) : null) ||
      game?.libraryGameId ||
      null;

    if (!libraryGameId) {
      setLibraryMessage({ text: "Save this game before updating its status.", type: "error" });
      return;
    }

    setIsUpdatingStatus(true);
    setLibraryMessage({ text: "", type: "" });

    try {
      const updatedSavedGame = await updateSavedGameStatus(libraryGameId, nextStatus);
      setSavedStatus(updatedSavedGame.status || nextStatus);

      if (updateLibraryGameStatus) {
        updateLibraryGameStatus(game, updatedSavedGame.status || nextStatus);
      }
    } catch (error) {
      const detail =
        error?.response?.data?.status?.[0] ||
        error?.response?.data?.detail ||
        error?.message ||
        "Failed to update game status.";

      setLibraryMessage({ text: detail, type: "error" });
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  const gameBackgroundImage = game?.background_image || imageNotFound;

  return (
    <Card className="overflow-hidden">
      <CardHeader floated={false} shadow={false} className="m-0 rounded-none">
        <img
          src={gameBackgroundImage}
          alt={game.name}
          className="w-full h-48 object-cover"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = imageNotFound;
          }}
        />
      </CardHeader>
      <CardBody>
        <Typography variant="h5">{game.name}</Typography>
        <Typography className={cardStyle.desc}>Released: {game.released || "Unknown"}</Typography>
        <Typography className={cardStyle.desc}>Rating: {game.rating || "N/A"}</Typography>
        <Typography className={cardStyle.desc}>Genres: {game.genres?.join(", ") || "Unknown"}</Typography>
        <Typography className={cardStyle.desc}>Platforms: {game.platforms?.join(", ") || "Unknown"}</Typography>
        {explanation ? (
          <Typography className="mt-2 text-lg text-black">{explanation}</Typography>
        ) : null}
        {isSaved ? (
          <div className="mt-4 flex flex-col gap-2">
            <label htmlFor={`saved-status-${game.id}`} className="text-sm font-medium text-gray-700">
              Library Status
            </label>
            <select
              id={`saved-status-${game.id}`}
              value={savedStatus}
              onChange={handleStatusChange}
              disabled={savingLibrary || isUpdatingStatus}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="saved">Saved</option>
              <option value="playing">Playing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        ) : null}
      </CardBody>
      <CardFooter className={cardStyle.footer}>
        {/* Only render the "Why this game?" button when showWhyButton is true.
            The double exclamation mark (!!) turns the value into a strict true/false boolean.
            So if showWhyButton is undefined (not passed at all), !!undefined === false, and the button stays hidden. */}
        {!!showWhyButton ? (
          <Button
            size="sm"
            className={explanation ? cardStyle.btnActive : cardStyle.btn}
            onClick={handleWhyClick}
            disabled={loadingExplanation || !!explanation}
          >
            {loadingExplanation ? "Loading..." : "Why this game?"}
          </Button>
        ) : null}
        <Button
        onClick={handleMoreClick} 
        size="sm" 
        className={cardStyle.btn}>View More</Button>
        {isSaved ? (
          <Button          
          size="sm" 
          className={cardStyle.btnActive}
          onClick={handleRemoveLibraryClick}
          disabled={savingLibrary}
          >{savingLibrary ? "Removing..." : "Remove from Library"}</Button>
        ) : 
        <Button
        onClick={handleLibraryClick} 
        size="sm" 
        className={cardStyle.btn}
        disabled={savingLibrary}
        >{savingLibrary ? "Saving..." : "Add to Library"}</Button>}
      </CardFooter>
      {libraryMessage.text ? (
        <Typography className={cardStyle[libraryMessage.type]}>
          {libraryMessage.text}
        </Typography>
      ) : null}
    </Card>
  );
}


const cardStyle = {
  desc: "text-sm text-gray-600",
  btn: "rounded-md bg-purple-500 px-4 py-2 disabled:opacity-50",
  btnActive: "rounded-md bg-cyan-600 px-4 py-2 disabled:opacity-50",
  footer: "pt-0 flex justify-center items-center gap-2",
  success: "px-4 pb-4 text-sm text-green-700",
  error: "px-4 pb-4 text-sm text-red-700",
  info: "px-4 pb-4 text-sm text-blue-700",
};
