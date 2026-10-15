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

export interface AboutBlock {
  title: string;
  paragraphs: string[];
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
    /** "{brand}" is replaced with the brand name (title of /products?brand=…). */
    brandPageTitle: string;
    filtersHeading: string;
    /** Opens the filter drawer on phones. */
    filtersButton: string;
    brandFilter: string;
    categoryFilter: string;
    /** Label of the button that closes the filter drawer. */
    showResults: string;
    clearAll: string;
    /** "{name}" is the filter value; aria-label of a chip's remove button. */
    removeFilter: string;
    activeFilters: string;
    noResults: string;
    noResultsBody: string;
    emptyCatalog: string;
    productCount: PluralForms;
    sortLabel: string;
    sortRelevance: string;
    sortName: string;
    sortBrand: string;
    sortApply: string;
    // Cards
    details: string;
    imageCount: string;
    noImage: string;
    breadcrumbHome: string;
    breadcrumbLabel: string;
    // Product page
    galleryLabel: string;
    previousImage: string;
    nextImage: string;
    enlargeImage: string;
    close: string;
    brandLabel: string;
    categoryLabel: string;
    dosageForm: string;
    species: string;
    tagsLabel: string;
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
    compositionHeading: string;
    ingredientColumn: string;
    amountColumn: string;
    indicationsHeading: string;
    packSizesHeading: string;
    aboutHeading: string;
    usageHeading: string;
    asideTitle: string;
    asideBody: string;
    relatedHeading: string;
    /** "{name}" is replaced with the category name. */
    allInCategory: string;
    /** "{brand}" is replaced with the brand name. */
    moreFromBrand: string;
    allFromBrand: string;
    // Quote request modal
    quoteTitle: string;
    quoteIntro: string;
    /** "{name}" is replaced with the product name. */
    quoteFor: string;
    quoteName: string;
    quoteContact: string;
    quoteQuantity: string;
    quoteQuantityPlaceholder: string;
    quoteCompany: string;
    quoteCity: string;
    /** Marks a field that can be left empty. */
    quoteOptional: string;
    quoteSend: string;
    quoteSending: string;
    quoteSuccess: string;
    quoteError: string;
    quoteCancel: string;
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
  /** The /{locale}/about page. The hero eyebrow and buttons reuse `hero`. */
  aboutPage: {
    metaTitle: string;
    hero: { heading: string; body: string };
    whoWeAre: AboutBlock;
    /** Story, mission and vision open with a one-line lead paragraph. */
    story: AboutBlock;
    mission: AboutBlock;
    vision: AboutBlock;
    imageAlts: { hero: string; story: string };
  };
  /** The /{locale}/contact page. The hero eyebrow and buttons reuse `hero`, the details `contact`. */
  contactPage: {
    metaTitle: string;
    hero: { heading: string; body: string };
    intro: { title: string; body: string };
    details: { title: string; phoneLabel: string; emailLabel: string; addressLabel: string };
    imageAlts: { hero: string; hand: string };
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
    subject: string;
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
