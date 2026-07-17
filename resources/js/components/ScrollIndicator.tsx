import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface SectionDef {
  id: string;
  nextLabel: string;
  nextId: string;
}

/**
 * Dior-inspired vertical SCROLL indicator.
 * Shows the *next* section's name. Hides after the last listed section.
 */
export function ScrollIndicator({ sections }: { sections: SectionDef[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  /* ── Determine which section is currently in view ── */
  const updateSection = useCallback(() => {
    const scrollMid = window.scrollY + window.innerHeight * 0.6;

    let activeIdx = 0;
    for (let i = 0; i < sections.length; i++) {
      const el = document.getElementById(sections[i].id);
      if (!el) continue;
      if (el.offsetTop <= scrollMid) {
        activeIdx = i;
      }
    }
    setCurrentIndex(activeIdx);

    // Hide when we've scrolled past the last section's threshold
    const lastEl = document.getElementById(sections[sections.length - 1].id);
    if (lastEl) {
      const lastBottom = lastEl.offsetTop + lastEl.offsetHeight;
      setVisible(window.scrollY + window.innerHeight < lastBottom + 120);
    }
  }, [sections]);

  useEffect(() => {
    updateSection();
    window.addEventListener("scroll", updateSection, { passive: true });
    return () => window.removeEventListener("scroll", updateSection);
  }, [updateSection]);

  /* ── Click: scroll to next section ── */
  const handleClick = () => {
    const nextId = sections[currentIndex]?.nextId;
    if (!nextId) return;
    const el = document.getElementById(nextId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const label = sections[currentIndex]?.nextLabel ?? "";

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="scroll-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          onClick={handleClick}
          aria-label={`Scroll to ${label}`}
          style={{
            position: "fixed",
            right: "2rem",
            bottom: "30%",
            zIndex: 50,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            writingMode: "vertical-rl",
            textOrientation: "mixed",
            transform: "rotate(180deg)",
          }}
        >
          {/* Animated label */}
          <AnimatePresence mode="wait">
            <motion.span
              key={label}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.45, ease: "easeInOut" }}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.6rem",
                letterSpacing: "0.22em",
                color: "hsl(0 0% 17%)",
                textTransform: "uppercase",
                fontWeight: 500,
                userSelect: "none",
                lineHeight: 1,
              }}
              className="dark:!text-[hsl(36_33%_92%)]"
            >
              {label}
            </motion.span>
          </AnimatePresence>

          {/* Vertical line with animated dot */}
          <span
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "3px",
            }}
          >
            {/* Static line */}
            <motion.span
              animate={{ scaleY: [1, 0.6, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{
                display: "block",
                width: "1px",
                height: "28px",
                background: "hsl(0 0% 17%)",
                transformOrigin: "bottom",
              }}
              className="dark:!bg-[hsl(36_33%_92%)]"
            />
            {/* Dot */}
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{
                display: "block",
                width: "3px",
                height: "3px",
                borderRadius: "50%",
                background: "hsl(0 0% 17%)",
              }}
              className="dark:!bg-[hsl(36_33%_92%)]"
            />
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
