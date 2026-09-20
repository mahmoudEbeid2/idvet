import type { SiteContent } from "./types";

export const en: Omit<SiteContent, "languages"> = {
  locale: "en",
  htmlLang: "en",
  nav: {
    contact: "Contact",
    brands: "Brands",
    services: "Services",
    about: "About",
  },
  hero: {
    eyebrow: "Your partner in animal health — Iraq",
    heading:
      "We import, distribute, and follow up — for better animal health on every Iraqi farm",
    paragraph:
      "idvet is an Iraqi company specialized in importing and distributing veterinary medicines and feed additives from trusted global brands, backed by genuine after-sales service, field follow-up, and technical consultation for breeders, pharmacists, and distributors.",
    ctaPrimary: "The brands we distribute",
    ctaSecondary: "Contact us",
  },
  tagline:
    "Import & distribution   |   Field follow-up   |   After-sales service   |   Technical consultation",
  about: {
    title: "About IDVET",
    heading: "Not just a carrier of goods — we're the link to herd health",
    paragraphs: [
      "IDVET was founded to be the trusted distributor of animal health products in Iraq, connecting global manufacturers with breeders, veterinary pharmacists, and local distributors, with a deep understanding of the animal health market's needs in Iraq and Kurdistan.",
      "Our mission doesn't stop at import, storage, and distribution — we complete the journey with genuine field follow-up after the sale, fast technical service, and specialized consultation that helps our clients get the best result from every product.",
      "We work as an exclusive agent for specialized brands from Turkey, Saudi Arabia, and Jordan — HiPro, Jamuh, and Vet Care — and we ensure their products reach every province in Iraq with guaranteed quality, consistency, and timing.",
    ],
  },
  services: {
    title: "Our Services",
    subtitle: "From the port to the farm gate",
    items: [
      {
        heading: "01\nImport & Distribution",
        body: "Complete supply chain management from the factory in Turkey to warehouses and distributors in every province of Iraq, with storage and transport systems that meet veterinary product requirements.",
      },
      {
        heading: "02\nField Follow-up",
        body: "A field team regularly visits farms and clinics to track the product's real-world performance — not just delivery and done.",
      },
      {
        heading: "03\nAfter-sales Service",
        body: "Fast-response technical support for any issue or inquiry after purchase, with direct access to a team that knows the product and the region.",
      },
      {
        heading: "04\nTechnical Consultation",
        body: "Specialized consultation for breeders and veterinary pharmacists on choosing the right product, dosage, and optimal usage based on herd type and condition.",
      },
    ],
  },
  brands: {
    title: "Brands",
    introHeading: "Exclusive agent for three leading brands from Turkey, Saudi Arabia, and Jordan",
    introBody:
      "idvet is the exclusive agent in Iraq for HiPro, Jamuh, and Vet Care, guaranteeing product quality, availability, and fast delivery to every province.",
    cards: [
      {
        logo: ["/assets/hipro-logo.png"],
        logoWidth: 222,
        logoHeight: 59,
        title: "Turkey — Animal Nutrition & Health",
        body: "A Turkish company specialized in animal nutrition and health, developing and marketing innovative protein products that support feed performance, animal growth, and overall health, manufactured to international GMP standards and exported to more than twenty countries worldwide.",
        tags: ["Concentrates", "Premix", "Feed additives", "Supplements"],
        linkText: "Visit HiPro ↗︎",
        href: "https://www.hipro-feed.com/",
      },
      {
        logo: ["/assets/vetcare-logo-part1.svg", "/assets/vetcare-logo-part2.svg"],
        logoWidth: 383,
        logoHeight: 80,
        title: "Jordan — Veterinary Health & Solutions",
        body: "VetCare Jordan is a Jordanian company specialized in developing and marketing veterinary medicines, feed supplements, and animal health solutions for poultry and large animals, with scientific formulations that support health and productivity and meet the needs of veterinarians and breeders with efficiency and quality.",
        tags: ["Performance", "Innovation", "Care", "Animal Health"],
        linkText: "Visit VetCare ↗︎",
        href: "https://vetcare-jo.com/",
      },
      {
        logo: ["/assets/jamuh-logo.svg"],
        logoWidth: 182,
        logoHeight: 86,
        title: "Saudi Arabia — Veterinary Medicines & Supplements",
        body: "AFAQCO is a Saudi company specialized in manufacturing veterinary medicines and supplements, developing practical solutions grounded in scientific research to support the health and productivity of poultry, birds, and large animals, with a focus on manufacturing quality, technical support, and delivering effective results on farms.",
        tags: ["Production support", "Supplements", "Feed additives", "Medicines"],
        linkText: "Visit AFAQCO ↗︎",
        href: "https://afaqco.net/en/",
      },
    ],
  },
  whyUs: {
    title: "Why idvet",
    subtitle: "Trust built on follow-up, not just supply",
    items: [
      {
        icon: "/assets/identity-04.svg",
        title: "Full coverage of Iraq",
        body: "A distribution network that reaches every province, with secured stock and reliable delivery timing.",
      },
      {
        icon: "/assets/identity-06.svg",
        title: "Trusted GMP-standard brands",
        body: "Exclusive agent for brands manufactured to the highest international quality standards.",
      },
      {
        icon: "/assets/identity-05.svg",
        title: "A technical team close to you",
        body: "Field follow-up and direct consultation — not just a distant support line.",
      },
    ],
  },
  gallery: {
    title: "Gallery",
  },
  contact: {
    heading: "Want to become a distributor or partner?",
    body: "Whether you're a veterinary pharmacy, a distributor, or a breeder looking for a trusted product and genuine technical support — get in touch with us.",
    cta: "Message us now",
    emailLabel: "Email",
    email: "info@idvet.co",
    phoneLabel: "Phone / WhatsApp",
    phone: "+964 773 599 5586",
    addressLabel: "Headquarters",
    addressLines: ["Erbil, 44001, Kurdistan, Iraq", "Baghdad, 10082, Iraq"],
  },
  footer: {
    copyright: "All rights reserved © IDVET",
  },
  form: {
    title: "Send us a message",
    name: "Name",
    email: "Email",
    phone: "Phone number",
    message: "Message",
    submit: "Send",
    submitting: "Sending...",
    success: "Your message was sent successfully. We'll be in touch soon.",
    error: "Something went wrong. Please try again.",
    close: "Close",
  },
};
