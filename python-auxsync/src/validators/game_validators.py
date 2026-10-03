import re
from urllib.parse import urlparse
from config.constants import (
    MAX_ROUNDS,
    MIN_VOTING_TIME,
    MAX_VOTING_TIME,
    SONG_SELECTION_TIMES,
    SONG_LENGTHS,
    GIF_OPTIONS,
    GIF_SUB_OPTIONS,
)

_VIDEO_ID_PATTERN = re.compile(r"^[A-Za-z0-9_-]{11}$")
_MAX_MEDIA_URL_LENGTH = 500
_MAX_START_TIME = 12 * 60 * 60
_ALBUM_ART_HOSTS = ("ytimg.com", "googleusercontent.com", "ggpht.com")

def _is_https_url(url: str, allowed_host_suffixes=None) -> bool:
    try:
        parsed = urlparse(url)
    except ValueError:
        return False
    host = parsed.hostname
    if parsed.scheme != "https" or not host:
        return False
    if allowed_host_suffixes:
        if isinstance(allowed_host_suffixes, str):
            allowed_host_suffixes = (allowed_host_suffixes,)
        return any(
            host == suffix or host.endswith("." + suffix)
            for suffix in allowed_host_suffixes
        )
    return True

def validate_settings(settings) -> dict:
    if not isinstance(settings, dict):
        return {"valid": False, "error": "Settings must be an object"}

    rounds = settings.get("rounds")
    voting_time = settings.get("votingTime")
    song_selection_time = settings.get("songSelectionTime")
    song_length = settings.get("songLength")
    gif_option = settings.get("gifOption")
    gif_sub_option = settings.get("gifSubOption")
    search_enabled = settings.get("searchEnabled")

    if not isinstance(rounds, int) or rounds < 1 or rounds > MAX_ROUNDS:
        return {"valid": False, "error": f"Rounds must be 1-{MAX_ROUNDS}"}

    if (
        not isinstance(voting_time, int)
        or voting_time < MIN_VOTING_TIME
        or voting_time > MAX_VOTING_TIME
    ):
        return {
            "valid": False,
            "error": f"Voting time must be {MIN_VOTING_TIME}-{MAX_VOTING_TIME}s",
        }

    if song_selection_time not in SONG_SELECTION_TIMES:
        return {"valid": False, "error": "Invalid song selection time"}

    if song_length not in SONG_LENGTHS:
        return {"valid": False, "error": "Invalid song length"}

    if gif_option not in GIF_OPTIONS:
        return {"valid": False, "error": "Invalid GIF option"}

    if gif_sub_option not in GIF_SUB_OPTIONS:
        return {"valid": False, "error": "Invalid GIF sub option"}

    if not isinstance(search_enabled, bool):
        return {"valid": False, "error": "searchEnabled must be a boolean"}

    return {"valid": True}

def validate_song_submission(data) -> dict:
    if not isinstance(data, dict):
        return {"valid": False, "error": "Submission must be an object"}

    track_uri = data.get("trackUri")
    track_name = data.get("trackName")
    artist = data.get("artist")

    if not isinstance(track_uri, str) or not _VIDEO_ID_PATTERN.match(track_uri):
        return {"valid": False, "error": "Invalid video ID"}

    if (
        not isinstance(track_name, str)
        or len(track_name) == 0
        or len(track_name) > 200
    ):
        return {"valid": False, "error": "Invalid track name"}

    if (
        not isinstance(artist, str)
        or len(artist) == 0
        or len(artist) > 200
    ):
        return {"valid": False, "error": "Invalid artist name"}

    album_art = data.get("albumArt", "")
    if (
        not isinstance(album_art, str)
        or len(album_art) > _MAX_MEDIA_URL_LENGTH
        or (album_art and not _is_https_url(album_art, _ALBUM_ART_HOSTS))
    ):
        album_art = ""

    start_time = data.get("startTime", 0)
    if not isinstance(start_time, int) or isinstance(start_time, bool):
        start_time = 0
    start_time = max(0, min(start_time, _MAX_START_TIME))

    return {
        "valid": True,
        "value": {
            "trackUri": track_uri,
            "trackName": track_name,
            "artist": artist,
            "albumArt": album_art,
            "startTime": start_time,
        },
    }

def validate_gif(gif) -> dict:
    invalid = {"valid": False, "error": "Invalid GIF data"}

    if not isinstance(gif, dict):
        return invalid

    gif_id = gif.get("id")
    if not isinstance(gif_id, str) or len(gif_id) == 0 or len(gif_id) > 100:
        return invalid

    images = gif.get("images")
    if not isinstance(images, dict):
        return invalid

    original = images.get("original")
    downsized = images.get("downsized")
    mp4 = original.get("mp4", "") if isinstance(original, dict) else ""
    webp = original.get("webp", "") if isinstance(original, dict) else ""
    url = downsized.get("url", "") if isinstance(downsized, dict) else ""

    for media_url in (mp4, webp, url):
        if not isinstance(media_url, str) or len(media_url) > _MAX_MEDIA_URL_LENGTH:
            return invalid
        if media_url and not _is_https_url(media_url, "giphy.com"):
            return invalid

    if not mp4 and not webp:
        return invalid

    if not url:
        url = mp4 or webp

    title = gif.get("title", "")

    return {
        "valid": True,
        "value": {
            "id": gif_id,
            "title": title[:200] if isinstance(title, str) else "",
            "images": {
                "original": {"mp4": mp4, "webp": webp},
                "downsized": {"url": url},
            },
        },
    }

def validate_vote(voter_socket_id: str, voted_for_socket_id: str, submissions: dict) -> dict:
    if voter_socket_id == voted_for_socket_id:
        return {"valid": False, "error": "You cannot vote for yourself"}

    if voted_for_socket_id not in submissions:
        return {"valid": False, "error": "Invalid vote target"}

    return {"valid": True}
