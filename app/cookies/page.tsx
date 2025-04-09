"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function CookiePolicyPage() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex items-center mb-6">
        <Link href="/" className="mr-4">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Cookie Policy</h1>
      </div>

      <div className="prose prose-sm md:prose-base lg:prose-lg dark:prose-invert max-w-none">
        <div className="bg-card rounded-lg border p-6 shadow-sm">
          <p className="text-sm text-muted-foreground mb-6">Last Updated: {new Date().toLocaleDateString()}</p>

          <h2>1. Introduction</h2>
          <p>
            This Cookie Policy explains how AniStream ("we", "us", or "our") uses cookies and similar technologies 
            to recognize you when you visit our website. It explains what these technologies are and why we use them, 
            as well as your rights to control our use of them.
          </p>
          <p>
            By continuing to use our site, you are agreeing to our use of cookies as described in this Cookie Policy.
          </p>

          <h2>2. What Are Cookies?</h2>
          <p>
            Cookies are small data files that are placed on your computer or mobile device when you visit a website. 
            Cookies are widely used by website owners to make their websites work, or to work more efficiently, as well 
            as to provide reporting information.
          </p>
          <p>
            Cookies set by the website owner (in this case, AniStream) are called "first-party cookies". Cookies set 
            by parties other than the website owner are called "third-party cookies". Third-party cookies enable third-party 
            features or functionality to be provided on or through the website (e.g., advertising, interactive content, 
            and analytics). The parties that set these third-party cookies can recognize your computer both when it visits 
            the website in question and also when it visits certain other websites.
          </p>

          <h2>3. Why Do We Use Cookies?</h2>
          <p>
            We use first-party and third-party cookies for several reasons. Some cookies are required for technical reasons 
            in order for our website to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other 
            cookies enable us to track and target the interests of our users to enhance the experience on our online properties. 
            Third parties serve cookies through our website for advertising, analytics, and other purposes.
          </p>
          <p>
            The specific types of first and third-party cookies served through our website and the purposes they perform are 
            described in the table below:
          </p>

          <h3>3.1 Essential Cookies</h3>
          <p>
            These cookies are strictly necessary to provide you with services available through our website and to use some of 
            its features, such as access to secure areas. Without these cookies, services you have asked for, like secure login 
            or shopping baskets, cannot be provided.
          </p>

          <h3>3.2 Performance and Functionality Cookies</h3>
          <p>
            These cookies are used to enhance the performance and functionality of our website but are non-essential to their use. 
            However, without these cookies, certain functionality may become unavailable.
          </p>

          <h3>3.3 Analytics and Customization Cookies</h3>
          <p>
            These cookies collect information that is used either in aggregate form to help us understand how our website is being 
            used or how effective our marketing campaigns are, or to help us customize our website for you in order to enhance your 
            experience.
          </p>

          <h3>3.4 Advertising Cookies</h3>
          <p>
            These cookies are used to make advertising messages more relevant to you. They perform functions like preventing the 
            same ad from continuously reappearing, ensuring that ads are properly displayed for advertisers, and in some cases 
            selecting advertisements that are based on your interests.
          </p>

          <h3>3.5 Social Media Cookies</h3>
          <p>
            These cookies are used to enable you to share pages and content that you find interesting on our website through 
            third-party social networking and other websites. These cookies may also be used for advertising purposes.
          </p>

          <h2>4. How Can You Control Cookies?</h2>
          <p>
            You have the right to decide whether to accept or reject cookies. You can exercise your cookie preferences by 
            clicking on the appropriate opt-out links provided in our cookie notice banner.
          </p>
          <p>
            Browser Controls: You can set or amend your web browser controls to accept or refuse cookies. If you choose to reject 
            cookies, you may still use our website though your access to some functionality and areas of our website may be restricted. 
            As the means by which you can refuse cookies through your web browser controls vary from browser-to-browser, you should 
            visit your browser's help menu for more information.
          </p>
          <p>
            Disabling Most Interest Based Advertising: Most advertising networks offer you a way to opt out of Interest Based 
            Advertising. If you would like to find out more information, please visit <a href="http://www.aboutads.info/choices/" 
            target="_blank" rel="noopener noreferrer">http://www.aboutads.info/choices/</a> or 
            <a href="http://www.youronlinechoices.com" target="_blank" rel="noopener noreferrer">http://www.youronlinechoices.com</a>.
          </p>

          <h2>5. How Often Will We Update This Cookie Policy?</h2>
          <p>
            We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use 
            or for other operational, legal or regulatory reasons. Please therefore re-visit this Cookie Policy regularly to 
            stay informed about our use of cookies and related technologies.
          </p>
          <p>
            The date at the top of this Cookie Policy indicates when it was last updated.
          </p>

          <h2>6. Where Can You Get Further Information?</h2>
          <p>
            If you have any questions about our use of cookies or other technologies, please email us at 
            <a href="mailto:cookies@anistream.com"> cookies@anistream.com</a> or contact us through the methods described in our 
            <Link href="/privacy" className="text-primary hover:underline"> Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
} 