"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="flex items-center justify-between py-5 px-5 sm:px-0 bg-transparent">
      {/* White background ONLY behind the logo */}
      <div className="bg-white p-2 rounded-md">
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/img/logo.svg"
            alt="Logo"
            width={150}
            height={80}
            priority
            style={{
              filter: "invert(0)", // Prevent color inversion
              color: "white",      // Fallback color
            }}
          />
        </Link>
      </div>

      {/* Mobile menu button */}
      <div className="md:hidden">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Mobile menu panel */}
        {isMenuOpen && (
          <div className="absolute top-24 left-0 right-0 bg-white shadow-lg py-4 px-6 z-50">
            <div className="flex flex-col text-center gap-5 text-lg text-gray-800 font-dolceVita">
              <Link
                href="/about-us"
                className="hover:text-kwontum-darkRed transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About Us
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-8 font-[550] font-dolceVita">
        <Link
          href="/about-us"
          className="nav-link hover:text-brand-secondary hover:scale-105 transition-colors duration-100"
        >
          About Us
        </Link>
      </nav>
    </header>
  );
}
