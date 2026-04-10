const env = require("../config/environment");

const YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";
const YOUTUBE_VIDEOS_URL = "https://www.googleapis.com/youtube/v3/videos";

async function searchVideos(query) {
  const searchParams = new URLSearchParams({
    part: "snippet",
    q: query,
    type: "video",
    videoCategoryId: "10",
    topicId: "/m/04rlf",
    videoEmbeddable: "true",
    maxResults: "10",
    key: env.YOUTUBE_API_KEY,
  });

  const res = await fetch(`${YOUTUBE_SEARCH_URL}?${searchParams.toString()}`);

  if (!res.ok) {
    throw new Error(`YouTube search failed: ${res.status}`);
  }

  const searchData = await res.json();
  const videoIds = (searchData.items || [])
    .map(item => item.id.videoId)
    .filter(Boolean);

  if (videoIds.length === 0) return { items: [] };

  // Fetch video details for duration info
  const detailParams = new URLSearchParams({
    part: "snippet,contentDetails",
    id: videoIds.join(","),
    key: env.YOUTUBE_API_KEY,
  });

  const detailRes = await fetch(
    `${YOUTUBE_VIDEOS_URL}?${detailParams.toString()}`,
  );

  if (!detailRes.ok) {
    throw new Error(`YouTube video details failed: ${detailRes.status}`);
  }

  return detailRes.json();
}

module.exports = { searchVideos };
