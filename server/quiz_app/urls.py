from django.urls import path
from .views import VibeExplainView

urlpatterns = [
    path("explain/", VibeExplainView.as_view(), name="vibe-explain"),
]
