"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowRight, CheckCircle2, HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";
import gsap from "gsap";
import type { AboutPageContent } from "@/services/about-page";

type AboutPageClientProps = {
  content: AboutPageContent;
};

export function AboutPageClient({ content }: AboutPageClientProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.from("[data-about-reveal]", {
        autoAlpha: 0,
        y: 28,
        duration: 0.85,
        ease: "power3.out",
        stagger: 0.11,
      });
    }, root);

    return () => ctx.revert();
  }, []);

  const heroImage = content.heroImageUrl || "/img_QuienesSomos.png";
  const secondaryImage = content.secondaryImageUrl || "/fondowan.png";

  return (
    <div ref={rootRef} className="overflow-hidden bg-white text-foreground">
      <section className="relative flex min-h-[520px] items-center overflow-hidden border-b border-border px-5 py-20 text-white md:px-8 lg:px-14">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(90deg,rgba(12,54,52,0.9) 0%,rgba(18,79,77,0.7) 44%,rgba(18,79,77,0.28) 100%),url('${heroImage}')`,
          }}
          aria-hidden="true"
        />
        <div className="relative z-[1] mx-auto flex w-full max-w-[1320px] flex-col items-center text-center">
          <div className="flex max-w-[820px] flex-col items-center">
            <h1
              data-about-reveal
              className="m-0 max-w-[780px] text-[clamp(2.5rem,6vw,5rem)] leading-[1.02] tracking-normal text-white"
            >
              {content.heroTitle}
            </h1>
            <p
              data-about-reveal
              className="mt-5 mb-0 max-w-[720px] text-base leading-8 text-white/88 md:text-lg"
            >
              {content.heroSubtitle}
            </p>
            <div data-about-reveal className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/catalogo"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-6 text-sm font-bold text-primary no-underline transition hover:bg-white/90"
              >
                Ver catálogo
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/contactanos"
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/55 px-6 text-sm font-bold text-white no-underline transition hover:bg-white/12"
              >
                Hablar con un asesor
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-14 md:px-8 lg:px-14 lg:py-20">
        <div className="mx-auto grid max-w-[1320px] gap-10 lg:grid-cols-[0.45fr_1fr]">
          <div data-about-reveal className="grid content-start gap-4">
            <HeartHandshake className="size-10 text-primary" aria-hidden="true" />
            <h2 className="m-0 text-[clamp(2rem,4vw,3.4rem)] leading-tight text-foreground">
              Lo que nos mueve
            </h2>
          </div>
          <div className="grid gap-10">
          {[
            {
              icon: HeartHandshake,
              title: content.missionTitle,
              text: content.missionText,
            },
            {
              icon: ShieldCheck,
              title: content.visionTitle,
              text: content.visionText,
            },
          ].map(({ icon: Icon, title, text }) => (
            <article data-about-reveal key={title} className="border-b border-border pb-10 last:border-b-0 last:pb-0">
              <div className="mb-5 flex items-center gap-3 text-primary">
                <Icon className="size-6" aria-hidden="true" />
                <h2 className="m-0 text-[clamp(1.7rem,3vw,2.55rem)] leading-tight text-foreground">
                {title}
                </h2>
              </div>
              <p className="m-0 max-w-[860px] text-base leading-8 text-muted-foreground md:text-lg">
                {text}
              </p>
            </article>
          ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f7faf9] px-5 py-14 md:px-8 lg:px-14 lg:py-20">
        <div className="mx-auto grid max-w-[1320px] gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div data-about-reveal className="grid gap-5">
            <Sparkles className="size-10 text-primary" aria-hidden="true" />
            <h2 className="m-0 text-[clamp(2rem,4.5vw,4rem)] leading-tight text-foreground">
              {content.valuesTitle}
            </h2>
            <p className="m-0 max-w-[560px] text-base leading-8 text-muted-foreground">
              Principios sencillos para una experiencia honesta, humana y resolutiva.
            </p>
          </div>

          <div className="grid gap-0 border-y border-border">
            {content.values.map((value) => (
              <div
                data-about-reveal
                key={value}
                className="flex min-h-20 items-center gap-4 border-b border-border py-5 last:border-b-0 sm:px-2"
              >
                <CheckCircle2 className="size-5 shrink-0 text-primary" aria-hidden="true" />
                <span className="text-lg font-bold text-foreground">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-14 md:px-8 lg:px-14 lg:py-20">
        <div className="mx-auto grid max-w-[1320px] gap-10 lg:grid-cols-[1fr_0.95fr] lg:items-center">
          <div data-about-reveal className="overflow-hidden rounded-lg border border-border bg-white shadow-[0_24px_70px_rgba(15,61,59,0.12)]">
            <Image
              src={secondaryImage}
              alt="Ortopedia CEMYDI en Huejutla"
              width={900}
              height={640}
              className="h-[360px] w-full object-cover md:h-[520px]"
            />
          </div>
          <div data-about-reveal className="grid gap-5">
            <h2 className="m-0 text-[clamp(2rem,4vw,3.7rem)] leading-tight text-foreground">
              {content.storyTitle}
            </h2>
            <p className="m-0 text-base leading-8 text-muted-foreground md:text-lg">
              {content.storyText}
            </p>
            <Link
              href="/contactanos"
              className="inline-flex min-h-12 w-fit items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground no-underline transition hover:bg-[#154f4d]"
            >
              Visítanos
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
