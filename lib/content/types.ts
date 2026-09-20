export type Locale = "ku" | "ar" | "en";

export interface LanguageOption {
  locale: Locale;
  label: string;
  href: string;
}

export interface ServiceItem {
  /** Rendered as bold line(s); "\n" splits into separate stacked lines. */
  heading: string;
  body: string;
}

export interface WhyUsItem {
  icon: string;
  title: string;
  body: string;
}

export interface BrandCard {
  logo: string[];
  logoWidth: number;
  logoHeight: number;
  title: string;
  body: string;
  tags: string[];
  linkText: string;
  href: string;
}

export interface SiteContent {
  locale: Locale;
  htmlLang: string;
  nav: {
    contact: string;
    brands: string;
    services: string;
    about: string;
  };
  languages: LanguageOption[];
  hero: {
    eyebrow: string;
    heading: string;
    paragraph: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  tagline: string;
  about: {
    title: string;
    heading: string;
    paragraphs: string[];
  };
  services: {
    title: string;
    subtitle: string;
    items: ServiceItem[];
  };
  brands: {
    title: string;
    introHeading: string;
    introBody: string;
    cards: BrandCard[];
  };
  whyUs: {
    title: string;
    subtitle: string;
    items: WhyUsItem[];
  };
  gallery: {
    title: string;
  };
  contact: {
    heading: string;
    body: string;
    cta: string;
    emailLabel: string;
    email: string;
    phoneLabel: string;
    phone: string;
    addressLabel: string;
    addressLines: string[];
  };
  footer: {
    copyright: string;
  };
  form: {
    title: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    submit: string;
    submitting: string;
    success: string;
    error: string;
    close: string;
  };
}
