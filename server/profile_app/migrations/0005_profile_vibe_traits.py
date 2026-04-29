from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("profile_app", "0004_alter_profile_genre_tags_alter_profile_platform_tags"),
    ]

    operations = [
        migrations.AddField(
            model_name="profile",
            name="vibe_traits",
            field=models.JSONField(blank=True, null=True),
        ),
    ]
