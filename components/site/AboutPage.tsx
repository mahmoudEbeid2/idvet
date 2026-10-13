import Image from "next/image";
import type { SiteContent } from "@/lib/content/types";
import { centerSmall, container, HeroButtons, Paragraphs } from "./pageParts";

// The About page body (Figma "Desktop - 3"), between SiteHeader and SiteFooter.
// Unlike the home page it is real responsive layout, not the scaled 1440px
// canvas: from lg it matches the design's measurements, below lg the sections
// stack (see pageParts). Logical start/end classes mirror it for English the
// way the home canvas is mirrored.

export function AboutPage({ site }: { site: SiteContent }) {
  const t = site.aboutPage;
  const isEnglish = site.locale === "en";

  return (
    <>
      {/* Hero: image band above the text on phones, full background from lg. */}
      <section className="relative overflow-hidden bg-[#0b1f36] text-white">
        <div className="relative h-[240px] sm:h-[360px] lg:absolute lg:inset-0 lg:h-auto">
          <Image
            src="/assets/about/hero-network-map.png"
            alt={t.imageAlts.hero}
            fill
            priority
            sizes="100vw"
            // The map sits opposite the text: flip it for left-to-right English.
            className={`object-cover ${isEnglish ? "-scale-x-100" : ""}`}
          />
        </div>
        <div className={`${container} relative py-10 lg:flex lg:h-[811px] lg:flex-col lg:justify-center lg:py-0`}>
          <div className={`lg:max-w-[443px] ${centerSmall}`}>
            <p className="text-sm font-bold sm:text-base lg:leading-[44px]">{site.hero.eyebrow}</p>
            <h1 className="mt-3 text-[30px] font-bold leading-[1.4] sm:text-[40px] lg:mt-[65px] lg:text-[48px] lg:leading-[74px]">
              {t.hero.heading}
            </h1>
            <p className="mt-4 text-base leading-[28px] text-white/90 lg:mt-[21px] lg:min-h-[112px] lg:max-w-[435px] lg:text-[20px] lg:text-white">
              {t.hero.body}
            </p>
            <HeroButtons site={site} className="mt-8 lg:mt-[69px]" />
          </div>
        </div>
      </section>

      {/* Who we are — the hand is clipped by the section's bottom edge. */}
      <section className="relative overflow-hidden bg-[#f0efef]">
        <div className={`${container} relative py-10 lg:min-h-[292px] lg:pt-[39px] lg:pb-8`}>
          <div className={`relative z-10 xl:max-w-[705px] ${centerSmall}`}>
            <h2 className="text-[28px] font-medium leading-[36px] text-[#0075be] lg:text-[36px]">
              {t.whoWeAre.title}
            </h2>
            <Paragraphs
              paragraphs={t.whoWeAre.paragraphs}
              className="mt-4 text-base leading-[28px] text-[#4d4d4d] lg:mt-[17px] lg:text-[20px]"
            />
          </div>
          <div className="absolute -end-[56px] top-0 hidden size-[389px] xl:block">
            <Image src="/assets/about/about-hand.png" alt="" fill sizes="389px" className="object-cover" />
          </div>
        </div>
      </section>

      {/* Our story */}
      <section className="bg-[#0075be] text-white">
        <div
          className={`${container} flex flex-col items-center gap-8 py-12 lg:min-h-[420px] lg:flex-row lg:items-start lg:gap-[7px] lg:py-0`}
        >
          <div className="relative size-[220px] shrink-0 sm:size-[280px] lg:-ms-[5px] lg:mt-[31px] lg:size-[358px]">
            <Image
              src="/assets/about/story-puzzle.png"
              alt={t.imageAlts.story}
              fill
              sizes="(min-width: 1024px) 358px, 280px"
              className="object-cover"
            />
          </div>
          <div className={`w-full lg:max-w-[705px] lg:pt-[67px] lg:pb-[74px] ${centerSmall}`}>
            <h2 className="text-[28px] font-medium leading-[36px] lg:text-[36px]">{t.story.title}</h2>
            <Paragraphs paragraphs={t.story.paragraphs} className="mt-4 text-base leading-[28px] lg:mt-[19px] lg:text-[20px]" />
          </div>
        </div>
      </section>

      {/* Mission and vision */}
      <section className={`${container} grid gap-12 py-12 lg:min-h-[463px] lg:grid-cols-2 lg:gap-[15px] lg:pt-[26px] lg:pb-[24px]`}>
        {[
          { block: t.mission, icon: "/assets/about/mission-icon.png" },
          { block: t.vision, icon: "/assets/about/vision-icon.png" },
        ].map(({ block, icon }) => (
          <div key={icon} className={centerSmall}>
            <div className="relative size-[96px] max-[719px]:mx-auto lg:size-[126px]">
              <Image src={icon} alt="" fill sizes="126px" className="object-cover" />
            </div>
            <h2 className="mt-6 text-[28px] font-bold leading-[38px] text-[#0075be] lg:mt-[35px] lg:text-[36px]">
              {block.title}
            </h2>
            <Paragraphs
              paragraphs={block.paragraphs}
              className="mt-3 text-base leading-[32px] text-[#0075be] lg:mt-[17px] lg:text-[20px] lg:leading-[36px]"
            />
          </div>
        ))}
      </section>
    </>
  );
}
