const express = require("express");
const router = express.Router();
const { searchVideos } = require("../services/youtubeService");

router.get("/search", async (req, res) => {
  const { q } = req.query;
  const query = q.trim().slice(0, 100);

  if (!q || typeof q !== "string" || q.trim().length === 0) {
    return res.status(400).json({ error: "Search query is required" });
  }

  try {
    const data = await searchVideos(query);
    const items = (data.items || []).map(item => ({
      videoId: item.id,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails?.medium?.url || "",
      duration: item.contentDetails?.duration || "",
    }));
    res.json({ items });
  } catch (err) {
    console.error("YouTube search error:", err.message);
    res.status(502).json({ error: "Failed to search YouTube" });
  }
});

module.exports = router;
