import { useEffect, useRef, useState, RefObject } from "react";

export function useHeroScrollNavigation(
  heroRef: RefObject<HTMLElement | null>,
  collectionsRef: RefObject<HTMLElement | null>,
  newArrivalsRef: RefObject<HTMLElement | null>
) {
  const [activeSection, setActiveSection] = useState<"hero" | "collections" | "newArrivals" | "other">("hero");
  const isScrollingRef = useRef(false);
  const activeSectionRef = useRef<"hero" | "collections" | "newArrivals" | "other">("hero");

  // Cubic ease-in-out easing curve (premium animation feel)
  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  const animateScroll = (targetY: number, duration: number = 850) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.scrollTo({ top: targetY, behavior: "auto" });
      isScrollingRef.current = false;
      return;
    }

    const startY = window.scrollY;
    const distance = targetY - startY;
    let startTime: number | null = null;

    const animation = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const run = easeInOutCubic(progress);
      
      window.scrollTo(0, startY + distance * run);

      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      } else {
        window.scrollTo(0, targetY);
        // Brief timeout to absorb residual inertia scroll events
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 50);
      }
    };

    isScrollingRef.current = true;
    requestAnimationFrame(animation);
  };

  const scrollToHero = () => {
    const targetY = heroRef.current?.offsetTop || 0;
    animateScroll(targetY, 800);
  };

  const scrollToCollections = () => {
    const targetY = collectionsRef.current?.offsetTop || 0;
    animateScroll(targetY, 800);
  };

  const scrollToNewArrivals = () => {
    const targetY = newArrivalsRef.current?.offsetTop || 0;
    animateScroll(targetY, 800);
  };

  const handleIndicatorClick = () => {
    const currentActive = activeSectionRef.current;
    if (currentActive === "hero") {
      scrollToCollections();
    } else if (currentActive === "collections") {
      scrollToNewArrivals();
    }
  };

  useEffect(() => {
    const heroEl = heroRef.current;
    const collectionsEl = collectionsRef.current;
    const newArrivalsEl = newArrivalsRef.current;
    if (!heroEl || !collectionsEl || !newArrivalsEl) return;

    // Use IntersectionObserver to detect active sections
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target === heroEl) {
              setActiveSection("hero");
              activeSectionRef.current = "hero";
            } else if (entry.target === collectionsEl) {
              setActiveSection("collections");
              activeSectionRef.current = "collections";
            } else if (entry.target === newArrivalsEl) {
              setActiveSection("newArrivals");
              activeSectionRef.current = "newArrivals";
            }
          }
        });
      },
      {
        threshold: 0.3,
      }
    );

    observer.observe(heroEl);
    observer.observe(collectionsEl);
    observer.observe(newArrivalsEl);

    // Track scroll events when far down to set to 'other'
    const handleScrollDetect = () => {
      const newArrivalsTop = newArrivalsRef.current?.offsetTop || 0;
      const newArrivalsHeight = newArrivalsRef.current?.offsetHeight || 0;
      if (window.scrollY > newArrivalsTop + newArrivalsHeight - 100) {
        if (activeSectionRef.current !== "other") {
          setActiveSection("other");
          activeSectionRef.current = "other";
        }
      }
    };

    window.addEventListener("scroll", handleScrollDetect, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScrollDetect);
    };
  }, [heroRef, collectionsRef, newArrivalsRef]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Retain native scroll behavior on mobile & tablet viewports
      if (window.innerWidth < 1024) return;

      const currentActive = activeSectionRef.current;
      const collectionsTop = collectionsRef.current?.offsetTop || 0;

      if (isScrollingRef.current) {
        e.preventDefault();
        return;
      }

      // Snapping between Hero (Section 1) and Shop by Collection (Section 2)
      if (currentActive === "hero" && e.deltaY > 0) {
        e.preventDefault();
        scrollToCollections();
      } else if (currentActive === "collections" && e.deltaY < 0) {
        if (window.scrollY <= collectionsTop + 10) {
          e.preventDefault();
          scrollToHero();
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (window.innerWidth < 1024) return;

      const currentActive = activeSectionRef.current;
      const collectionsTop = collectionsRef.current?.offsetTop || 0;

      if (isScrollingRef.current) {
        if (["ArrowUp", "ArrowDown"].includes(e.key)) {
          e.preventDefault();
        }
        return;
      }

      if (e.key === "ArrowDown" && currentActive === "hero") {
        e.preventDefault();
        scrollToCollections();
      } else if (e.key === "ArrowUp" && currentActive === "collections") {
        if (window.scrollY <= collectionsTop + 10) {
          e.preventDefault();
          scrollToHero();
        }
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [heroRef, collectionsRef]);

  return {
    activeSection,
    scrollToHero,
    scrollToCollections,
    scrollToNewArrivals,
    handleIndicatorClick,
  };
}
