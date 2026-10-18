import Image from "next/image";
import type { BrandProfile, SiteContent } from "@/lib/content/types";
import { container, HeroButtons, IdvetWatermark, Paragraphs } from "./pageParts";

// The Brands page body (Figma "Desktop - 5"), between SiteHeader and
// SiteFooter — same responsive approach as AboutPage (see pageParts), except
// that everything is centered for as long as the sections are stacked (below
// lg), not only below 720px.

const centerStacked = "max-lg:text-center";

/** Each brand's wordmark above its text, and the large mark beside it. */
const BRAND_ART: Record<
  BrandProfile["id"],
  { logo: React.ReactNode; mark: { src: string; width: number; height: number; className: string } }
> = {
  hipro: {
    logo: (
      // The wordmark's image runs 20px past the text's edge in the design.
      <div className="relative h-[55px] w-[206px] max-lg:mx-auto lg:-ms-5 lg:h-[73px] lg:w-[275px]">
        <Image src="/assets/hipro-logo.png" alt="HiPro" fill sizes="275px" className="object-cover" />
      </div>
    ),
    mark: { src: "/assets/brands/hipro-mark.png", width: 250, height: 247, className: "w-[180px] lg:w-[250px]" },
  },
  vetcare: {
    logo: (
      // Two-part logo (badge + wordmark) with the home section's insets; its
      // box has ~14% empty space on each side, pulled out past the text edge.
      <div className="relative aspect-[383/80] w-[287px] max-lg:mx-auto sm:w-[383px] lg:-ms-[51px]">
        <div className="absolute" style={{ inset: "13.85% 64.43% 13.83% 13.86%" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/vetcare-logo-part1.svg" alt="VetCare" className="block size-full object-contain" />
        </div>
        <div className="absolute" style={{ inset: "23.91% 13.85% 23.91% 37.78%" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/vetcare-logo-part2.svg" alt="" className="block size-full object-contain" />
        </div>
      </div>
    ),
    mark: { src: "/assets/brands/vetcare-mark.png", width: 261, height: 272, className: "w-[188px] lg:w-[261px]" },
  },
  jamuh: {
    logo: (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/assets/brands/jamuh-logo.svg"
        alt="Jamuh"
        width={182}
        height={86}
        className="block h-[64px] w-auto max-lg:mx-auto lg:h-[86px]"
      />
    ),
    mark: { src: "/assets/brands/jamuh-mark.png", width: 327, height: 277, className: "w-[220px] lg:w-[327px]" },
  },
};

export function BrandsPage({ site }: { site: SiteContent }) {
  const t = site.brandsPage;
  const isEnglish = site.locale === "en";

  return (
    <>
      {/* Hero: image band above the text on phones, full background from lg. */}
      <section className="relative overflow-hidden bg-[#0b1f36] text-white">
        <div className="relative h-[240px] sm:h-[360px] lg:absolute lg:inset-0 lg:h-auto">
          <Image
            src="/assets/brands/hero-logistics-hub.png"
            alt={t.imageAlts.hero}
            fill
            priority
            sizes="100vw"
            // The globe sits opposite the text: flip it for left-to-right English.
            className={`object-cover ${isEnglish ? "-scale-x-100" : ""}`}
          />
        </div>
        <div className={`${container} relative py-10 lg:flex lg:h-[811px] lg:flex-col lg:justify-center lg:py-0`}>
          <div className={`lg:max-w-[443px] ${centerStacked}`}>
            <p className="text-sm font-bold sm:text-base lg:leading-[44px]">{site.hero.eyebrow}</p>
            <h1 className="mt-3 text-[30px] font-bold leading-[1.4] sm:text-[36px] lg:mt-4 lg:text-[40px] lg:leading-[60px]">
              {t.hero.heading}
            </h1>
            <p className="mt-4 text-base leading-[28px] text-white/90 lg:mt-[29px] lg:min-h-[126px] lg:max-w-[435px] lg:text-[20px] lg:text-white">
              {t.hero.body}
            </p>
            <HeroButtons site={site} brandsHref="#brand-list" className="mt-8 max-lg:justify-center lg:mt-4" />
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className={`${container} py-12 text-center lg:py-[104px]`}>
        <h2 className="text-[28px] font-bold leading-[38px] text-[#0075be] lg:text-[36px] lg:leading-[56px]">
          {t.intro.title}
        </h2>
        <Paragraphs
          paragraphs={t.intro.paragraphs}
          className="mt-4 text-lg leading-[30px] text-[#4d4d4d] sm:text-[22px] sm:leading-[36px] lg:mt-0 lg:text-[32px] lg:leading-[46px]"
        />
      </section>

      {/* One section per brand, grey and white in turn; the mark sits opposite the text. */}
      <div id="brand-list" className="scroll-mt-[85px] lg:scroll-mt-0">
        {t.brands.map((brand, i) => (
          <BrandSection key={brand.id} brand={brand} reversed={i % 2 === 1} />
        ))}
      </div>

      {/* How we support our brands */}
      <section className="bg-[#0075be] text-white">
        <div className={`${container} py-12 lg:pt-[38px] lg:pb-[62px]`}>
          <div className="flex items-center gap-4 max-lg:flex-col max-lg:text-center lg:gap-[17px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/brands/iraq-map-white.svg" alt="" width={67} height={67} className="size-[56px] shrink-0 lg:size-[67px]" />
            <h2 className="text-[26px] font-medium leading-[36px] lg:text-[36px]">{t.support.title}</h2>
          </div>
          <div className={`mt-6 lg:mt-6 ${centerStacked}`}>
            <p className="text-[24px] font-medium leading-[36px] lg:text-[36px]">{t.support.heading}</p>
            <p className="mt-2 text-lg font-light leading-[32px] lg:mt-0 lg:text-[24px] lg:leading-[42px]">{t.support.lead}</p>
            <p className="text-lg font-light leading-[32px] underline lg:text-[24px] lg:leading-[36px]">{t.support.listIntro}</p>
          </div>
          <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:mt-[49px] lg:gap-x-[15px] lg:gap-y-[21px]">
            {t.support.items.map((item) => (
              <li
                key={item.title}
                className={`flex min-h-[158px] flex-col justify-center rounded-[50px] bg-[#f0efef] px-8 py-6 text-[18px] leading-[32px] text-[#196cb5] lg:ps-5 lg:pe-8 lg:text-[20px] lg:leading-[36px] ${centerStacked}`}
              >
                <h3 className="font-bold">{item.title}</h3>
                <p>{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* A portfolio built on trust */}
      <section className={`${container} flex flex-col items-center gap-6 pt-12 lg:flex-row lg:items-start lg:gap-[21px] lg:pt-[74px]`}>
        <div className="relative size-[180px] shrink-0 lg:size-[245px]">
          <Image src="/assets/brands/portfolio-folder.png" alt={t.imageAlts.portfolio} fill sizes="245px" className="object-cover" />
        </div>
        <div className={`lg:max-w-[795px] lg:pt-4 ${centerStacked}`}>
          <h2 className="text-[28px] font-medium leading-[36px] text-[#0075be] lg:text-[36px]">{t.trust.title}</h2>
          <Paragraphs
            paragraphs={t.trust.paragraphs}
            className="mt-3 text-lg font-light leading-[32px] text-[#0075be] lg:mt-0 lg:text-[24px] lg:leading-[42px]"
          />
        </div>
      </section>

      <IdvetWatermark className="mt-5" />
    </>
  );
}

function BrandSection({ brand, reversed }: { brand: BrandProfile; reversed: boolean }) {
  const art = BRAND_ART[brand.id];

  return (
    <section className={reversed ? "bg-white" : "bg-[#f0efef]"}>
      <div
        className={`${container} flex flex-col items-center gap-10 py-12 lg:items-center lg:gap-0 lg:py-12 ${
          reversed ? "lg:flex-row-reverse" : "lg:flex-row"
        }`}
      >
        <div className={`w-full lg:w-[610px] lg:shrink-0 ${centerStacked}`}>
          {art.logo}
          <h2 className="mt-5 text-[20px] font-bold leading-[32px] text-[#0075be] lg:mt-6 lg:text-[22px] lg:leading-[36px]">
            <bdi>{brand.title}</bdi>
            <span className="block">{brand.subtitle}</span>
          </h2>
          <Paragraphs
            paragraphs={brand.paragraphs}
            className="mt-6 text-base leading-[30px] text-[#4d4d4d] lg:mt-9 lg:text-[20px] lg:leading-[36px]"
          />
          <ul className="mt-8 flex flex-wrap gap-3 max-lg:justify-center lg:mt-10 lg:gap-x-[34px] lg:gap-y-4">
            {brand.tags.map((tag) => (
              <li
                key={tag}
                className="flex h-[46px] min-w-[90px] items-center justify-center rounded-[50px] border border-[#006db2] bg-white px-4 text-[12px] text-[#0075be] lg:h-[58px] lg:px-[18px]"
              >
                {tag}
              </li>
            ))}
          </ul>
          <a
            href={brand.href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block text-base font-bold leading-[36px] text-[#0075be] underline hover:text-[#005a92] lg:mt-7"
          >
            {brand.linkText}
          </a>
        </div>
        <div className="flex flex-1 justify-center">
          <Image
            src={art.mark.src}
            alt=""
            width={art.mark.width}
            height={art.mark.height}
            sizes={`${art.mark.width}px`}
            className={`h-auto ${art.mark.className}`}
          />
        </div>
      </div>
    </section>
  );
}
