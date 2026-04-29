import axios from "axios";

const tokenKey = "token";

export const api = axios.create({
  baseURL: "/api/v1/",
});

function getStoredToken() {
  return localStorage.getItem(tokenKey);
}

function setAuthHeader(token) {
  api.defaults.headers.common.Authorization = `Token ${token}`;
}

function clearAuthHeader() {
  delete api.defaults.headers.common.Authorization;
}

export function keepSession(token) {
  localStorage.setItem(tokenKey, token);
  setAuthHeader(token);
}

function clearSession() {
  localStorage.removeItem(tokenKey);
  clearAuthHeader();
}

function createAuthenticatedUser(data) {
  keepSession(data.token);
  return normalizeUser(data);
}

function normalizeUser(data) {
  return {
    email: data.email,
    username: data.username,
  };
}

async function authenticateUser(path, formData, successStatus) {
  const response = await api.post(path, formData);

  if (response.status === successStatus) {
    return createAuthenticatedUser(response.data);
  }

  return null;
}

export async function userVerify() {
  const token = getStoredToken();

  if (!token) {
    clearAuthHeader();
    return null;
  }

  setAuthHeader(token);

  try {
    const response = await api.get("users/");

    return response.status === 200 ? normalizeUser(response.data) : null;
  } catch (error) {
    clearSession();
    return null;
  }
}

export async function handleSignIn(formData) {
  return authenticateUser("users/login/", formData, 200);
}

export async function handleSignUp(formData) {
  return authenticateUser("users/create/", formData, 201);
}

export async function handleSignOut() {
  try {
    await api.post("users/logout/");
  } catch (error) {
    // Ignore logout request failures and still clear local session.
  } finally {
    clearSession();
  }
}

function traitsToPersonalityTags(vibeTraits = []) {
  if (!Array.isArray(vibeTraits)) {
    return [];
  }

  return [...new Set(
    vibeTraits
      .filter((trait) => typeof trait === "string" && trait.trim().length > 0)
      .map((trait) => trait.trim().toLowerCase().replace(/\s+/g, "-"))
  )];
}

export async function saveQuizResult({ personality, quizResult, vibeTraits = [] }) {
  const personalityTags = traitsToPersonalityTags(vibeTraits);

  const response = await api.put("profile/", { 
    personality,
    quiz_results: quizResult,
    vibe_traits: Array.isArray(vibeTraits) ? vibeTraits : [],
    personality_tags: personalityTags,
  });

  return response.data;
}

export async function updateProfile({ personality, personalityTags, quizResults, playTimePreference, genreTags, platformTags, excludedTags }) {
  const response = await api.put("profile/", { 
    personality, 
    personality_tags: personalityTags, 
    quiz_results: quizResults, 
    play_time_preference: playTimePreference,
    genre_tags: genreTags,
    platform_tags: platformTags,
    excluded_tags: excludedTags,
  });
  return response.data;
}

export async function deleteProfile() {
  const response = await api.delete("profile/");
  return response.data;
}

// Utility function to build query parameters for recommendations based on profile data that will work with RAWG and my backend.
export function recommendedParams(personalityTags = [], playTimePreference = "", genreTags = [], platformTags = [], excludedTags = []) {
  const params = {};

  const normalizedPersonalityTags = Array.isArray(personalityTags)
  // Filter out non-string, empty, or whitespace-only tags, then normalize and deduplicate.
    ? [...new Set(
        personalityTags
          .filter((tag) => typeof tag === "string" && tag.trim().length > 0)
          .map((tag) => tag.trim().toLowerCase().replace(/\s+/g, "-"))
      )]
    : [];

  if (normalizedPersonalityTags.length > 0) {
    params.personality_tags = normalizedPersonalityTags.join(",");
  }

  const normalizedPlayTime =
    typeof playTimePreference === "string" ? playTimePreference.trim() : "";

  if (normalizedPlayTime) {
    params.play_time_preference = normalizedPlayTime;
  }

  const normalizedGenreTags = Array.isArray(genreTags)
    ? genreTags
        .filter((tag) => typeof tag === "string" && tag.trim().length > 0)
        .map((tag) => tag.trim().toLowerCase().replace(/\s+/g, "-"))
    : [];

  if (normalizedGenreTags.length > 0) {
    params.genre_tags = normalizedGenreTags.join(",");
  }

  const normalizedPlatformTags = Array.isArray(platformTags)
    ? platformTags
        .filter((tag) => typeof tag === "string" && tag.trim().length > 0)
        .map((tag) => tag.trim().toLowerCase().replace(/\s+/g, "-"))
    : [];

  if (normalizedPlatformTags.length > 0) {
    params.platform_tags = normalizedPlatformTags.join(",");
  }

  const normalizedExcludedTags = Array.isArray(excludedTags)
    ? excludedTags
        .filter((tag) => typeof tag === "string" && tag.trim().length > 0)
        .map((tag) => tag.trim().toLowerCase().replace(/\s+/g, "-"))
    : [];

  if (normalizedExcludedTags.length > 0) {
    params.excluded_tags = normalizedExcludedTags.join(",");
  }

  return params;
}

export async function fetchRecommendedGames(personalityTags = [], playTimePreference = "", genreTags = [], platformTags = [], excludedTags = []) {
  const params = recommendedParams(personalityTags, playTimePreference, genreTags, platformTags, excludedTags);
  const response = await api.get("games/recommended/", { params });
  return response.data;
}

export async function fetchNewReleases(page = 1) {
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const toDate = today.toISOString().split("T")[0];
  const fromDate = thirtyDaysAgo.toISOString().split("T")[0];

  const response = await api.get("games/rawg/", {
    params: {
      ordering: "-released",
      dates: `${fromDate},${toDate}`,
      page,
      page_size: 12,
    },
  });
  return response.data;
}

export async function fetchFeaturedGames(page = 1) {
  const response = await api.get("games/rawg/", {
    params: {
      ordering: "-rating_top",
      dates: "2026-01-01,2026-12-31",
      page,
      page_size: 6,
    },
  });
  return response.data;
}

export async function fetchRAWGGames(searchTerm = "", genre = "", platform = "", page = 1, pageSize = 12, ordering = "-released,-rating_top") {
  const params = {
    page,
    page_size: pageSize,
    ordering,
  };
  
  searchTerm = searchTerm.trim();
  genre = genre.trim();
  platform = platform.trim();

  if (searchTerm !== "") {
    params.search = searchTerm;
  }
  if (genre !== "") {
      params.genres = genre;
  }
  if (platform !== "") {
      params.platforms = platform;
    }
  
  const response = await api.get("games/rawg/", {
    params,
  });
  return response.data;
}


export async function fetchGameDetails(gameId) {
  const response = await api.get(`games/rawg/${gameId}/`);
  return response.data;
}

export async function fetchVibeExplanation({ gameName, genres = [], personality = "", personalityTags = [] }) {
  const response = await api.post("vibes/explain/", {
    game_name: gameName,
    genres,
    personality,
    personality_tags: personalityTags,
  });
  return response.data.explanation;
}

async function ensureGameRecord(rawgGame) {
  const externalId = rawgGame?.id;
  if (externalId === undefined || externalId === null) {
    throw new Error("Game is missing an id and cannot be saved.");
  }

  const normalizedGenres = Array.isArray(rawgGame?.genres)
    ? rawgGame.genres
        .map((genre) => {
          if (typeof genre === "string") return genre;
          if (genre && typeof genre === "object") return genre.name || "";
          return "";
        })
        .filter((genre) => typeof genre === "string" && genre.trim().length > 0)
    : [];

  const primaryGenre = normalizedGenres.length > 0 ? normalizedGenres[0] : "";

  const normalizedPlatforms = Array.isArray(rawgGame?.platforms)
    ? rawgGame.platforms
        .map((platform) => {
          if (typeof platform === "string") return platform;
          if (platform && typeof platform === "object") {
            if (typeof platform.name === "string") return platform.name;
            if (platform.platform && typeof platform.platform === "object") {
              return platform.platform.name || "";
            }
          }
          return "";
        })
        .filter((platform) => typeof platform === "string" && platform.trim().length > 0)
    : [];

  const response = await api.post("games/", {
    source: "rawg",
    external_id: String(externalId),
    slug: rawgGame.slug || "",
    title: rawgGame.name || "",
    description: rawgGame.description_raw || "",
    genre: primaryGenre,
    tags: normalizedGenres,
    playtime: rawgGame.playtime || null,
    image_url: rawgGame.background_image || "",
    released_at: rawgGame.released || null,
    metadata: {
      rawg_rating: rawgGame.rating || null,
      platforms: normalizedPlatforms,
    },
  });

  return response.data;
}

export async function addToLibrary(rawgGame) {
  const game = await ensureGameRecord(rawgGame);

  const saveCheckResponse = await api.get(`games/save/${game.id}/`);
  if (saveCheckResponse.data.saved) {
    return {
      alreadySaved: true,
      game,
      savedGame: saveCheckResponse.data.saved_game || null,
    };
  }

  const saveResponse = await api.post(`games/save/${game.id}/`);
  return {
    alreadySaved: false,
    game,
    result: saveResponse.data,
    savedGame: saveResponse.data.saved_game || null,
  };
}

export async function fetchLibrary() {
  const response = await api.get("games/saved/");
  return response.data;
}

export async function updateSavedGameStatus(gameId, status) {
  const response = await api.put(`games/save/${gameId}/`, { status });
  return response.data;
}

export async function removeFromLibrary(gameId) {
  const response = await api.delete(`games/save/${gameId}/`);
  return response.data;
}