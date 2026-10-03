import asyncio
import threading
from concurrent.futures import ThreadPoolExecutor
from fastapi import APIRouter, Request, HTTPException, Query
from ytmusicapi import YTMusic
from state import room_manager
from config.limiter import limiter
from config.constants import SEARCH_CACHE_MAX_ENTRIES
from config.constants import YT_SEARCH_LIMIT
from validators.room_validators import validate_room_code

router = APIRouter()

_executor = ThreadPoolExecutor(max_workers=4)
_local = threading.local()


def _get_ytm() -> YTMusic:
    """One client per worker thread, built on first use. Constructing YTMusic
    reaches out to YouTube, so doing it at import time would make the whole app
    fail to boot whenever YouTube is unreachable; keeping it thread-local means
    the underlying session is never shared across the pool."""
    client = getattr(_local, "ytm", None)
    if client is None:
        client = YTMusic()
        _local.ytm = client
    return client


def _do_search(query: str) -> list:
    return _get_ytm().search(query, filter="songs", limit=YT_SEARCH_LIMIT)


def _format_result(item: dict) -> dict | None:
    video_id = item.get("videoId")
    if not video_id:
        return None

    title = item.get("title", "")
    artists = item.get("artists") or []
    channel_title = ", ".join(a["name"] for a in artists if "name" in a)

    thumbnails = item.get("thumbnails") or []
    thumbnail = thumbnails[-1]["url"] if thumbnails else ""

    duration = item.get("duration", "")

    return {
        "videoId": video_id,
        "title": title,
        "channelTitle": channel_title,
        "thumbnail": thumbnail,
        "duration": duration,
    }


@router.get("/search")
@limiter.limit("30/minute")
async def search_videos(
    request: Request,
    q: str = Query(..., min_length=1, max_length=100),
    room: str | None = Query(default=None),
):
    query = q.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Search query is required")

    cache_key = query.lower()
    room_obj = None
    if room:
        code_result = validate_room_code(room)
        if code_result["valid"]:
            room_obj = room_manager.get_room(code_result["value"])

    if room_obj is not None and cache_key in room_obj["search_cache"]:
        return {"items": room_obj["search_cache"][cache_key]}

    try:
        loop = asyncio.get_running_loop()
        raw_results = await loop.run_in_executor(_executor, _do_search, query)
        formatted = [
            r for item in raw_results if (r := _format_result(item)) is not None
        ]
        items = formatted[:YT_SEARCH_LIMIT]

        if room_obj is not None:
            cache = room_obj["search_cache"]
            if cache_key not in cache and len(cache) >= SEARCH_CACHE_MAX_ENTRIES:
                cache.pop(next(iter(cache)))
            cache[cache_key] = items

        return {"items": items}
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Failed to search music") from exc
