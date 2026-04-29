from django.urls import path
from .views import *

urlpatterns = [
    path("", InfoView.as_view()),
    path("create/", CreateUserView.as_view()),
    path("login/", LoginView.as_view()),
    path("logout/", LogOutView.as_view()),
    path("github/login/", GitHubLoginView.as_view()),
    path("github/callback/", GitHubCallbackView.as_view()),
]