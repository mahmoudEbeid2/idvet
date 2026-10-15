import { content } from "@/lib/content";
import { getSitemapCatalog } from "@/lib/catalog/data";
import { absoluteUrl } from "@/lib/seo";

// /llms.txt (https://llmstxt.org): a plain-Markdown guide to the site for AI
// agents and LLMs. Built per request from the catalog, in English with links
// to the English pages; the same paths exist under /ar (main) and /ku.
export async function GET() {
  const en = content.en;
  const { categories, products } = await getSitemapCatalog("en");
  const line = (name: string, path: string, note?: string) =>
    `- [${name}](${absoluteUrl(path)})${note ? `: ${note}` : ""}`;

  const text = [
    "# IDVET",
    "",
    `> ${en.hero.paragraph}`,
    "",
    `IDVET is the exclusive Iraqi agent for HiPro (Turkey), Vet Care (Jordan) and Jumuh (Saudi Arabia). Services: ${en.services.items
      .map((item) => item.heading.split("\n").pop())
      .join(", ")}.`,
    "",
    "The site is available in Arabic (main language, /ar), Kurdish Sorani (/ku) and English (/en); every page has the same path in each language.",
    "",
    `Contact: ${en.contact.email} · ${en.contact.phone} (phone / WhatsApp) · ${en.contact.addressLines.join(" · ")}`,
    "",
    "## Main pages",
    "",
    line("Home (Arabic)", "/ar", "about the company, services, brands and contact"),
    line("Home (English)", "/en"),
    line("Home (Kurdish)", "/ku"),
    line("About us", "/en/about", "who IDVET is, its story, mission and vision"),
    line("Contact us", "/en/contact", "phone, email and office addresses"),
    line("Product catalog", "/en/products", "all published products; search with ?q=, filter with ?brand= and ?category="),
    "",
    "## Product categories",
    "",
    ...categories.map((c) => line(c.name, `/en/products?category=${c.slug}`)),
    "",
    "## Products",
    "",
    ...products.map((p) => line(p.name, `/en/products/${p.slug}`)),
    "",
    "## Optional",
    "",
    line("Sitemap", "/sitemap.xml", "every page in every language"),
    line("Brand: HiPro", "https://www.hipro-feed.com/"),
    line("Brand: Vet Care", "https://vetcare-jo.com/"),
    line("Brand: Jumuh", "https://jamuh.sa/"),
    "",
  ].join("\n");

  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
