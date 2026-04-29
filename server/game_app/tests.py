from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase
from unittest.mock import Mock, patch

from user_app.models import User
from game_app.models import Game, SavedGame
from profile_app.models import Profile


class SavedGameTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="saved@example.com",
            username="saveduser",
            password="password123",
        )
        self.token = Token.objects.create(user=self.user)

        self.game = Game.objects.create(
            source="rawg",
            external_id="3498",
            slug="grand-theft-auto-v",
            title="Grand Theft Auto V",
            description="Open-world action game",
            genre="Action",
            tags=["open-world", "action"],
            playtime=35,
            image_url="https://example.com/game.jpg",
            metadata={"rating": 4.5},
        )

        self.saved_list_url = "/api/v1/games/saved/"
        self.save_url = f"/api/v1/games/save/{self.game.id}/" # type: ignore

    def authenticate(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")

    def test_saved_games_list_requires_auth(self):
        response = self.client.get(self.saved_list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_saved_games_returns_current_users_saved_games(self):
        SavedGame.objects.create(user=self.user, game=self.game)

        self.authenticate()
        response = self.client.get(self.saved_list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["game"]["id"], self.game.id) # type: ignore

    def test_get_saved_games_excludes_other_users(self):
        other_user = User.objects.create_user(
            email="other@example.com",
            username="otheruser",
            password="password123",
        )
        other_game = Game.objects.create(
            source="rawg",
            external_id="4200",
            slug="portal-2",
            title="Portal 2",
            description="Puzzle platformer",
            genre="Puzzle",
            tags=["puzzle"],
            playtime=10,
            image_url="https://example.com/portal2.jpg",
            metadata={"rating": 4.9},
        )

        SavedGame.objects.create(user=self.user, game=self.game)
        SavedGame.objects.create(user=other_user, game=other_game)

        self.authenticate()
        response = self.client.get(self.saved_list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["game"]["id"], self.game.id) # type: ignore

    def test_post_save_creates_saved_game(self):
        self.authenticate()
        response = self.client.post(self.save_url)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            SavedGame.objects.filter(user=self.user, game=self.game).exists()
        )
        self.assertEqual(response.data["saved_game"]["status"], SavedGame.STATUS_SAVED)  # type: ignore

    def test_post_save_returns_200_when_already_saved(self):
        SavedGame.objects.create(user=self.user, game=self.game)

        self.authenticate()
        response = self.client.post(self.save_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            SavedGame.objects.filter(user=self.user, game=self.game).count(),
            1,
        )

    def test_delete_save_removes_saved_game(self):
        SavedGame.objects.create(user=self.user, game=self.game)

        self.authenticate()
        response = self.client.delete(self.save_url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(
            SavedGame.objects.filter(user=self.user, game=self.game).exists()
        )

    def test_put_save_updates_saved_game_status(self):
        SavedGame.objects.create(user=self.user, game=self.game)

        self.authenticate()
        response = self.client.put(self.save_url, {"status": SavedGame.STATUS_PLAYING}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], SavedGame.STATUS_PLAYING)  # type: ignore

        saved_game = SavedGame.objects.get(user=self.user, game=self.game)
        self.assertEqual(saved_game.status, SavedGame.STATUS_PLAYING)


class GameLibraryFlowTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="flow@example.com",
            username="flowuser",
            password="password123",
        )
        self.token = Token.objects.create(user=self.user)
        self.create_game_url = "/api/v1/games/"
        self.saved_list_url = "/api/v1/games/saved/"

    def authenticate(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")

    def test_create_then_save_then_list_flow(self):
        create_payload = {
            "source": "rawg",
            "external_id": "6789",
            "slug": "test-game",
            "title": "Test Game",
            "description": "API flow test game",
            "developer": "Test Studio",
            "genre": "Action",
            "tags": ["action", "singleplayer"],
            "playtime": 12,
            "image_url": "https://example.com/test-game.jpg",
            "released_at": "2026-01-01",
            "metadata": {
                "rawg_rating": 4.0,
                "platforms": ["PC"],
            },
        }

        create_response = self.client.post(self.create_game_url, create_payload, format="json")
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        game_id = create_response.data["id"]  # type: ignore

        self.authenticate()
        save_response = self.client.post(f"/api/v1/games/save/{game_id}/")
        self.assertEqual(save_response.status_code, status.HTTP_201_CREATED)

        saved_list_response = self.client.get(self.saved_list_url)
        self.assertEqual(saved_list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(saved_list_response.data), 1)
        self.assertEqual(saved_list_response.data[0]["game"]["id"], game_id)  # type: ignore
        self.assertEqual(saved_list_response.data[0]["game"]["external_id"], "6789")  # type: ignore


class FetchRecommendationsTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="recommend@example.com",
            username="recommenduser",
            password="password123",
        )
        self.token = Token.objects.create(user=self.user)
        self.url = "/api/v1/games/recommended/"

    def authenticate(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")

    def rawg_response(self, results, count=None, next_url=None, previous_url=None):
        payload = {
            "count": count if count is not None else len(results),
            "next": next_url,
            "previous": previous_url,
            "results": results,
        }
        response = Mock()
        response.status_code = status.HTTP_200_OK
        response.json.return_value = payload
        return response

    @patch("game_app.views.requests.get")
    @patch("game_app.views.settings.RAWG_KEY", "test-rawg-key")
    def test_recommendations_use_broad_fallback_after_exclusions(self, mock_get):
        Profile.objects.create(
            user=self.user,
            personality_tags=["Cozy"],
            genre_tags=["Action"],
            platform_tags=["PC"],
            excluded_tags=["Action"],
        )

        strict_results = [
            {
                "id": 101,
                "name": "Strict Action",
                "genres": [{"name": "Action"}],
                "platforms": [{"platform": {"name": "PC"}}],
                "tags": [{"name": "Action"}],
            }
        ]
        relaxed_results = [
            {
                "id": 102,
                "name": "Relaxed Action",
                "genres": [{"name": "Action"}],
                "platforms": [{"platform": {"name": "PC"}}],
                "tags": [{"name": "Action"}],
            }
        ]
        broad_results = [
            {
                "id": 102,
                "name": "Relaxed Action",
                "genres": [{"name": "Action"}],
                "platforms": [{"platform": {"name": "PC"}}],
                "tags": [{"name": "Action"}],
            },
            {
                "id": 103,
                "name": "Broad Puzzle",
                "genres": [{"name": "Puzzle"}],
                "platforms": [{"platform": {"name": "Nintendo Switch"}}],
                "tags": [{"name": "Singleplayer"}],
            },
            {
                "id": 104,
                "name": "Broad Strategy",
                "genres": [{"name": "Strategy"}],
                "platforms": [{"platform": {"name": "PC"}}],
                "tags": [{"name": "Turn-based"}],
            },
        ]

        mock_get.side_effect = [
            self.rawg_response(strict_results),
            self.rawg_response(relaxed_results),
            self.rawg_response(broad_results),
        ]

        self.authenticate()
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(mock_get.call_count, 3)
        self.assertIn("broad-fallback", response.data["strategy"]) # type: ignore
        self.assertEqual(response.data["debug"]["strict_raw_count"], 1) # type: ignore
        self.assertEqual(response.data["debug"]["relaxed_raw_count"], 1) # type: ignore
        self.assertEqual(response.data["debug"]["broad_raw_count"], 3) # type: ignore
        self.assertEqual(response.data["debug"]["after_exclusion_count"], 0) # type: ignore
        self.assertGreaterEqual(response.data["count"], 2) # type: ignore

    @patch("game_app.views.requests.get")
    @patch("game_app.views.settings.RAWG_KEY", "test-rawg-key")
    def test_recommendations_map_rpg_and_platform_slugs(self, mock_get):
        Profile.objects.create(
            user=self.user,
            personality_tags=[],
            genre_tags=["RPG"],
            platform_tags=["Xbox Series X/S"],
            excluded_tags=[],
        )

        mapped_game = {
            "id": 201,
            "name": "Mapped Query Result",
            "genres": [{"name": "Role-Playing Games (RPG)"}],
            "platforms": [{"platform": {"name": "Xbox Series X"}}],
            "tags": [{"name": "Story Rich"}],
        }

        # Return 8 results so the broad fallback threshold is met and
        # requests.get is only called once — this test is about slug mapping,
        # not fallback behavior.
        mock_get.return_value = self.rawg_response([mapped_game] * 8)

        self.authenticate()
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(mock_get.call_count, 1)

        params = mock_get.call_args.kwargs["params"]
        self.assertEqual(params.get("genres"), "role-playing-games-rpg")
        self.assertEqual(params.get("platforms"), "xbox-series-x")


class FetchRAWGDetailTests(APITestCase):
    def setUp(self):
        self.url = "/api/v1/games/rawg/3498/"

    @patch("game_app.views.requests.get")
    @patch("game_app.views.settings.RAWG_KEY", "test-rawg-key")
    def test_rawg_detail_returns_game_payload(self, mock_get):
        payload = {
            "id": 3498,
            "name": "Grand Theft Auto V",
            "description": "Action-adventure game",
            "rating": 4.47,
            "esrb_rating": {"name": "Mature"},
            "genres": [{"name": "Action"}],
            "platforms": [{"platform": {"name": "PC"}}],
            "stores": [{"store": {"name": "Steam"}}],
            "developers": [{"name": "Rockstar North"}],
        }

        response = Mock()
        response.status_code = status.HTTP_200_OK
        response.json.return_value = payload
        mock_get.return_value = response

        api_response = self.client.get(self.url)

        self.assertEqual(api_response.status_code, status.HTTP_200_OK)
        self.assertEqual(api_response.data["id"], 3498)  # type: ignore
        self.assertEqual(api_response.data["name"], "Grand Theft Auto V")  # type: ignore

    @patch("game_app.views.settings.RAWG_KEY", None)
    def test_rawg_detail_returns_500_when_key_is_missing(self):
        api_response = self.client.get(self.url)

        self.assertEqual(api_response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertEqual(api_response.data["error"], "RAWG API key is not configured")  # type: ignore
