import { useEffect } from "react";

export const SITE_NAME = "AuxSync";
export const SITE_URL = "https://sourcloudii.github.io/AuxSync/";

export const DEFAULT_TITLE = "AuxSync - Multiplayer GIF & Song Party Game";

export const DEFAULT_DESCRIPTION =
  "Pick a GIF, race your friends to score it with the perfect song, then vote on whose track fits best. Free browser party game - no install, just share a link.";

const INDEXABLE = "index, follow, max-image-preview:large, max-snippet:-1";
const PRIVATE = "noindex, nofollow";

export const PAGE_SEO = {
  home: {
    title: null,
    description: DEFAULT_DESCRIPTION,
    robots: INDEXABLE,
  },
  room: {
    title: "Waiting Room",
    description:
      "Your AuxSync lobby is open - share the invite link, set the match rules, then start the game.",
    robots: PRIVATE,
  },
  lobby: {
    title: "In Game",
    description: "An AuxSync match in progress - choose, search, listen, vote.",
    robots: PRIVATE,
  },
};

function setMeta(key, content, attr = "name") {
  let tag = document.head.querySelector(`meta[${attr}="${key}"]`);

  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }

  tag.setAttribute("content", content);
}

function setCanonical(href) {
  let link = document.head.querySelector('link[rel="canonical"]');

  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }

  link.setAttribute("href", href);
}

export function usePageSEO({ title, description, robots, canonical } = {}) {
  const pageTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const pageDescription = description || DEFAULT_DESCRIPTION;
  const pageRobots = robots || INDEXABLE;

  useEffect(() => {
    const pageCanonical =
      canonical || `${window.location.origin}${window.location.pathname}`;

    document.title = pageTitle;

    setMeta("description", pageDescription);
    setMeta("robots", pageRobots);
    setCanonical(pageCanonical);

    setMeta("og:title", pageTitle, "property");
    setMeta("og:description", pageDescription, "property");
    setMeta("og:url", pageCanonical, "property");

    setMeta("twitter:title", pageTitle);
    setMeta("twitter:description", pageDescription);
  }, [pageTitle, pageDescription, pageRobots, canonical]);
}
