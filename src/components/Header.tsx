import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useTransactionContext } from "@/contexts/TransactionContext";

type HeaderProps = {
  children: React.ReactNode;
};

export default function Header({ children }: HeaderProps) {
  const headerRef = useRef<HTMLElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const header = headerRef.current;
    const links = linksRef.current?.children;

    if (!header || !links) return;

    const tl = gsap.timeline({ paused: true });

    tl.fromTo(
      header,
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
    );

    tl.fromTo(
      links,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, ease: "power2.out" },
      "-=0.4"
    );

    tl.play();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      gsap.to(header, {
        backgroundColor:
          window.scrollY > 20 ? "rgba(18, 18, 20, 0.8)" : "transparent",
        boxShadow:
          window.scrollY > 20 ? "0 4px 6px rgba(0, 0, 0, 0.1)" : "none",
        duration: 0.3,
      });
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-4 transition-all duration-300"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#00875F] rounded-full flex items-center justify-center overflow-hidden">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <h1 className="text-2xl font-bold text-white">StoneCO</h1>
        </div>
        <nav ref={linksRef} className="flex gap-8">
          <NavLink href="/">dashboard</NavLink>
          <NavLink href="/investments">investimentos</NavLink>
          <NavLink href="/reports">relatórios</NavLink>
          <NavLink href="/settings">configurações</NavLink>
        </nav>
        <div className="flex items-center gap-4">{children}</div>
      </header>
      <div className="h-[72px]"></div>
    </>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-white hover:text-[#00875F] transition-colors duration-300 relative group"
    >
      {children}
      <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-[#00875F] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out"></span>
    </Link>
  );
}
