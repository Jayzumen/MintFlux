"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

interface Props {
  children: React.ReactNode;
}

export default function ViewTransitionWrapper({ children }: Props) {
  const pathname = usePathname();
  const prevPath = useRef(pathname);

  useEffect(() => {
    if (prevPath.current !== pathname && document.startViewTransition) {
      document.startViewTransition(() => {});
      prevPath.current = pathname;
    }
  }, [pathname]);

  return <div id="main-content">{children}</div>;
}
