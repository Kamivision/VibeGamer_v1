from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase, APIClient

from user_app.models import User
from profile_app.models import Profile


class ProfileViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="test@example.com",
            username="testuser",
            password="password123",
        )
        self.token = Token.objects.create(user=self.user)
        self.profile = Profile.objects.create(
            user=self.user,
            personality="Chill Explorer",
            personality_tags=["chill", "explore"],
            quiz_results={"mood": "calm", "style": "explore"},
            play_time_preference="medium",
        )
        self.url = "/api/v1/profile/"
        self.client = APIClient()

    def authenticate(self):
        self.client.force_authenticate(user=self.user, token=self.token)

    def test_get_profile_requires_auth(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_profile_returns_current_users_profile(self):
        self.authenticate()
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["personality"], "Chill Explorer")
        self.assertEqual(response.data["play_time_preference"], "medium")
        self.assertEqual(response.data["user"], self.user.id) # type: ignore

    def test_put_profile_updates_current_users_profile(self):
        self.authenticate()
        payload = {
            "personality": "Focused Strategist",
            "personality_tags": ["focused", "strategy"],
            "quiz_results": {"mood": "focused", "style": "strategy"},
            "play_time_preference": "long",
        }

        response = self.client.put(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.personality, "Focused Strategist")
        self.assertEqual(self.profile.personality_tags, ["focused", "strategy"])
        self.assertEqual(self.profile.quiz_results["style"], "strategy")
        self.assertEqual(self.profile.play_time_preference, "long")

    def test_put_profile_updates_genre_platform_and_excluded_tags(self):
        self.authenticate()
        payload = {
            "genre_tags": ["Action", "RPG"],
            "platform_tags": ["PC", "Nintendo Switch"],
            "excluded_tags": ["Horror", "Competitive"],
        }

        response = self.client.put(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.genre_tags, ["Action", "RPG"])
        self.assertEqual(self.profile.platform_tags, ["PC", "Nintendo Switch"])
        self.assertEqual(self.profile.excluded_tags, ["Horror", "Competitive"])

    def test_put_profile_rejects_invalid_genre_or_platform_tag(self):
        self.authenticate()
        payload = {
            "genre_tags": ["NotARealGenre"],
            "platform_tags": ["PC"],
        }

        response = self.client.put(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("genre_tags", response.data)

    def test_get_profile_tag_options(self):
        self.authenticate()

        response = self.client.get(f"{self.url}options/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("genre_tags", response.data)
        self.assertIn("platform_tags", response.data)
        self.assertIn("Action", response.data["genre_tags"])
        self.assertIn("PC", response.data["platform_tags"])

    def test_delete_profile_removes_current_users_profile(self):
        self.authenticate()

        response = self.client.delete(self.url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Profile.objects.filter(user=self.user).exists())
