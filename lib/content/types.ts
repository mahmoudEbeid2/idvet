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
  /** Brand name, used as the logo's alt text. */
  name: string;
  logo: string[];
  logoWidth: number;
  logoHeight: number;
  title: string;
  body: string;
  tags: string[];
  linkText: string;
  href: string;
}

/** Plural forms for one noun; "{n}" is replaced with the count. See lib/catalog/format.ts. */
export interface PluralForms {
  zero?: string;
  one: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
}

export interface SiteContent {
  locale: Locale;
  htmlLang: string;
  nav: {
    contact: string;
    brands: string;
    services: string;
    about: string;
    products: string;
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
  products: {
    // Listing (/products)
    title: string;
    eyebrow: string;
    lead: string;
    searchPlaceholder: string;
    searchButton: string;
    /** Stat labels shown after a bold number, e.g. "4 أقسام". */
    statCategories: PluralForms;
    statProducts: PluralForms;
    statBrands: PluralForms;
    categoriesHeading: string;
    allProductsHeading: string;
    /** "{q}" is replaced with the search text. */
    searchResultsHeading: string;
    noResults: string;
    clearSearch: string;
    emptyCatalog: string;
    viewProducts: string;
    productCount: PluralForms;
    // Cards
    certificateCount: PluralForms;
    noCertificates: string;
    details: string;
    imageCount: string;
    noImage: string;
    // Category page
    breadcrumbHome: string;
    breadcrumbLabel: string;
    /** "{count}" = productCount text, "{name}" = category name. */
    inCategory: string;
    sortLabel: string;
    sortNewest: string;
    sortName: string;
    sortBrand: string;
    sortApply: string;
    emptyCategory: string;
    // Product page
    galleryLabel: string;
    previousImage: string;
    nextImage: string;
    enlargeImage: string;
    close: string;
    brandLabel: string;
    dosageForm: string;
    packaging: string;
    species: string;
    requestQuote: string;
    whatsapp: string;
    /** "{name}" is replaced with the product name. */
    whatsappMessage: string;
    certificatesHeading: string;
    certificateFiles: PluralForms;
    noCertificatesLong: string;
    view: string;
    openInNewTab: string;
    download: string;
    aboutHeading: string;
    usageHeading: string;
    relatedHeading: string;
    /** "{name}" is replaced with the category name. */
    allInCategory: string;
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
  /** Alt text for the home page's content images (decorative ones use ""). */
  imageAlts: {
    hero: string;
    brandsShowcase: string;
    clientsStrip: string;
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
  /** 404 and error pages. */
  status: {
    notFoundTitle: string;
    notFoundBody: string;
    errorTitle: string;
    errorBody: string;
    retry: string;
    backHome: string;
    browseProducts: string;
  };
}
