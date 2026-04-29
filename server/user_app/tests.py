from rest_framework import status
from rest_framework.test import APITestCase

from user_app.models import User
from profile_app.models import Profile


class CreateUserTests(APITestCase):
    def test_signup_creates_profile(self):
        payload = {
            "email": "newuser@example.com",
            "username": "newuser",
            "password": "password123",
        }

        response = self.client.post("/api/v1/users/create/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email="newuser@example.com")
        self.assertTrue(Profile.objects.filter(user=user).exists())
