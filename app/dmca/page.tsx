"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function DMCAPage() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex items-center mb-6">
        <Link href="/" className="mr-4">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">DMCA Policy</h1>
      </div>

      <div className="prose prose-sm md:prose-base lg:prose-lg dark:prose-invert max-w-none">
        <div className="bg-card rounded-lg border p-6 shadow-sm">
          <p className="text-sm text-muted-foreground mb-6">Last Updated: {new Date().toLocaleDateString()}</p>

          <h2>DMCA Notice & Takedown Policy</h2>
          <p>
            AniStream respects the intellectual property rights of others and expects its users to do the same. 
            In accordance with the Digital Millennium Copyright Act of 1998 ("DMCA"), we will respond expeditiously 
            to claims of copyright infringement that are reported to the designated copyright agent identified below.
          </p>

          <h2>Notification of Claimed Infringement</h2>
          <p>
            If you believe that your copyrighted work has been copied in a way that constitutes copyright infringement 
            and is accessible on our website, you may notify our copyright agent as set forth in the DMCA. For your 
            complaint to be valid under the DMCA, you must provide the following information in writing:
          </p>

          <ol>
            <li>
              An electronic or physical signature of a person authorized to act on behalf of the copyright owner
            </li>
            <li>
              Identification of the copyrighted work that you claim has been infringed
            </li>
            <li>
              Identification of the material that is claimed to be infringing and where it is located on the website
            </li>
            <li>
              Information reasonably sufficient to permit us to contact you, such as your address, telephone number, 
              and email address
            </li>
            <li>
              A statement that you have a good faith belief that use of the material in the manner complained of is 
              not authorized by the copyright owner, its agent, or law
            </li>
            <li>
              A statement, made under penalty of perjury, that the above information is accurate, and that you are 
              the copyright owner or are authorized to act on behalf of the owner
            </li>
          </ol>

          <p>
            Please send your notice of claims of copyright infringement to:
          </p>
          
          <div className="bg-muted p-4 rounded my-4">
            <p>Email: <a href="mailto:dmca@anistream.com">dmca@anistream.com</a></p>
            <p>
              AniStream Copyright Agent<br />
              123 Anime Street<br />
              Tokyo, Japan 12345
            </p>
          </div>

          <h2>Counter-Notification</h2>
          <p>
            If you believe that your material has been removed by mistake or misidentification, you may submit a 
            counter-notification to our copyright agent. Your counter-notification must include the following:
          </p>

          <ol>
            <li>
              Your physical or electronic signature
            </li>
            <li>
              Identification of the material that has been removed or to which access has been disabled and the 
              location at which the material appeared before it was removed or disabled
            </li>
            <li>
              A statement under penalty of perjury that you have a good faith belief that the material was 
              removed or disabled as a result of mistake or misidentification
            </li>
            <li>
              Your name, address, telephone number, and email address, and a statement that you consent to the 
              jurisdiction of the federal court in the district where you reside and that you will accept service 
              from the person who provided the original notification or an agent of such person
            </li>
          </ol>

          <p>
            Please note that under Section 512(f) of the DMCA, any person who knowingly materially misrepresents 
            that material or activity was removed or disabled by mistake or misidentification may be subject to liability.
          </p>

          <h2>Repeat Infringers</h2>
          <p>
            It is our policy to terminate the user accounts of repeat infringers. We define a repeat infringer as 
            any user who has received more than two DMCA takedown notices. We reserve the right to terminate user 
            accounts based on even a single DMCA notice, in appropriate circumstances at our sole discretion.
          </p>

          <h2>Modifications to Policy</h2>
          <p>
            AniStream reserves the right to modify this DMCA Policy at any time. Changes and clarifications will 
            take effect immediately upon their posting on the website. We encourage you to periodically review 
            this policy to stay informed of our updates.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have any questions about our DMCA Policy, please contact us:
            <br /><a href="mailto:dmca@anistream.com">dmca@anistream.com</a>
          </p>
        </div>
      </div>
    </div>
  );
} 