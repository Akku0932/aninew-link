import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import NewsletterForm from "@/components/newsletter-form";
import { LanguageSelector } from "@/components/language-selector";
import { 
  Github, 
  Twitter, 
  Instagram, 
  Youtube,
  Facebook, 
  Twitch,
  Mail,
  ArrowRight,
  Heart,
  ArrowUp,
  Globe
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Footer() {
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
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
                ANINEW
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Your ultimate destination for high-quality anime streaming. Watch the latest episodes with English subtitles and dubs.
            </p>
            <div className="flex space-x-3">
              <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-100 hover:text-blue-500 dark:hover:bg-blue-900/20">
                  <Twitter className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-pink-100 hover:text-pink-500 dark:hover:bg-pink-900/20">
                  <Instagram className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="https://github.com/Akku0932/aninew-link" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800">
                  <Github className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="https://discord.com" target="_blank" rel="noopener noreferrer" aria-label="Discord">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-purple-100 hover:text-purple-500 dark:hover:bg-purple-900/20">
                  <Twitch className="h-5 w-5" />
                </Button>
              </Link>
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
            </nav>
          </div>
          
          {/* Newsletter Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Stay Updated</h4>
            <p className="text-sm text-muted-foreground">
              Subscribe to our newsletter for updates on new releases, features, and more.
            </p>
            <NewsletterForm />
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
            © {currentYear} ANINEW. All rights reserved.
          </p>
          <div className="flex items-center space-x-1 mt-4 md:mt-0">
            <span className="text-xs text-muted-foreground">Made with</span>
            <Heart className="h-3 w-3 text-red-500" />
            <span className="text-xs text-muted-foreground">by</span>
            <Link href="https://github.com/Akku0932" className="text-xs font-medium hover:underline">
              Akku
            </Link>
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