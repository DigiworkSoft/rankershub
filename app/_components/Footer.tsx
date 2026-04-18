import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, Instagram, Youtube, MessageCircle } from "lucide-react";
import { PRESET_BLOG_TAGS } from "@/lib/blog-tags";
import { query } from "@/lib/db";

type FooterBlog = {
  id: number;
  title: string;
};

async function getFooterBlogs(): Promise<FooterBlog[]> {
  try {
    const result = await query("SELECT id, title FROM blogs ORDER BY created_at DESC LIMIT 8");
    return result.rows as FooterBlog[];
  } catch {
    return [];
  }
}

export default async function Footer() {
  const latestBlogs = await getFooterBlogs();

  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3 group">
              <Image
                src="/assets/photos/rankerhub logo.png"
                alt="Rankers Hub Logo"
                width={120}
                height={120}
                className="h-24 md:h-28 w-auto object-contain"
              />
            </Link>
            <p className="text-sm leading-relaxed">
              Empowering 11th and 12th Commerce students with expert guidance,
              comprehensive study materials, and a path to academic excellence.
            </p>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/rankershub.in/?hl=en" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://wa.me/919272547817" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                <MessageCircle className="w-5 h-5" />
              </a>
              <a href="https://www.youtube.com/@rankershubpune" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-6 uppercase tracking-widest text-sm">Quick Links</h3>
            <ul className="space-y-4 text-sm">
              <li><Link href="/" className="hover:text-secondary transition-colors">Home</Link></li>
              <li><Link href="/about" className="hover:text-secondary transition-colors">About Us</Link></li>
              <li><Link href="/batches" className="hover:text-secondary transition-colors">Our Batches</Link></li>
              <li><Link href="/blogs" className="hover:text-secondary transition-colors">Latest Blogs</Link></li>
              <li><Link href="/contact" className="hover:text-secondary transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Batches */}
          <div>
            <h3 className="text-white font-bold mb-6 uppercase tracking-widest text-sm">Our Batches</h3>
            <ul className="space-y-4 text-sm">
              <li><Link href="/batches" className="hover:text-secondary transition-colors">11th Commerce Regular</Link></li>
              <li><Link href="/batches" className="hover:text-secondary transition-colors">12th Commerce Boards</Link></li>
              <li><Link href="/batches" className="hover:text-secondary transition-colors">CA Foundation Course</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold mb-6 uppercase tracking-widest text-sm">Get in Touch</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-secondary shrink-0" />
                <span>Tilak Road, 1st Floor, Pinnacle Pride, Near Durvankur Dining Hall, Above Maharashtra Electronics, Opposite Cosmos Bank, Sadashiv Peth, Pune, Maharashtra 411030</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-secondary shrink-0" />
                <span>+91 9272547817</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-secondary shrink-0" />
                <span>info@rankerhub.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800">
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="text-center md:text-left">
                <h4 className="text-white/90 font-semibold mb-3 tracking-wide text-xs uppercase">Blog Topics</h4>
                <ul className="space-y-2 text-xs">
                  {PRESET_BLOG_TAGS.map((tag) => (
                    <li key={tag}>
                      <Link href={`/blogs?tag=${encodeURIComponent(tag)}`} className="hover:text-secondary transition-colors">
                        {tag}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-center md:text-left">
                <h4 className="text-white/90 font-semibold mb-3 tracking-wide text-xs uppercase">Blogs</h4>
                {latestBlogs.length === 0 ? (
                  <p className="text-xs text-gray-400">No blogs published yet.</p>
                ) : (
                  <ul className="space-y-2 text-xs">
                    {latestBlogs.map((blog) => (
                      <li key={blog.id}>
                        <Link href={`/blogs/${blog.id}`} className="hover:text-secondary transition-colors line-clamp-1">
                          {blog.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <p className="text-center text-xs">&copy; {new Date().getFullYear()} Rankerhub Education. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
