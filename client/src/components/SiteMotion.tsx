import { useEffect } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";

interface SiteMotionProps {
  routeKey: string;
}

export default function SiteMotion({ routeKey }: SiteMotionProps) {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 32,
    mass: 0.25,
  });

  useEffect(() => {
    const root = document.documentElement;
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-motion-reveal], [data-motion-item]")
    );

    root.dataset.motionReady = "true";

    if (reduceMotion || !("IntersectionObserver" in window)) {
      elements.forEach((element) => {
        element.dataset.motionState = "visible";
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          (entry.target as HTMLElement).dataset.motionState = "visible";
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8%", threshold: 0.12 }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [reduceMotion, routeKey]);

  return (
    <motion.div
      aria-hidden="true"
      className="site-scroll-progress"
      style={{ scaleX: reduceMotion ? 0 : progress }}
    />
  );
}
