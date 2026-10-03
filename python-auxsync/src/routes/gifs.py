import httpx
from fastapi import APIRouter, Request, HTTPException, Query
from config.environment import env
from config.limiter import limiter
from config.constants import GIPHY_TRENDING_LIMIT, GIPHY_SEARCH_LIMIT

router = APIRouter()

_GIPHY_BASE = "https://api.giphy.com/v1/gifs"

@router.get("/trending")
@limiter.limit("30/minute")
async def trending_gifs(request: Request):
    params = {
        "api_key": env["GIPHY_API_KEY"],
        "limit": GIPHY_TRENDING_LIMIT,
        "country_code": "us",
        "remove_low_contrast": "true",
    }
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{_GIPHY_BASE}/trending", params=params)
        if response.status_code != 200:
            raise HTTPException(status_code=502, detail="Failed to fetch trending GIFs")
        return response.json()
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail="Failed to fetch trending GIFs") from exc

@router.get("/search")
@limiter.limit("30/minute")
async def search_gifs(
    request: Request,
    q: str = Query(..., min_length=1, max_length=100),
):
    query = q.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Search query is required")

    params = {
        "api_key": env["GIPHY_API_KEY"],
        "q": query,
        "limit": GIPHY_SEARCH_LIMIT,
        "country_code": "us",
        "remove_low_contrast": "true",
    }
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{_GIPHY_BASE}/search", params=params)
        if response.status_code != 200:
            raise HTTPException(status_code=502, detail="Failed to search GIFs")
        return response.json()
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail="Failed to search GIFs") from exc
