import { Card, CardHeader, CardBody } from "@material-tailwind/react";
import SectionCard from "./layout/SectionCard";
import imageNotFound from "../assets/image-not-found.jpg";

function getNameList(items, nestedKey = null) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }

      if (!item || typeof item !== "object") {
        return null;
      }

      if (nestedKey && item[nestedKey] && typeof item[nestedKey] === "object") {
        return item[nestedKey].name || null;
      }

      return item.name || null;
    })
    .filter(Boolean);
}

function stripHtml(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/<[^>]*>/g, "").trim();
}

export default function DisplayDetail({ game }) {
  const descriptionText = stripHtml(game.description) || "No description available";
  const esrbRating =
    typeof game.esrb_rating === "string" ? game.esrb_rating : game.esrb_rating?.name || "Unknown";
  const genres = getNameList(game.genres);
  const platforms = getNameList(game.platforms, "platform");
  const stores = getNameList(game.stores, "store");
  const gameBackgroundImage = game?.background_image || imageNotFound;

  return (
    <Card className="overflow-hidden">
        <CardHeader floated={false} shadow={false} className="m-0 rounded-none">
            <img
              src={gameBackgroundImage}
              alt={game.name}
              className="w-full"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = imageNotFound;
              }}
            />
        </CardHeader>
        <CardBody>
            <h1>{game.name}</h1>
            <p>Released: {game.released || "Unknown"}</p>
            <SectionCard title="Description">
            <p>Description: {descriptionText}</p>
            </SectionCard>
            <SectionCard title="Ratings">
            <p>ESRB Rating: {esrbRating}</p>
            <p>Rating: {game.rating || "N/A"}</p>
            </SectionCard>
            <SectionCard title="Details">
            <p>Genres: {genres.join(", ") || "Unknown"}</p>
            <p>Platforms: {platforms.join(", ") || "Unknown"}</p>
            <p>Where to Play: {stores.join(", ") || "Unknown"}</p>
            </SectionCard>
        </CardBody>
    </Card>
  );
}
    