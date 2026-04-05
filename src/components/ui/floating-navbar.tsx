"use client";
import React, { useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

export const FloatingNav = ({
  navItems,
  className,
}: {
  navItems: {
    name: string;
    link: string;
    icon?: React.ReactNode;
  }[];
  className?: string;
}) => {
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    if (typeof current === "number") {
      let direction = current! - scrollYProgress.getPrevious()!;
      if (scrollYProgress.get() < 0.05) {
        setVisible(false);
      } else {
        if (direction < 0) {
          setVisible(true);
        } else {
          setVisible(false);
        }
      }
    }
  });

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 1, y: -100 }}
        animate={{ y: visible ? 0 : -100, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "flex fixed top-4 inset-x-0 mx-auto border border-neutral-200 dark:border-neutral-800 rounded-full bg-white/90 dark:bg-black/90 backdrop-blur-md shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] z-[5000] px-4 py-3 md:px-8 md:py-3 items-center justify-center gap-4 sm:gap-6 md:gap-8 w-max max-w-[95%]",
          className
        )}
      >
        {navItems.map((navItem: any, idx: number) => (
          navItem.name === "Riwayat" ? (
            <button
              key={`link=${idx}`}
              onClick={() => window.dispatchEvent(new Event("openHistoryModal"))}
              className={cn(
                "relative items-center flex space-x-1 text-neutral-500 dark:text-brand-gray/80 hover:text-brand-blue transition-colors"
              )}
            >
              <span className="block sm:hidden">{navItem.icon}</span>
              <span className="hidden sm:block text-sm font-medium">{navItem.name}</span>
            </button>
          ) : (
            <Link
              key={`link=${idx}`}
              href={navItem.link}
              className={cn(
                "relative items-center flex space-x-1 text-neutral-500 dark:text-brand-gray/80 hover:text-brand-blue transition-colors"
              )}
            >
              <span className="block sm:hidden">{navItem.icon}</span>
              <span className="hidden sm:block text-sm font-medium">{navItem.name}</span>
            </Link>
          )
        ))}
        <Link
          href="#aspirasi"
          className="border text-sm font-medium relative border-brand-blue/50 text-brand-blue dark:text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full hover:bg-brand-blue hover:text-white hover:border-brand-blue transition-all"
        >
          <span>Kirim Aspirasi</span>
          <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-brand-blue to-transparent h-px" />
        </Link>
      </motion.div>
    </AnimatePresence>
  );
};
