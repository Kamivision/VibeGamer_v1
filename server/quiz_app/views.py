from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status as s
from user_app.views import UserView
import google.generativeai as genai


def build_explain_prompt(game_name, genres, personality, personality_tags):
    """
    Build a prompt that asks Gemini for a short, personalized game explanation.
    All inputs are plain strings or lists so there is nothing secret in the prompt itself.
    """
    genre_text = ", ".join(genres) if genres else "various genres"
    tag_text = ", ".join(personality_tags) if personality_tags else "general gaming"

    prompt = (
        f"You are a friendly game recommendation assistant. "
        f"A user with the gaming personality '{personality}' and interests in {tag_text} "
        f"has been recommended the game '{game_name}' (genres: {genre_text}). "
        f"In one sentence, explain why this game is a great match for them. "
        f"Be enthusiastic but concise. Do not use bullet points."
    )
    return prompt


class VibeExplainView(UserView):
    """
    POST /api/vibes/explain/
    Accepts: { game_name, genres, personality, personality_tags }
    Returns: { explanation }

    The Gemini API key is kept server-side only and is never returned to the client.
    """

    def post(self, request):
        api_key = getattr(settings, "GEMINI_KEY", None)
        if not api_key:
            return Response(
                {"error": "Gemini API key is not configured"},
                status=s.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        game_name = request.data.get("game_name", "")
        genres = request.data.get("genres", [])
        personality = request.data.get("personality", "")
        personality_tags = request.data.get("personality_tags", [])

        if not game_name:
            return Response(
                {"error": "game_name is required"},
                status=s.HTTP_400_BAD_REQUEST,
            )

        if not isinstance(genres, list):
            genres = []
        if not isinstance(personality_tags, list):
            personality_tags = []

        prompt = build_explain_prompt(game_name, genres, personality, personality_tags)

        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel("gemini-2.5-flash")
            response = model.generate_content(prompt)
            explanation = response.text.strip()
        except Exception as e:
            return Response(
                {"error": "Gemini API request failed", "detail": str(e)},
                status=s.HTTP_502_BAD_GATEWAY,
            )

        return Response({"explanation": explanation}, status=s.HTTP_200_OK)
