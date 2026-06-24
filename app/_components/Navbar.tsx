"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import EnrollmentModal from "./EnrollmentModal";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  { name: "Batches", href: "/batches" },
  { name: "Blogs", href: "/blogs" },
  { name: "Videos", href: "/videos" },
  { name: "Contact", href: "/contact" },
];

function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const pathname = usePathname();
  const [resources, setResources] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<any>(null);
  const [resourcesOpen, setResourcesOpen] = useState(false);

  useEffect(() => {
    async function fetchResources() {
      try {
        const res = await fetch("/api/resources");
        if (res.ok) {
          const data = await res.json();
          setResources(data || []);
          if (data && data.length > 0) {
            setActiveCategory(data[0]);
          }
        }
      } catch {
        // Fail silently
      }
    }
    fetchResources();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Block body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <nav
      className={cn(
        "sticky top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        scrolled
          ? "bg-white/90 backdrop-blur-md border-gray-200 py-2 md:py-3 shadow-sm"
          : "bg-white/85 backdrop-blur border-transparent py-2 md:py-4"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/assets/photos/logo1.png"
              alt="Rankers Hub Logo"
              width={80}
              height={80}
              className="h-16 sm:h-20 md:h-24 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "text-sm font-bold transition-colors hover:text-primary uppercase tracking-wide",
                  pathname === link.href
                    ? "text-primary underline underline-offset-8"
                    : "text-gray-700"
                )}
              >
                {link.name}
              </Link>
            ))}

            {/* Resources Two-Column Dropdown (Tarkashastra Style) */}
            {resources.length > 0 && (
              <div 
                className="relative group py-4"
                onMouseEnter={() => {
                  if (!activeCategory && resources[0]) {
                    setActiveCategory(resources[0]);
                  }
                }}
              >
                <button
                  type="button"
                  className={cn(
                    "text-sm font-bold transition-colors hover:text-primary uppercase tracking-wide flex items-center gap-1 cursor-pointer bg-transparent border-none outline-none py-1",
                    pathname?.startsWith("/resources") ? "text-primary" : "text-gray-700"
                  )}
                >
                  Resources <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180 text-gray-400" />
                </button>

                {/* Dropdown Box */}
                <div className="absolute top-[100%] left-1/2 -translate-x-1/2 w-[550px] bg-white border border-gray-150 rounded-3xl shadow-xl shadow-gray-200/50 p-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 flex gap-6 mt-1 pointer-events-auto">
                  {/* Left Column: Categories List */}
                  <div className="w-1/2 border-r border-gray-100 pr-4 space-y-1">
                    {resources.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onMouseEnter={() => setActiveCategory(cat)}
                        onClick={() => setActiveCategory(cat)}
                        className={cn(
                          "w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-between transition-all cursor-pointer",
                          activeCategory?.id === cat.id
                            ? "bg-primary/5 text-primary"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                      >
                        <span>{cat.name}</span>
                        <ChevronRight className={cn("w-4 h-4 transition-transform", activeCategory?.id === cat.id ? "translate-x-0.5 opacity-100" : "opacity-0")} />
                      </button>
                    ))}
                  </div>

                  {/* Right Column: Links under hovered category */}
                  <div className="w-1/2 pl-2 space-y-4 max-h-[300px] overflow-y-auto">
                    {activeCategory ? (
                      (() => {
                        const grouped: Record<string, any[]> = {};
                        const ungrouped: any[] = [];
                        (activeCategory.links || []).forEach((link: any) => {
                          if (link.group_name) {
                            if (!grouped[link.group_name]) grouped[link.group_name] = [];
                            grouped[link.group_name].push(link);
                          } else {
                            ungrouped.push(link);
                          }
                        });

                        return (
                          <div className="space-y-4">
                            {/* Ungrouped links first */}
                            {ungrouped.map((link) => (
                              <Link
                                key={link.id}
                                href={link.url}
                                className="block text-sm font-bold text-gray-700 hover:text-primary transition-colors py-1 flex items-center justify-between"
                              >
                                <span>{link.title}</span>
                                <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover/link:opacity-100" />
                              </Link>
                            ))}

                            {/* Grouped links */}
                            {Object.entries(grouped).map(([groupName, groupLinks]) => (
                              <div key={groupName} className="space-y-2 border-t border-gray-50 pt-2 first:border-0 first:pt-0 animate-fadeIn">
                                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">{groupName}</p>
                                <div className="grid grid-cols-2 gap-2">
                                  {groupLinks.map((link) => (
                                    <Link
                                      key={link.id}
                                      href={link.url}
                                      className="text-xs font-bold text-gray-700 hover:text-primary transition-colors py-1 truncate"
                                      title={link.title}
                                    >
                                      {link.title}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()
                    ) : (
                      <p className="text-xs text-gray-400 italic">No resources found.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setIsEnrollModalOpen(true)}
              className="bg-orange-500 text-white px-6 py-2.5 rounded-full text-sm font-extrabold hover:bg-primary hover:text-white transition-all shadow-lg shadow-orange-500/20 uppercase tracking-wider cursor-pointer"
            >
              Enroll Now
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden h-10 w-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-700 bg-white/80 active:scale-95 transition-all"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-b border-gray-100 overflow-y-auto max-h-[calc(100vh-5rem)] shadow-sm"
          >
            <div className="px-4 pt-2 pb-5 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "block px-4 py-3.5 text-base font-semibold rounded-xl min-h-11",
                    pathname === link.href
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                  )}
                >
                  {link.name}
                </Link>
              ))}

              {/* Mobile Resources Menu */}
              {resources.length > 0 && (
                <div className="border-t border-gray-150 pt-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setResourcesOpen(!resourcesOpen)}
                    className="w-full flex items-center justify-between px-4 py-3.5 text-base font-bold text-gray-700 hover:bg-gray-50 rounded-xl cursor-pointer"
                  >
                    <span>Resources</span>
                    <ChevronDown className={cn("w-5 h-5 transition-transform text-gray-400", resourcesOpen ? "rotate-180" : "")} />
                  </button>
                  {resourcesOpen && (
                    <div className="pl-6 pr-4 py-2 space-y-4 bg-gray-50/50 rounded-xl mt-1 animate-fadeIn">
                      {resources.map((cat) => (
                        <div key={cat.id} className="space-y-2">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{cat.name}</p>
                          <div className="pl-2 space-y-2">
                            {(cat.links || []).map((link: any) => (
                              <Link
                                key={link.id}
                                href={link.url}
                                onClick={() => setIsOpen(false)}
                                className="block text-sm font-semibold text-gray-600 hover:text-primary transition-colors py-1"
                              >
                                {link.title}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div className="pt-4">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsEnrollModalOpen(true);
                  }}
                  className="block w-full text-center bg-primary text-white px-5 py-3 rounded-xl font-bold uppercase tracking-wider shadow-md cursor-pointer"
                >
                  Enroll Now
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <EnrollmentModal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
      />
    </nav>
  );
}

