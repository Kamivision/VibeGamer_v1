from django.urls import path
from .views import *

urlpatterns = [
    path('options/', ProfileTagOptionsView.as_view(), name='profile-tag-options'),
    path('', ProfileView.as_view(), name='profile-view'),
]