import Image from "next/image";
import type { ServiceDetail, SiteContent } from "@/lib/content/types";
import { container, HeroButtons, IdvetWatermark } from "./pageParts";

// The Services page body (Figma "Desktop - 6"), between SiteHeader and
// SiteFooter — same responsive approach as BrandsPage: from lg it matches the
// design, below lg the bands stack (image above text) and everything is
// centered.

const centerStacked = "max-lg:text-center";

const SERVICE_IMAGES: Record<ServiceDetail["id"], string> = {
  import: "/assets/services/import-supply.png",
  distribution: "/assets/services/distribution.png",
  delivery: "/assets/services/delivery.jpg",
  consulting: "/assets/services/consulting.jpg",
  afterSales: "/assets/services/after-sales.png",
  marketSupport: "/assets/services/market-support.png",
};

export function ServicesPage({ site }: { site: SiteContent }) {
  const t = site.servicesPage;
  const isEnglish = site.locale === "en";

  return (
    <>
      {/* Hero: image band above the text below lg, full background from lg. */}
      <section className="relative overflow-hidden bg-[#0b1f36] text-white">
        <div className="relative h-[240px] sm:h-[360px] lg:absolute lg:inset-0 lg:h-auto">
          <Image
            src="/assets/services/hero-supply-chain.jpg"
            alt={t.imageAlts.hero}
            fill
            priority
            sizes="100vw"
            // The network sits opposite the text: flip it for left-to-right English.
            className={`object-cover ${isEnglish ? "-scale-x-100" : ""}`}
          />
        </div>
        <div className={`${container} relative py-10 lg:flex lg:h-[814px] lg:flex-col lg:justify-center lg:py-0`}>
          <div className={`max-lg:mx-auto max-lg:max-w-[560px] lg:max-w-[443px] ${centerStacked}`}>
            <p className="text-sm font-bold sm:text-base lg:leading-[44px]">{site.hero.eyebrow}</p>
            <h1 className="mt-3 text-[30px] font-bold leading-[1.4] sm:text-[36px] lg:mt-4 lg:text-[40px] lg:leading-[60px]">
              {t.hero.heading}
            </h1>
            <p className="mt-4 text-base leading-[28px] text-white/90 lg:mt-6 lg:min-h-[140px] lg:max-w-[435px] lg:text-[20px] lg:text-white">
              {t.hero.body}
            </p>
            <HeroButtons site={site} className="mt-8 max-lg:justify-center lg:mt-6" />
          </div>
        </div>
      </section>

      <h2
        className={`${container} pt-12 pb-8 text-center text-[28px] font-bold leading-[38px] text-[#0075be] lg:pt-[63px] lg:pb-[37px] lg:text-[36px] lg:leading-[56px]`}
      >
        {t.title}
      </h2>

      {/* One blue band per service, bleeding off the side the text is on and
          alternating; the image sits flush against its other end. */}
      <div className="overflow-hidden">
        {t.items.map((item, i) => (
          <ServiceBand key={item.id} item={item} labels={t.labels} reversed={i % 2 === 1} />
        ))}
      </div>

      <IdvetWatermark className="-mt-2" />
    </>
  );
}

function ServiceBand({
  item,
  labels,
  reversed,
}: {
  item: ServiceDetail;
  labels: SiteContent["servicesPage"]["labels"];
  reversed: boolean;
}) {
  return (
    <section className={`${container} relative mt-6 first:mt-0 lg:mt-16`}>
      <div
        aria-hidden
        className={`absolute inset-y-0 -start-[50vw] -end-[50vw] bg-[#0075be] ${reversed ? "lg:start-4" : "lg:end-4"}`}
      />
      <div
        className={`relative flex flex-col items-center gap-8 py-10 text-white lg:items-stretch lg:gap-0 lg:py-0 ${
          reversed ? "lg:flex-row-reverse" : "lg:flex-row"
        }`}
      >
        <div
          className={`w-full max-w-[560px] lg:max-w-none lg:flex-1 lg:pt-[27px] lg:pb-8 ${
            reversed ? "lg:ps-5 lg:pe-[26px]" : "lg:ps-[27px] lg:pe-[10px]"
          } ${centerStacked}`}
        >
          <h2 className="text-[24px] leading-[36px] lg:text-[32px] lg:leading-[46px]">{item.title}</h2>
          <div className="mt-4 text-base leading-[28px] lg:mt-[25px] lg:text-[18px]">
            <p className="font-bold">{item.lead}</p>
            {item.paragraphs.map((p, j) => (
              <p key={j}>{p}</p>
            ))}
            <p className="mt-7 font-bold">{labels.audience}</p>
            <p>{item.audience}</p>
            <p className="mt-7 font-bold">{labels.value}</p>
            <p>{item.value}</p>
          </div>
        </div>
        <div className="relative aspect-square w-full max-w-[420px] shrink-0 max-lg:order-first lg:aspect-auto lg:min-h-[518px] lg:w-[49.8%] lg:max-w-none">
          <Image
            src={SERVICE_IMAGES[item.id]}
            alt={item.imageAlt}
            fill
            sizes="(min-width: 1024px) 530px, 420px"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
