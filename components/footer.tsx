"use client"

import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Logo from "@/components/logo";
import { 
  Twitter, 
  Instagram, 
  Youtube,
  Facebook, 
  Twitch,
  Mail,
  ArrowRight,
  Heart,
  ArrowUp,
  Globe,
  CheckCircle
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSelector } from "@/components/language-selector";
import { useState } from "react";

const footerLinks = [
  {
    title: "Resources",
    links: [
      { name: "FAQs", href: "/faqs" },
      { name: "Terms", href: "/terms" },
      { name: "Privacy", href: "/privacy" },
      { name: "Help Center", href: "/help" },
    ],
  },
  {
    title: "Categories",
    links: [
      { name: "Action", href: "/category/action" },
      { name: "Romance", href: "/category/romance" },
      { name: "Comedy", href: "/category/comedy" },
      { name: "Drama", href: "/category/drama" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About", href: "/about" },
      { name: "Careers", href: "/careers" },
      { name: "Blog", href: "/blog" },
      { name: "Contact", href: "/contact" },
    ],
  },
];

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "ja", name: "日本語" },
  { code: "fr", name: "Français" },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      // Here you would typically send the email to your API
      setTimeout(() => {
        setEmail("");
        setSubscribed(false);
      }, 3000);
    }
  };

  const currentYear = new Date().getFullYear();
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };
  
  return (
    <footer className="w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container px-4 md:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About & Logo Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Logo size="medium" animated={true} />
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Your premier destination for watching anime online with a vast collection of subtitled and dubbed content.
            </p>
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="text-sm bg-transparent border-none focus:ring-0 text-muted-foreground"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Navigation Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Navigation</h4>
            <nav className="flex flex-col space-y-2 text-sm">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <Link href="/category/anime" className="text-muted-foreground hover:text-foreground transition-colors">
                Anime
              </Link>
              <Link href="/category/movie" className="text-muted-foreground hover:text-foreground transition-colors">
                Movies
              </Link>
              <Link href="/top-airing" className="text-muted-foreground hover:text-foreground transition-colors">
                Top Airing
              </Link>
              <Link href="/trending" className="text-muted-foreground hover:text-foreground transition-colors">
                Trending
              </Link>
            </nav>
          </div>
          
          {/* Support Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Support</h4>
            <nav className="flex flex-col space-y-2 text-sm">
              <Link href="/help-center" className="text-muted-foreground hover:text-foreground transition-colors">
                Help Center
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                Contact Us
              </Link>
              <Link href="/dmca" className="text-muted-foreground hover:text-foreground transition-colors">
                DMCA
              </Link>
              <Link href="/cookies" className="text-muted-foreground hover:text-foreground transition-colors">
                Cookie Policy
              </Link>
            </nav>
          </div>
          
          {/* Newsletter Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Stay Updated</h4>
            <p className="text-sm text-muted-foreground">
              Subscribe to our newsletter for latest anime updates.
            </p>
            {subscribed ? (
              <div className="flex items-center text-sm text-green-500">
                <CheckCircle className="h-4 w-4 mr-2" />
                Thanks for subscribing!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex space-x-2">
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 text-sm"
                  required
                />
                <Button type="submit" size="sm" className="h-9">
                  <Mail className="h-4 w-4" />
                </Button>
              </form>
            )}
            <div className="flex items-center space-x-6 pt-2">
              <div className="flex items-center space-x-2">
                <ThemeToggle />
                <span className="text-xs text-muted-foreground">Theme</span>
              </div>
              <div className="flex items-center space-x-2">
                <LanguageSelector />
                <span className="text-xs text-muted-foreground">Language</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 rounded-full" 
                  onClick={scrollToTop}
                  aria-label="Scroll to top"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground">Top</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom section with copyright and additional links */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-10 pt-6 border-t">
          <p className="text-xs text-muted-foreground">
            © {currentYear} Aninew. All rights reserved.
          </p>
          <div className="flex items-center space-x-1 mt-4 md:mt-0">
            <span className="text-xs text-muted-foreground">Made with</span>
            <Heart className="h-3 w-3 text-red-500" />
            <span className="text-xs text-muted-foreground">for anime fans</span>
          </div>
        </div>
      </div>
      
      {/* Fixed back to top button for mobile that appears when scrolled */}
      <div className="fixed bottom-6 right-6 md:hidden z-50">
        <Button 
          onClick={scrollToTop} 
          size="icon" 
          className="rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      </div>
    </footer>
  );
} 