from django.db import models
from .validators import validate_genre_tags, validate_platform_tags

# Create your models here.
class Profile(models.Model):
    user = models.OneToOneField("user_app.User", on_delete=models.CASCADE, related_name="profile")
    personality = models.CharField(max_length=255, blank=True, null=True)
    vibe_traits = models.JSONField(blank=True, null=True)
    personality_tags = models.JSONField(blank=True, null=True)
    quiz_results = models.JSONField(blank=True, null=True)
    genre_tags = models.JSONField(blank=True, null=True, validators=[validate_genre_tags])
    platform_tags = models.JSONField(blank=True, null=True, validators=[validate_platform_tags])
    excluded_tags = models.JSONField(blank=True, null=True)
    play_time_preference = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username}'s Profile"