"use client";

import React, { useState, useEffect } from "react";
import { Logo } from "./Logo";
import FullScreenMenu from "./FullScreenMenu";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 w-screen ${
          scrolled
            ? "bg-[rgba(29,29,31,0.72)] border-b border-[#424245]"
            : "bg-transparent"
        } backdrop-blur-[20px]`}
      >
        <div className="py-4 px-4 flex justify-between items-center">
          <Logo />
        </div>
      </header>
      <div className="h-16 mb-8"></div>
      <FullScreenMenu />
    </>
  );
};

export default Header;
