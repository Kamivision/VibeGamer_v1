from rest_framework.serializers import ModelSerializer
from .models import Game, SavedGame

class GameSerializer(ModelSerializer):
    class Meta:
        model = Game
        fields = '__all__'

class SavedGameSerializer(ModelSerializer):
    game = GameSerializer(read_only=True)

    class Meta:
        model = SavedGame
        fields = ["id", "game", "status", "created_at"]