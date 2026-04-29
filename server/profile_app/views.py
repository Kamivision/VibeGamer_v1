from django.shortcuts import get_object_or_404
from rest_framework import status as s
from rest_framework.response import Response
from rest_framework.views import APIView
from user_app.views import UserView
from .models import Profile
from .serializers import ProfileSerializer
from .tag_options import GENRE_TAG_OPTIONS, PLATFORM_TAG_OPTIONS

# Create your views here.
class ProfileView(UserView):
    def get(self, request):
        profile = get_object_or_404(Profile, user=request.user)
        serializer = ProfileSerializer(profile)
        return Response(serializer.data)

    def put(self, request):
        profile = get_object_or_404(Profile, user=request.user)
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=s.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        profile = get_object_or_404(Profile, user=request.user)
        profile.delete()
        return Response(status=s.HTTP_204_NO_CONTENT)


class ProfileTagOptionsView(UserView):
    def get(self, request):
        return Response(
            {
                "genre_tags": GENRE_TAG_OPTIONS,
                "platform_tags": PLATFORM_TAG_OPTIONS,
            }
        )

