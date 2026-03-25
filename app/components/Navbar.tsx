"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black/60 backdrop-blur-md border-b border-red-900/40">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm group-hover:bg-red-500 transition-colors">
            A
          </div>
          <span className="text-xl font-bold tracking-widest text-white uppercase">
            Amadeus
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className="text-gray-300 hover:text-red-400 transition-colors text-sm tracking-wide uppercase"
          >
            Home
          </Link>
          <Link
            href="/chat"
            className="text-gray-300 hover:text-red-400 transition-colors text-sm tracking-wide uppercase"
          >
            Chat
          </Link>
          <Link
            href="/about"
            className="text-gray-300 hover:text-red-400 transition-colors text-sm tracking-wide uppercase"
          >
            About
          </Link>
          <Link
            href="/chat"
            className="ml-4 px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-full transition-colors tracking-wide"
          >
            Launch System
          </Link>
          <a href="https://www.patreon.com/c/RounenRais/membership" className="text-gray-300 hover:text-red-400 transition-colors text-sm tracking-wide uppercase">
            Buy Me A Coffee
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-300 hover:text-white"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-black/90 border-t border-red-900/30 px-6 py-4 flex flex-col gap-4">
          <Link
            href="/"
            className="text-gray-300 hover:text-red-400 transition-colors text-sm tracking-wide uppercase"
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/chat"
            className="text-gray-300 hover:text-red-400 transition-colors text-sm tracking-wide uppercase"
            onClick={() => setMenuOpen(false)}
          >
            Chat
          </Link>
          <Link
            href="/about"
            className="text-gray-300 hover:text-red-400 transition-colors text-sm tracking-wide uppercase"
            onClick={() => setMenuOpen(false)}
          >
            About
          </Link>
                    <a href="https://www.patreon.com/c/RounenRais/membership" className="text-gray-300 hover:text-red-400 transition-colors text-sm tracking-wide uppercase">
            Buy Me A Coffee
          </a>
          <Link
            href="/chat"
            className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-full transition-colors tracking-wide text-center"
            onClick={() => setMenuOpen(false)}
          >
            Launch System
          </Link>
        </div>
      )}
    </nav>
  );
}
