"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex items-center mb-6">
        <Link href="/" className="mr-4">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Privacy Policy</h1>
      </div>

      <div className="prose prose-sm md:prose-base lg:prose-lg dark:prose-invert max-w-none">
        <div className="bg-card rounded-lg border p-6 shadow-sm">
          <p className="text-sm text-muted-foreground mb-6">Last Updated: {new Date().toLocaleDateString()}</p>

          <h2>1. Introduction</h2>
          <p>
            AniStream ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, 
            disclose, and safeguard your information when you use our website and services.
          </p>
          <p>
            By using our service, you agree to the collection and use of information in accordance with this policy. We will not use 
            or share your information with anyone except as described in this Privacy Policy.
          </p>

          <h2>2. Information We Collect</h2>
          <p>
            We collect several different types of information for various purposes to provide and improve our service to you:
          </p>
          <h3>Personal Data</h3>
          <p>
            While using our service, we may ask you to provide us with certain personally identifiable information that can be used to 
            contact or identify you. This may include, but is not limited to:
          </p>
          <ul>
            <li>Email address</li>
            <li>First and last name</li>
            <li>Username</li>
            <li>Password</li>
            <li>Payment information (for premium subscriptions)</li>
            <li>Usage Data</li>
          </ul>

          <h3>Usage Data</h3>
          <p>
            We may also collect information about how the service is accessed and used. This Usage Data may include:
          </p>
          <ul>
            <li>Your computer's Internet Protocol address (IP address)</li>
            <li>Browser type and version</li>
            <li>Pages of our service that you visit</li>
            <li>Time and date of your visit</li>
            <li>Time spent on those pages</li>
            <li>Anime viewed and watching progress</li>
            <li>Device identifiers</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <p>
            We use the collected information for various purposes, including:
          </p>
          <ul>
            <li>To provide and maintain our service</li>
            <li>To notify you about changes to our service</li>
            <li>To allow you to participate in interactive features when you choose to do so</li>
            <li>To provide customer support</li>
            <li>To gather analysis or valuable information to improve our service</li>
            <li>To monitor the usage of our service</li>
            <li>To detect, prevent, and address technical issues</li>
            <li>To provide personalized content recommendations</li>
            <li>To process and manage your account and subscription</li>
            <li>To fulfill any other purpose for which you provide the information</li>
          </ul>

          <h2>4. Cookies and Tracking Technologies</h2>
          <p>
            We use cookies and similar tracking technologies to track activity on our service and store certain information. 
            Cookies are files with a small amount of data which may include an anonymous unique identifier.
          </p>
          <p>
            You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept 
            cookies, you may not be able to use some portions of our service.
          </p>
          <p>
            We use cookies for the following purposes:
          </p>
          <ul>
            <li>To keep you signed in</li>
            <li>To remember your preferences and settings</li>
            <li>To understand how our service is being used</li>
            <li>To track your viewing activity and provide personalized recommendations</li>
          </ul>

          <h2>5. Disclosure of Your Information</h2>
          <p>
            We may disclose your personal information in the following situations:
          </p>
          <ul>
            <li><strong>Business Transfers:</strong> If we are involved in a merger, acquisition, or sale of all or a portion of our assets, your information may be transferred as part of that transaction.</li>
            <li><strong>Service Providers:</strong> We may employ third-party companies and individuals to facilitate our service, provide the service on our behalf, perform service-related activities, or assist us in analyzing how our service is used.</li>
            <li><strong>Legal Requirements:</strong> We may disclose your information where required to do so by law or in response to valid requests by public authorities.</li>
            <li><strong>Protection of Rights:</strong> We may disclose your information to protect and defend the rights or property of AniStream.</li>
          </ul>

          <h2>6. Data Security</h2>
          <p>
            The security of your data is important to us, but remember that no method of transmission over the Internet or method of 
            electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, 
            we cannot guarantee its absolute security.
          </p>

          <h2>7. Your Data Protection Rights</h2>
          <p>
            Depending on your location, you may have certain rights regarding your personal information:
          </p>
          <ul>
            <li>The right to access information we hold about you</li>
            <li>The right to request correction of inaccurate personal information</li>
            <li>The right to request erasure of your personal information</li>
            <li>The right to object to processing of your personal information</li>
            <li>The right to request restriction of processing your personal information</li>
            <li>The right to data portability</li>
            <li>The right to withdraw consent</li>
          </ul>
          <p>
            To exercise any of these rights, please contact us using the contact information provided below.
          </p>

          <h2>8. Children's Privacy</h2>
          <p>
            Our service is not directed to anyone under the age of 13. We do not knowingly collect personally identifiable information 
            from anyone under the age of 13. If you are a parent or guardian and you are aware that your child has provided us with 
            personal information, please contact us so that we can take necessary actions.
          </p>

          <h2>9. Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on 
            this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
          </p>

          <h2>10. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us:
            <br /><a href="mailto:privacy@anistream.com">privacy@anistream.com</a>
          </p>
        </div>
      </div>
    </div>
  );
} 