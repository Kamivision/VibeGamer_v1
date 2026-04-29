from django.urls import path
from .views import *

urlpatterns = [
    path('', GameList.as_view(), name='game-list'),
    path('rawg/', FetchRAWG.as_view(), name='fetch-rawg-games'),
    path('rawg/<int:game_id>/', FetchRAWGDetail.as_view(), name='fetch-rawg-game-detail'),
    path('save/<int:game_id>/', SavedGameView.as_view(), name='save-or-delete-game'),
    path('saved/', SavedGamesList.as_view(), name='saved-games-list'),
    path('recommended/', FetchRecommendations.as_view(), name='fetch-recommendations')
]
