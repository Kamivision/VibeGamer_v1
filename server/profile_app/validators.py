from rest_framework.exceptions import ValidationError
from .tag_options import GENRE_TAG_OPTIONS, PLATFORM_TAG_OPTIONS


ALLOWED_GENRE_TAGS = set(GENRE_TAG_OPTIONS)
ALLOWED_PLATFORM_TAGS = set(PLATFORM_TAG_OPTIONS)


def validate_genre_tags(genre_tags):
    if genre_tags is None:
        return genre_tags

    if not isinstance(genre_tags, list):
        raise ValidationError("Genre tags must be a list.")

    invalid_tags = [tag for tag in genre_tags if tag not in ALLOWED_GENRE_TAGS]
    if invalid_tags:
        raise ValidationError(f"Invalid genre tag(s): {', '.join(invalid_tags)}")

    return genre_tags


def validate_platform_tags(platform_tags):
    if platform_tags is None:
        return platform_tags

    if not isinstance(platform_tags, list):
        raise ValidationError("Platform tags must be a list.")

    invalid_tags = [tag for tag in platform_tags if tag not in ALLOWED_PLATFORM_TAGS]
    if invalid_tags:
        raise ValidationError(f"Invalid platform tag(s): {', '.join(invalid_tags)}")

    return platform_tags