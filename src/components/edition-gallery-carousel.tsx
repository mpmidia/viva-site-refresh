import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { CarouselApi } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

export function EditionGalleryCarousel({ images, title }: { images: string[]; title: string }) {
  const [api, setApi] = useState<CarouselApi>();
  const [paused, setPaused] = useState(false);

  const restartLater = useCallback(() => {
    setPaused(true);
    window.setTimeout(() => setPaused(false), 7000);
  }, []);

  useEffect(() => {
    if (!api || paused || images.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => api.scrollNext(), 4500);
    return () => window.clearInterval(timer);
  }, [api, images.length, paused]);

  if (images.length === 0) return null;

  return (
    <Carousel
      setApi={setApi}
      opts={{ align: "start", loop: images.length > 1 }}
      className="mt-10"
      aria-label={`Galeria de fotos da edição ${title}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onPointerDown={restartLater}
    >
      <CarouselContent className="-ml-3">
        {images.map((image, index) => (
          <CarouselItem key={`${image}-${index}`} className="basis-full pl-3 md:basis-1/2 lg:basis-1/3">
            <figure className="h-[64svh] min-h-96 max-h-[46rem] overflow-hidden bg-muted">
              <img
                src={image}
                alt={`Momento ${index + 1} da edição ${title}`}
                className="size-full object-cover transition-transform duration-700 hover:scale-105"
                loading={index > 2 ? "lazy" : "eager"}
              />
            </figure>
          </CarouselItem>
        ))}
      </CarouselContent>

      {images.length > 1 && (
        <>
          <Button
            type="button"
            size="icon"
            onClick={() => { api?.scrollPrev(); restartLater(); }}
            aria-label="Fotos anteriores"
            className="absolute left-3 top-1/2 z-10 size-14 -translate-y-1/2 rounded-full bg-brand-yellow text-foreground shadow-xl hover:bg-brand-pink hover:text-primary-foreground md:left-5 md:size-16 [&_svg]:size-7"
          >
            <ArrowLeft />
          </Button>
          <Button
            type="button"
            size="icon"
            onClick={() => { api?.scrollNext(); restartLater(); }}
            aria-label="Próximas fotos"
            className="absolute right-3 top-1/2 z-10 size-14 -translate-y-1/2 rounded-full bg-brand-yellow text-foreground shadow-xl hover:bg-brand-pink hover:text-primary-foreground md:right-5 md:size-16 [&_svg]:size-7"
          >
            <ArrowRight />
          </Button>
        </>
      )}
    </Carousel>
  );
}