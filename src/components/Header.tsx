"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { LogOut, Home, CreditCard, User } from "lucide-react";
import { Logo } from "./Logo";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  icon: React.ReactNode;
  onClick?: () => void;
}

const Header = () => {
  const { data: session } = useSession();
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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[rgba(29,29,31,0.72)] border-b border-[#424245]"
            : "bg-transparent"
        } backdrop-blur-[20px]`}
      >
        <div className="py-8 mx-8 flex justify-between items-center">
          <Logo />

          <nav className="hidden md:flex space-x-8">
            <NavLink href="/" icon={<Home size={16} />}>
              Dashboard
            </NavLink>
            <NavLink href="/transactions" icon={<CreditCard size={16} />}>
              Transações
            </NavLink>
            <NavLink href="/profile" icon={<User size={16} />}>
              Perfil
            </NavLink>
          </nav>

          <div className="flex items-center space-x-4">
            {session && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => signOut()}
                className="flex items-center space-x-2 p-2 rounded-full text-white"
              >
                <LogOut size={18} />
                <span className="hidden md:inline text-sm">Sair</span>
              </motion.button>
            )}
          </div>
        </div>
      </header>
      <div className="h-16 mb-8"></div>
    </>
  );
};

const NavLink: React.FC<NavLinkProps> = ({ href, children, icon, onClick }) => (
  <Link href={href}>
    <motion.a
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center space-x-2 text-sm text-gray-300 hover:text-white transition-colors duration-200"
      onClick={onClick}
    >
      {icon}
      <span>{children}</span>
    </motion.a>
  </Link>
);

export default Header;
