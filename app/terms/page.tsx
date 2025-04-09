"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex items-center mb-6">
        <Link href="/" className="mr-4">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Terms of Service</h1>
      </div>

      <div className="prose prose-sm md:prose-base lg:prose-lg dark:prose-invert max-w-none">
        <div className="bg-card rounded-lg border p-6 shadow-sm">
          <p className="text-sm text-muted-foreground mb-6">Last Updated: {new Date().toLocaleDateString()}</p>

          <h2>1. Agreement to Terms</h2>
          <p>
            By accessing and using AniStream, you agree to be bound by these Terms of Service and all applicable laws 
            and regulations. If you do not agree with any of these terms, you are prohibited from using this website.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            AniStream provides a platform for streaming anime content. We offer both free content supported by 
            advertisements and premium content available with paid subscriptions.
          </p>

          <h2>3. User Accounts</h2>
          <p>
            To access certain features of the website, you may be required to register for an account. You are 
            responsible for maintaining the confidentiality of your account information and for all activities that 
            occur under your account. You agree to:
          </p>
          <ul>
            <li>Provide accurate, current, and complete information</li>
            <li>Maintain and update your information</li>
            <li>Keep your password secure and confidential</li>
            <li>Notify us immediately of any unauthorized use of your account</li>
            <li>Be responsible for all activities that occur under your account</li>
          </ul>

          <h2>4. User Conduct</h2>
          <p>
            You agree not to:
          </p>
          <ul>
            <li>Use our service for any illegal purpose or in violation of any laws</li>
            <li>Violate our intellectual property rights or those of any third party</li>
            <li>Attempt to gain unauthorized access to any part of the website</li>
            <li>Interfere with the website's functionality</li>
            <li>Use automated means to access or collect data from our service</li>
            <li>Share your account credentials with others</li>
            <li>Upload or transmit any viruses or harmful code</li>
          </ul>

          <h2>5. Content and Copyright</h2>
          <p>
            All content provided on AniStream is owned by us or our licensors and is protected by copyright, 
            trademark, and other intellectual property laws. You may not reproduce, distribute, modify, create 
            derivative works from, or publicly display content from our service without written permission.
          </p>

          <h2>6. Subscription and Payments</h2>
          <p>
            We offer subscription plans that provide access to premium content. By subscribing, you agree to:
          </p>
          <ul>
            <li>Pay all fees associated with your subscription plan</li>
            <li>Provide accurate billing information</li>
            <li>Accept that subscriptions will automatically renew unless cancelled</li>
            <li>Be responsible for any taxes applicable to your purchase</li>
          </ul>

          <h2>7. Cancellation and Refund Policy</h2>
          <p>
            You may cancel your subscription at any time. Cancellation will take effect at the end of your current 
            billing period. We do not provide refunds for the unused portion of your subscription, except where 
            required by law.
          </p>

          <h2>8. Changes to Service</h2>
          <p>
            We reserve the right to modify, suspend, or discontinue any part of our service at any time. We may 
            also modify prices and features with notice to users.
          </p>

          <h2>9. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, AniStream and its affiliates shall not be liable for any 
            indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, 
            or goodwill, arising from your use of our service.
          </p>

          <h2>10. Governing Law</h2>
          <p>
            These Terms shall be governed by the laws of Japan, without regard to its conflict of law provisions. 
            Any disputes arising under these Terms shall be resolved in the courts located in Tokyo, Japan.
          </p>

          <h2>11. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. Changes will be effective immediately upon 
            posting to the website. Your continued use of the website after any changes indicates your acceptance 
            of the modified Terms.
          </p>

          <h2>12. Contact Information</h2>
          <p>
            If you have any questions about these Terms, please contact us:
            <br /><a href="mailto:terms@anistream.com">terms@anistream.com</a>
          </p>
        </div>
      </div>
    </div>
  );
} 