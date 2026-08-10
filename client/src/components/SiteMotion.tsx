import { useEffect } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { useLenis } from "lenis/react";

interface SiteMotionProps {
  routeKey: string;
}

export default function SiteMotion({ routeKey }: SiteMotionProps) {
  const reduceMotion = useReducedMotion();
  const lenis = useLenis();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 32,
    mass: 0.25,
  });

  useEffect(() => {
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
      return;
    }

    window.scrollTo({ top: 0, behavior: "auto" });
  }, [lenis, routeKey]);

  return (
    <motion.div
      aria-hidden="true"
      className="site-scroll-progress"
      style={{ scaleX: reduceMotion ? 0 : progress }}
    />
  );
}
