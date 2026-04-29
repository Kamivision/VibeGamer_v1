import { useCallback, useEffect, useState } from "react";
import { Outlet, useLoaderData } from "react-router-dom";
import NavBar from "./components/NavBar";
import { fetchLibrary } from "./utilities";

export default function App() {
  const initialUser = useLoaderData();
  const [user, setUser] = useState(initialUser);
  const [libraryLookup, setLibraryLookup] = useState({});

  const resolveExternalId = useCallback((game) => {
    if (!game || typeof game !== "object") return "";

    if (game.external_id !== undefined && game.external_id !== null) {
      return String(game.external_id);
    }

    if (game.externalId !== undefined && game.externalId !== null) {
      return String(game.externalId);
    }

    if (game.id !== undefined && game.id !== null) {
      return String(game.id);
    }

    return "";
  }, []);

  useEffect(() => {
    if (!user) {
      setLibraryLookup({});
      return;
    }

    let isMounted = true;

    async function loadLibraryLookup() {
      try {
        const data = await fetchLibrary();
        if (!isMounted) return;

        const nextLookup = {};
        const savedItems = Array.isArray(data) ? data : [];

        savedItems.forEach((savedItem) => {
          const game = savedItem?.game || {};
          const externalId =
            game.external_id !== undefined && game.external_id !== null
              ? String(game.external_id)
              : "";

          if (!externalId) return;

          nextLookup[externalId] = {
            libraryGameId: game.id || null,
            status: savedItem?.status || "saved",
          };
        });

        setLibraryLookup(nextLookup);
      } catch {
        if (isMounted) {
          setLibraryLookup({});
        }
      }
    }

    loadLibraryLookup();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const isGameInLibrary = useCallback(
    (game) => {
      const externalId = resolveExternalId(game);
      if (!externalId) {
        return Boolean(game?.libraryGameId);
      }
      return Object.prototype.hasOwnProperty.call(libraryLookup, externalId);
    },
    [libraryLookup, resolveExternalId]
  );

  const getLibraryGameIdForGame = useCallback(
    (game) => {
      const externalId = resolveExternalId(game);
      if (!externalId) {
        return game?.libraryGameId || null;
      }
      return libraryLookup[externalId]?.libraryGameId || game?.libraryGameId || null;
    },
    [libraryLookup, resolveExternalId]
  );

  const getLibraryStatusForGame = useCallback(
    (game) => {
      const externalId = resolveExternalId(game);
      if (!externalId) {
        return game?.savedStatus || null;
      }
      return libraryLookup[externalId]?.status || game?.savedStatus || null;
    },
    [libraryLookup, resolveExternalId]
  );

  const registerLibraryGame = useCallback(
    (game, libraryGameId, status = "saved") => {
      const externalId = resolveExternalId(game);
      if (!externalId) return;

      setLibraryLookup((currentLookup) => ({
        ...currentLookup,
        [externalId]: {
          libraryGameId:
            libraryGameId || currentLookup[externalId]?.libraryGameId || game?.libraryGameId || null,
          status: status || currentLookup[externalId]?.status || game?.savedStatus || "saved",
        },
      }));
    },
    [resolveExternalId]
  );

  const updateLibraryGameStatus = useCallback(
    (game, status) => {
      const externalId = resolveExternalId(game);
      if (!externalId) return;

      setLibraryLookup((currentLookup) => {
        const currentEntry = currentLookup[externalId];
        if (!currentEntry) {
          return currentLookup;
        }

        return {
          ...currentLookup,
          [externalId]: {
            ...currentEntry,
            status,
          },
        };
      });
    },
    [resolveExternalId]
  );

  const unregisterLibraryGame = useCallback(
    (game) => {
      const externalId = resolveExternalId(game);
      if (!externalId) return;

      setLibraryLookup((currentLookup) => {
        if (!Object.prototype.hasOwnProperty.call(currentLookup, externalId)) {
          return currentLookup;
        }

        const nextLookup = { ...currentLookup };
        delete nextLookup[externalId];
        return nextLookup;
      });
    },
    [resolveExternalId]
  );

  return (
    <div className="bg-[url('/src/assets/background.png')] bg-center bg-fixed min-h-screen">
      <NavBar user={user} setUser={setUser} />
      <main className="mx-auto mt-8 w-full max-w-6xl rounded-lg bg-gradient-to-r from-purple-700 to-pink-500 px-4 shadow-lg">
        <Outlet
          context={{
            user,
            setUser,
            isGameInLibrary,
            getLibraryGameIdForGame,
            getLibraryStatusForGame,
            registerLibraryGame,
            updateLibraryGameStatus,
            unregisterLibraryGame,
          }}
        />
      </main>
    </div>
  );
}
