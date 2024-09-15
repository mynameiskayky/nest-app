import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Home, CreditCard, User, LogOut, X } from "lucide-react";

const FullScreenMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const toggleMenu = () => setIsOpen(!isOpen);

  const menuVariants = {
    closed: { opacity: 0, x: "100%" },
    open: { opacity: 1, x: 0 },
  };

  const linkVariants = {
    closed: { opacity: 0, y: 20 },
    open: { opacity: 1, y: 0 },
  };

  return (
    <>
      <button
        onClick={toggleMenu}
        className="fixed top-4 right-4 z-50 p-2 bg-[#00875F] rounded-full shadow-lg"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-0 bg-gradient-to-br from-[#1C1C1E] to-[#2C2C2E] z-40 flex flex-col justify-center items-center"
          >
            <nav className="space-y-8 text-center">
              <motion.div variants={linkVariants} transition={{ delay: 0.1 }}>
                <Link
                  href="/"
                  className="text-3xl text-white hover:text-[#00875F] transition-colors duration-300 flex items-center"
                >
                  <Home className="mr-4" size={32} />
                  Dashboard
                </Link>
              </motion.div>
              <motion.div variants={linkVariants} transition={{ delay: 0.2 }}>
                <Link
                  href="/transactions"
                  className="text-3xl text-white hover:text-[#00875F] transition-colors duration-300 flex items-center"
                >
                  <CreditCard className="mr-4" size={32} />
                  Transações
                </Link>
              </motion.div>
              <motion.div variants={linkVariants} transition={{ delay: 0.3 }}>
                <Link
                  href="/profile"
                  className="text-3xl text-white hover:text-[#00875F] transition-colors duration-300 flex items-center"
                >
                  <User className="mr-4" size={32} />
                  Perfil
                </Link>
              </motion.div>
              {session && (
                <motion.div variants={linkVariants} transition={{ delay: 0.4 }}>
                  <button
                    onClick={() => signOut()}
                    className="text-3xl text-white hover:text-[#00875F] transition-colors duration-300 flex items-center"
                  >
                    <LogOut className="mr-4" size={32} />
                    Sair
                  </button>
                </motion.div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FullScreenMenu;
