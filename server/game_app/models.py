from django.db import models

# Create your models here.
class Game(models.Model):
    SOURCE_CHOICES = [
        ("rawg", "RAWG"),
    ]

    source = models.CharField(max_length=50, choices=SOURCE_CHOICES, default="rawg")
    external_id = models.CharField(max_length=100)
    slug = models.SlugField(max_length=255, blank=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    developer = models.CharField(max_length=255, blank=True)
    genre = models.CharField(max_length=100, blank=True)
    tags = models.JSONField(default=list, blank=True)
    playtime = models.PositiveIntegerField(blank=True, null=True)
    image_url = models.URLField(blank=True)
    released_at = models.DateField(blank=True, null=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["source", "external_id"],
                name="unique_game_per_source",
            )
        ]

    def __str__(self):
        return self.title


class SavedGame(models.Model):
    STATUS_SAVED = "saved"
    STATUS_PLAYING = "playing"
    STATUS_COMPLETED = "completed"
    STATUS_CHOICES = [
        (STATUS_SAVED, "Saved"),
        (STATUS_PLAYING, "Playing"),
        (STATUS_COMPLETED, "Completed"),
    ]

    user = models.ForeignKey(
        "user_app.User",
        on_delete=models.CASCADE,
        related_name="saved_games",
    )
    game = models.ForeignKey(
        Game,
        on_delete=models.CASCADE,
        related_name="saved_by_users",
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_SAVED,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "game"],
                name="unique_saved_game_per_user",
            )
        ]

    def __str__(self):
        return f"{self.user.username} - {self.game.title}"