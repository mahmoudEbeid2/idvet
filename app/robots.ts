import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Search engines and AI crawlers/agents are all welcome on the public site;
// the dashboard and the API are off-limits to everyone. The AI agents are
// listed by name so the policy is explicit for them, not just inherited from *.
const AI_AGENTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Meta-ExternalAgent",
  "Amazonbot",
  "CCBot",
  "cohere-ai",
  "DuckAssistBot",
  "MistralAI-User",
];

const DISALLOW = ["/admin", "/api/"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      { userAgent: AI_AGENTS, allow: "/", disallow: DISALLOW },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
