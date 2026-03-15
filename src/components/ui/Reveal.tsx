"use client";
import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";

export function Reveal({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={clsx("reveal", isVisible && "visible", className)}>
      {children}
    </div>
  );
}
