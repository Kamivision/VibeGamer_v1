import React, { useState, useEffect } from "react";
import { Navigate, useNavigate, useOutletContext } from "react-router-dom";
import { Card, CardBody, Typography } from "@material-tailwind/react";
import { UserCircleIcon as DefaultAvatar } from "@heroicons/react/24/outline";
import logoImage from "../assets/logo.jpg";
import { updateProfile, deleteProfile, handleSignOut, api } from "../utilities";
import BannerCard from "../components/layout/BannerCard";
import PageShell from "../components/layout/PageShell";
import SectionCard from "../components/layout/SectionCard";
import { sharedStyles } from "../styles/sharedStyles";

// Helper function: turn raw API data into profile
function buildProfile(data) {
  return {
    personality: data.personality || null,
    vibe_traits: data.vibe_traits || [],
    play_time_preference: data.play_time_preference || null,
    personality_tags: data.personality_tags || [],
    genre_tags: data.genre_tags || [],
    platform_tags: data.platform_tags || [],
    excluded_tags: data.excluded_tags || [],
    quiz_results: data.quiz_results || null,

  };
}

// Helper function to update one field at a time
function setField(draft, field, value) {
  return { ...draft, [field]: value };
}

// Helper function for tags input
function parseTags(raw) {
  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export default function UserProfile() {
  const { user, setUser } = useOutletContext();
  const navigate = useNavigate();

  // "loading" | "viewing" | "editing" | "saving" | "error"
  const [state, setState] = useState("loading");
  const [error, setError] = useState(null);

  // Profile data from API
  const [profile, setProfile] = useState({
    personality: null,
    vibe_traits: [],
    play_time_preference: null,
    personality_tags: [],
    genre_tags: [],
    platform_tags: [],
    excluded_tags: [],
    quiz_results: null,
  });

  // Profile data: temporary edits (only exists in edit mode)
  const [draftProfile, setDraftProfile] = useState(null);

  // Local state for the tags input field (comma-separated string)
  const [tagText, setTagText] = useState("");
  const [excludedTagText, setExcludedTagText] = useState("");
  const [tagOptions, setTagOptions] = useState({ genre_tags: [], platform_tags: [] });
  const [isDeletingProfile, setIsDeletingProfile] = useState(false);

  // Fetch profile on mount
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      setState("loading");
      setError(null);
      try {
        const [profileResponse, optionsResponse] = await Promise.all([
          api.get("profile/"),
          api.get("profile/options/"),
        ]);
        setProfile(buildProfile(profileResponse.data));
        setTagOptions({
          genre_tags: optionsResponse.data.genre_tags || [],
          platform_tags: optionsResponse.data.platform_tags || [],
        });
        setState("viewing");
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load profile");
        setState("error");
      }
    };

    fetchProfile();
  }, [user]);

  // Redirect guests away from this page
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Event Handlers

  // Start editing with current profile data
  function handleEditProfile() {
    setDraftProfile({ ...profile, personality_tags: [...profile.personality_tags], genre_tags: [...profile.genre_tags], platform_tags: [...profile.platform_tags], excluded_tags: [...profile.excluded_tags] });
    setTagText((profile.personality_tags || []).join(", "));
    setExcludedTagText((profile.excluded_tags || []).join(", "));
    setError(null);
    setState("editing");
  }

  // Discard changes and go back to view mode
  function handleCancelEdit() {
    setTagText("");
    setDraftProfile(null);
    setError(null);
    setState("viewing");
  }

  // Update one field in the draft while the user types
  function handleDraftChange(field, value) {
    setDraftProfile((prev) => setField(prev, field, value));
  }

  // Toggle Helper function for multi-select tags
  function toggleTag(field, tag) {
    setDraftProfile((prev) => {
      if (!prev) return prev;

      const currentTags = Array.isArray(prev[field]) ? prev[field] : [];
      const hasTag = currentTags.includes(tag);
      const newtags = hasTag ? currentTags.filter((t) => t !== tag) : [...currentTags, tag];

      return setField(prev, field, newtags);
    });
    }

  // Tags arrive as a comma string from the input need to parse before storing
  function handleTagsChange(raw) {
    setTagText(raw);
    setDraftProfile((prev) => setField(prev, "personality_tags", parseTags(raw)));
  }

  function handleExcludedTagsChange(raw) {
    setExcludedTagText(raw);
    setDraftProfile((prev) => setField(prev, "excluded_tags", parseTags(raw)));
  }

  // Send the draft to the server and update saved profile on success
  async function handleSaveProfile() {
    setState("saving");
    setError(null);
    const cleanTags = parseTags(tagText);
    const cleanExcludedTags = parseTags(excludedTagText);
    try {
      const saved = await updateProfile({
        personality: draftProfile.personality,
        personalityTags: cleanTags,
        excludedTags: cleanExcludedTags,
        genreTags: draftProfile.genre_tags,
        platformTags: draftProfile.platform_tags,
        quizResults: draftProfile.quiz_results,
        playTimePreference: draftProfile.play_time_preference,
      });
      setProfile(buildProfile(saved));
      setTagText("");
      setExcludedTagText("");
      setDraftProfile(null);
      setState("viewing");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save profile");
      // Stay in editing so the user can fix the problem
      setState("editing");
    }
  }

  async function handleDeleteProfile() {
    const shouldDelete = window.confirm(
      "Are you sure you want to delete your profile? This action cannot be undone."
    );

    if (!shouldDelete) {
      return;
    }

    setIsDeletingProfile(true);
    setError(null);

    try {
      await deleteProfile();
      await handleSignOut();
      setUser(null);
      navigate("/auth", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete your profile");
      setIsDeletingProfile(false);
    }
  }



  // True while the inline form should be visible
  const isEditing = state === "editing" || state === "saving";

  // True while a save request is in flight — used to disable buttons
  const isSaving = state === "saving";

  // The data to show inside the cards (draft during edit, saved otherwise)
  const shown = isEditing ? draftProfile : profile;



  // Show loading state
  if (state === "loading") {
    return (
      <PageShell>
        <Typography variant="h5">Loading profile...</Typography>
      </PageShell>
    );
  }

  // Show error state (only shown on initial load failure — save errors stay inline)
  if (state === "error" && !draftProfile) {
    return (
      <PageShell>
        <Card className="border border-red-300 bg-red-50">
          <CardBody>
            <Typography color="red" variant="h5">
              Error
            </Typography>
            <Typography color="red" variant="paragraph">
              {error}
            </Typography>
          </CardBody>
        </Card>
      </PageShell>
    );
  }

  // Main profile page

  return (
    <PageShell>
      <BannerCard
        title={`${user.username}'s Profile`}
        imageSrc={logoImage}
        imageAlt="profile banner"
      >
        <div className="flex flex-col gap-8">

          {/* Avatar, name, email, and action buttons */}
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className={sharedStyles.avatarWrap}>
                <DefaultAvatar className={sharedStyles.avatarIcon} />
              </div>

              <div>
                <Typography color="blue-gray" variant="h6">
                  {user.username}
                </Typography>
                <Typography variant="small" className={sharedStyles.mutedText}>
                  {user.email}
                </Typography>
              </div>
            </div>

            {/* Buttons swap between view mode and edit mode */}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className={sharedStyles.actionBtn}
                onClick={() => navigate("/library")}
              >
                View Library
              </button>

              {!isEditing ? (
                <button
                  type="button"
                  className={sharedStyles.actionBtn}
                  onClick={handleEditProfile}
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className={sharedStyles.actionBtn}
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>

                  <button
                    type="button"
                    className={sharedStyles.cancelBtn}
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                </>
              )}

              <button
                type="button"
                className={sharedStyles.actionBtn}
                onClick={() => navigate("/recommended")}
              >
                View Recommendations
              </button>

              {!isEditing ? (
                <button
                  type="button"
                  className={sharedStyles.dangerBtn}
                  onClick={handleDeleteProfile}
                  disabled={isDeletingProfile}
                >
                  {isDeletingProfile ? "Deleting Profile..." : "Delete Profile"}
                </button>
              ) : null}
            </div>
          </div>

          {/* Inline save error shown only during editing */}
          {isEditing && error ? (
            <Typography variant="small" className="text-left text-sm text-red-600">
              {error}
            </Typography>
          ) : null}
        </div>
      </BannerCard>

      {/* ── Your Vibes card: shows personality and personality tags, editable inline ───── */}
      <SectionCard title="Your Vibes">
        {!isEditing ? (
          <>
            <p>Personality: {profile.personality || "Not set"}</p>
            <p>
              Vibe Traits:{" "}
              {Array.isArray(profile.vibe_traits) && profile.vibe_traits.length > 0
                ? profile.vibe_traits.join(", ")
                : "Not set"}
            </p>
            <p>
              Tags:{" "}
              {profile.personality_tags.length > 0
                ? profile.personality_tags.join(", ")
                : "Not set"}
            </p>
          </>
        ) : (
          <div className="flex flex-col gap-4 text-left">
            <div className="flex flex-col gap-1">
              <label htmlFor="personality" className="text-sm font-medium text-gray-700">
                Personality
              </label>
              <input
                id="personality"
                type="text"
                className={sharedStyles.input}
                value={shown?.personality || ""}
                onChange={(e) => handleDraftChange("personality", e.target.value)}
                placeholder="e.g. Cozy Explorer"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="tags" className="text-sm font-medium text-gray-700">
                Vibe Tags
              </label>
              <input
                id="tags"
                type="text"
                className={sharedStyles.input}
                value={tagText}
                onChange={(e) => handleTagsChange(e.target.value)}
                placeholder="cozy, story-rich, atmospheric"
              />
              <span className="text-xs text-gray-500">Separate tags with commas.</span>
            </div>
          </div>
        )}
      </SectionCard>

      {/* ── Your Style card: shows play-time preference, style/genre tags, platforms used, and excluded tags, editable inline ───── */}
      <SectionCard title="Your Style">
        {!isEditing ? (
          <>
            <p>Play Time: {profile.play_time_preference || "Not set"}</p>
            <p>
              Excluded Tags:{" "}
              {profile.excluded_tags.length > 0
                ? profile.excluded_tags.join(", ")
                : "Not set"}
            </p>
            <p>
              Genres:{" "}
              {profile.genre_tags.length > 0
                ? profile.genre_tags.join(", ")
                : "Not set"}
            </p>
            <p>
              Platforms:{" "}
              {profile.platform_tags.length > 0
                ? profile.platform_tags.join(", ")
                : "Not set"}
            </p>
          </>
        ) : (
          <div className="flex flex-col gap-4 text-left">
            <div className="flex flex-col gap-1">
              <label htmlFor="play-time" className="text-sm font-medium text-gray-700">
                Play Time Preference
              </label>
              <select
                id="play-time"
                className={sharedStyles.input}
                value={shown?.play_time_preference || ""}
                onChange={(e) => handleDraftChange("play_time_preference", e.target.value)}
              >
                <option value="">Select a preference</option>
                <option value="quick">Quick (under 30 min)</option>
                <option value="short"> Short (up to 1 hour)</option>
                <option value="medium"> Medium (up to 2 hours)</option>
                <option value="long"> Long (up to 4 hours)</option>
                <option value="epic"> Epic (4 hours+)</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-gray-700">Preferred Genres</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {tagOptions.genre_tags.map((genre) => (
                  <label key={genre} className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={(shown?.genre_tags || []).includes(genre)}
                      onChange={() => toggleTag("genre_tags", genre)}
                    />
                    <span>{genre}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-gray-700">Preferred Platforms</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {tagOptions.platform_tags.map((platform) => (
                  <label key={platform} className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={(shown?.platform_tags || []).includes(platform)}
                      onChange={() => toggleTag("platform_tags", platform)}
                    />
                    <span>{platform}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="excluded-tags" className="text-sm font-medium text-gray-700">
                Excluded Tags
              </label>
              <input
                id="excluded-tags"
                type="text"
                className={sharedStyles.input}
                value={excludedTagText}
                onChange={(e) => handleExcludedTagsChange(e.target.value)}
                placeholder="e.g. horror, competitive, pixel graphics"
              />
              <span className="text-xs text-gray-500">Games with these tags will be excluded from your recommendations. Separate tags with commas.</span>
            </div> 
          </div>
        )}
      </SectionCard>

      {/* ── Recent Games card: placeholder until game history is built ──────── */}
      {/* <SectionCard title="Recent Games">
        <p>Placeholder for recent games.</p>
      </SectionCard> */}
    </PageShell>
  );
}

