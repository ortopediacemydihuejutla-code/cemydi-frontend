"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";

import type { HomeTestimonial } from "@/services/reviews";

const MIN_HOME_TESTIMONIALS = 3;

type Props = {
  testimonials: HomeTestimonial[];
};

type SliderTestimonial = {
  id: number;
  quote: string;
  name: string;
  username: string;
  rating: number;
};

function getVisibleCount(width: number) {
  if (width >= 1280) return 3;
  if (width >= 768) return 2;
  return 1;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "CL";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function RatingStars({ rating }: { rating: number }) {
  const safe = Math.max(0, Math.min(5, Math.round(rating)));

  return (
    <div className="flex items-center gap-0.5" aria-label={`${safe} de 5 estrellas`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={
            index < safe
              ? "size-4 fill-[#f5b942] text-[#f5b942]"
              : "size-4 fill-transparent text-[#c8d9dd]"
          }
          aria-hidden
        />
      ))}
    </div>
  );
}

export default function TestimonialsSection({ testimonials }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(1024);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [direction, setDirection] = useState(1);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const sliderTestimonials = useMemo<SliderTestimonial[]>(
    () =>
      testimonials.map((testimonial) => ({
        id: testimonial.id,
        quote: testimonial.comment,
        name: testimonial.user.nombre,
        username: testimonial.product.clasificacion || testimonial.product.nombre,
        rating: testimonial.rating,
      })),
    [testimonials],
  );

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const visibleCount = Math.min(
    getVisibleCount(windowWidth),
    Math.max(1, sliderTestimonials.length),
  );
  const maxIndex = Math.max(0, sliderTestimonials.length - visibleCount);
  const activeIndex = Math.min(currentIndex, maxIndex);
  const canGoNext = activeIndex < maxIndex;
  const canGoPrev = activeIndex > 0;

  useEffect(() => {
    if (!isAutoPlaying || maxIndex === 0) return undefined;

    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((previous) => {
        if (previous >= maxIndex) {
          setDirection(-1);
          return Math.max(0, previous - 1);
        }

        if (previous <= 0) {
          setDirection(1);
          return Math.min(maxIndex, previous + 1);
        }

        return Math.max(0, Math.min(maxIndex, previous + direction));
      });
    }, 4000);

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [direction, isAutoPlaying, maxIndex]);

  const disableAutoPlay = () => {
    setIsAutoPlaying(false);
  };

  const goNext = () => {
    if (!canGoNext) return;
    setDirection(1);
    setCurrentIndex((previous) => Math.min(Math.min(previous, maxIndex) + 1, maxIndex));
    disableAutoPlay();
  };

  const goPrev = () => {
    if (!canGoPrev) return;
    setDirection(-1);
    setCurrentIndex((previous) => Math.max(Math.min(previous, maxIndex) - 1, 0));
    disableAutoPlay();
  };

  const goToSlide = (index: number) => {
    setDirection(index > activeIndex ? 1 : -1);
    setCurrentIndex(Math.max(0, Math.min(index, maxIndex)));
    disableAutoPlay();
  };

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 30;

    if (info.offset.x < -swipeThreshold) {
      goNext();
    } else if (info.offset.x > swipeThreshold) {
      goPrev();
    }
  };

  if (sliderTestimonials.length < MIN_HOME_TESTIMONIALS) {
    return null;
  }

  return (
    <section
      className="overflow-hidden bg-gradient-to-b from-[#f8fbfb] to-white px-4 py-12 sm:py-20"
      aria-labelledby="testimonios-titulo"
    >
      <div className="mx-auto w-full max-w-[80rem]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center sm:mb-12 md:mb-16"
        >
          <span className="inline-block rounded-full bg-[#258e8b]/10 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-[#258e8b] uppercase">
            Testimonios
          </span>
          <h2
            id="testimonios-titulo"
            className="mt-3 px-4 text-2xl font-bold tracking-tight text-[#0f2a32] sm:mt-4 sm:text-3xl md:text-4xl"
          >
            Personas que confían en CEMYDI
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#4a6670] sm:text-[1.05rem]">
            Cada comentario viene de reseñas reales moderadas por nuestro equipo. Aquí reunimos
            experiencias de compra, renta y asesoría para que puedas elegir con más confianza.
          </p>
          <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-[#258e8b] sm:mt-6 sm:w-24" />
        </motion.div>

        <div className="relative" ref={containerRef}>
          <div className="mb-4 flex justify-center gap-2 sm:absolute sm:-top-16 sm:right-0 sm:mb-0">
            <motion.button
              type="button"
              whileHover={{ scale: canGoPrev ? 1.1 : 1 }}
              whileTap={{ scale: canGoPrev ? 0.95 : 1 }}
              onClick={goPrev}
              disabled={!canGoPrev}
              className={
                canGoPrev
                  ? "grid size-11 place-items-center rounded-full bg-white text-[#258e8b] shadow-md transition hover:bg-[#f0f7f7]"
                  : "grid size-11 cursor-not-allowed place-items-center rounded-full bg-[#e8f0f1] text-[#94a8ad]"
              }
              aria-label="Testimonio anterior"
            >
              <ChevronLeft className="size-5" aria-hidden />
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: canGoNext ? 1.1 : 1 }}
              whileTap={{ scale: canGoNext ? 0.95 : 1 }}
              onClick={goNext}
              disabled={!canGoNext}
              className={
                canGoNext
                  ? "grid size-11 place-items-center rounded-full bg-white text-[#258e8b] shadow-md transition hover:bg-[#f0f7f7]"
                  : "grid size-11 cursor-not-allowed place-items-center rounded-full bg-[#e8f0f1] text-[#94a8ad]"
              }
              aria-label="Siguiente testimonio"
            >
              <ChevronRight className="size-5" aria-hidden />
            </motion.button>
          </div>

          <div className="relative overflow-hidden px-2 sm:px-0">
            <motion.div
              className="flex"
              animate={{ x: `-${activeIndex * (100 / visibleCount)}%` }}
              transition={{
                type: "spring",
                stiffness: 70,
                damping: 20,
              }}
            >
              {sliderTestimonials.map((testimonial) => (
                <motion.div
                  key={testimonial.id}
                  className="w-full flex-shrink-0 p-2 md:w-1/2 xl:w-1/3"
                  initial={{ opacity: 0.5, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={handleDragEnd}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.98, cursor: "grabbing" }}
                  style={{ cursor: "grab" }}
                >
                  <motion.article
                    className="relative flex h-full min-h-[280px] flex-col overflow-hidden rounded-2xl border border-[#d4e4e7] bg-white p-5 shadow-lg shadow-[#258e8b]/5 sm:p-6"
                    whileHover={{
                      boxShadow:
                        "0 18px 36px rgba(19, 78, 74, 0.11), 0 8px 16px rgba(19, 78, 74, 0.07)",
                    }}
                  >
                    <div className="absolute -top-4 -left-4 opacity-10">
                      <Quote className="size-14 text-[#258e8b] sm:size-16" aria-hidden />
                    </div>

                    <div className="relative flex h-full flex-col">
                      <div className="mb-4">
                        <RatingStars rating={testimonial.rating} />
                      </div>
                      <p className="line-clamp-6 text-sm leading-relaxed font-medium text-[#4a6670] sm:text-base">
                        &ldquo;{testimonial.quote}&rdquo;
                      </p>

                      <div className="mt-auto border-t border-[#e8f0f1] pt-4">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <div
                              className="grid size-10 place-items-center rounded-full border-2 border-white bg-[#154f4d] text-sm font-extrabold tracking-wide text-white shadow-sm sm:size-12"
                              aria-label={`Iniciales de ${testimonial.name}`}
                            >
                              {getInitials(testimonial.name)}
                            </div>
                            <motion.div
                              className="absolute inset-0 rounded-full bg-[#2ba2a1]/20"
                              animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0, 0.3, 0],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                repeatDelay: 1,
                              }}
                            />
                          </div>
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-bold text-[#0f2a32] sm:text-base">
                              {testimonial.name}
                            </h3>
                            <p className="truncate text-xs font-semibold text-[#6b858c] sm:text-sm">
                              {testimonial.username}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <div className="mt-6 flex justify-center sm:mt-8">
            {Array.from({ length: maxIndex + 1 }, (_, index) => (
              <motion.button
                key={index}
                type="button"
                onClick={() => goToSlide(index)}
                className="relative mx-1 grid size-6 place-items-center focus:outline-none"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                aria-label={`Ir al testimonio ${index + 1}`}
              >
                <motion.div
                  className={
                    index === activeIndex
                      ? "size-2 rounded-full bg-[#258e8b]"
                      : "size-2 rounded-full bg-[#c8d9dd]"
                  }
                  animate={{
                    scale: index === activeIndex ? [1, 1.2, 1] : 1,
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: index === activeIndex ? Infinity : 0,
                    repeatDelay: 1,
                  }}
                />
                {index === activeIndex ? (
                  <motion.div
                    className="absolute size-2 rounded-full bg-[#2ba2a1]/30"
                    animate={{
                      scale: [1, 1.8],
                      opacity: [1, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                    }}
                  />
                ) : null}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
