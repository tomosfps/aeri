import { Link } from "react-router-dom";

export default function TermsOfService() {
  return (
    <main className="w-full max-w-5xl mx-auto px-4 py-12">
      {/* Header Section */}
      <div className="mb-12 border-b border-cborder-light pb-6">
        <h1 className="text-4xl font-bold text-cprimary-light mb-4">Terms of Service</h1>
        <p className="text-sm text-ctext-light/70">Last updated: March 3, 2025</p>
      </div>

      {/* Table of Contents */}
      <div className="bg-cbackground-light/30 rounded-lg p-6 mb-12 border border-cborder-light">
        <h2 className="text-xl text-cprimary-light mb-4 font-medium">Contents</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <li>
            <a href="#acceptance" className="text-csecondary-light hover:underline flex items-center">
              <span className="text-xs bg-cprimary-light/10 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">1</span>
              Acceptance of Terms
            </a>
          </li>
          <li>
            <a href="#service" className="text-csecondary-light hover:underline flex items-center">
              <span className="text-xs bg-cprimary-light/10 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">2</span>
              Service Description
            </a>
          </li>
          <li>
            <a href="#responsibilities" className="text-csecondary-light hover:underline flex items-center">
              <span className="text-xs bg-cprimary-light/10 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">3</span>
              User Responsibilities
            </a>
          </li>
          <li>
            <a href="#availability" className="text-csecondary-light hover:underline flex items-center">
              <span className="text-xs bg-cprimary-light/10 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">4</span>
              Service Availability
            </a>
          </li>
          <li>
            <a href="#anilist" className="text-csecondary-light hover:underline flex items-center">
              <span className="text-xs bg-cprimary-light/10 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">5</span>
              AniList Integration
            </a>
          </li>
          <li>
            <a href="#intellectual" className="text-csecondary-light hover:underline flex items-center">
              <span className="text-xs bg-cprimary-light/10 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">6</span>
              Intellectual Property
            </a>
          </li>
          <li>
            <a href="#content" className="text-csecondary-light hover:underline flex items-center">
              <span className="text-xs bg-cprimary-light/10 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">7</span>
              Content Liability
            </a>
          </li>
          <li>
            <a href="#liability" className="text-csecondary-light hover:underline flex items-center">
              <span className="text-xs bg-cprimary-light/10 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">8</span>
              Limitation of Liability
            </a>
          </li>
          <li>
            <a href="#changes" className="text-csecondary-light hover:underline flex items-center">
              <span className="text-xs bg-cprimary-light/10 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">9</span>
              Changes to Service and Terms
            </a>
          </li>
          <li>
            <a href="#termination" className="text-csecondary-light hover:underline flex items-center">
              <span className="text-xs bg-cprimary-light/10 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">10</span>
              Termination
            </a>
          </li>
          <li>
            <a href="#governing" className="text-csecondary-light hover:underline flex items-center">
              <span className="text-xs bg-cprimary-light/10 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">11</span>
              Governing Law
            </a>
          </li>
          <li>
            <a href="#contact" className="text-csecondary-light hover:underline flex items-center">
              <span className="text-xs bg-cprimary-light/10 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">12</span>
              Contact Information
            </a>
          </li>
        </ul>
      </div>

      {/* Terms Content */}
      <section className="space-y-12">
        {/* Acceptance of Terms */}
        <div id="acceptance" className="bg-cbackground-light border border-cborder-light rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-cprimary-light mb-4 flex items-center">
            <span className="flex items-center justify-center bg-cprimary-light text-white rounded-full h-8 w-8 mr-3 text-sm">1</span>
            Acceptance of Terms
          </h2>
          <p className="text-ctext-light leading-relaxed">
            By inviting Aeri (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;, &quot;the bot&quot;) to your Discord server or using its features, you agree 
            to be bound by these Terms of Service and our <Link to="/privacy" className="text-csecondary-light hover:underline">Privacy Policy</Link>. 
            If you disagree with any part of these terms, you may not use our services.
          </p>
        </div>

        {/* Service Description */}
        <div id="service" className="bg-cbackground-light border border-cborder-light rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-cprimary-light mb-4 flex items-center">
            <span className="flex items-center justify-center bg-cprimary-light text-white rounded-full h-8 w-8 mr-3 text-sm">2</span>
            Service Description
          </h2>
          <p className="text-ctext-light leading-relaxed mb-4">
            Aeri is a Discord bot that provides anime and manga information services, including but not limited to:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
            <div className="flex items-start">
              <div className="text-csecondary-light mr-2">•</div>
              <span className="text-ctext-light">Searching for anime and manga information</span>
            </div>
            <div className="flex items-start">
              <div className="text-csecondary-light mr-2">•</div>
              <span className="text-ctext-light">Viewing character details</span>
            </div>
            <div className="flex items-start">
              <div className="text-csecondary-light mr-2">•</div>
              <span className="text-ctext-light">Tracking user anime/manga lists</span>
            </div>
            <div className="flex items-start">
              <div className="text-csecondary-light mr-2">•</div>
              <span className="text-ctext-light">Comparing media affinities between users</span>
            </div>
            <div className="flex items-start">
              <div className="text-csecondary-light mr-2">•</div>
              <span className="text-ctext-light">Updating AniList profiles via Discord</span>
            </div>
            <div className="flex items-start">
              <div className="text-csecondary-light mr-2">•</div>
              <span className="text-ctext-light">Displaying user statistics and recommendations</span>
            </div>
          </div>
          <p className="text-ctext-light leading-relaxed">
            The bot communicates with the AniList API and other third-party services to provide these features.
          </p>
        </div>

        {/* User Responsibilities */}
        <div id="responsibilities" className="bg-cbackground-light border border-cborder-light rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-cprimary-light mb-4 flex items-center">
            <span className="flex items-center justify-center bg-cprimary-light text-white rounded-full h-8 w-8 mr-3 text-sm">3</span>
            User Responsibilities
          </h2>
          <p className="text-ctext-light leading-relaxed mb-4">Users of Aeri agree to:</p>
          <ul className="space-y-2 text-ctext-light">
            <li className="flex items-start">
              <div className="text-csecondary-light mr-2 mt-1">•</div>
              <span>Comply with Discord's <a href="https://discord.com/terms" target="_blank" rel="noopener noreferrer" className="text-csecondary-light hover:underline">Terms of Service</a></span>
            </li>
            <li className="flex items-start">
              <div className="text-csecondary-light mr-2 mt-1">•</div>
              <span>Only use the bot in channels where anime/manga content is appropriate</span>
            </li>
            <li className="flex items-start">
              <div className="text-csecondary-light mr-2 mt-1">•</div>
              <span>Not use the bot to retrieve or distribute NSFW content in channels not marked accordingly</span>
            </li>
            <li className="flex items-start">
              <div className="text-csecondary-light mr-2 mt-1">•</div>
              <span>Not attempt to abuse, exploit, or otherwise misuse the bot's functions</span>
            </li>
            <li className="flex items-start">
              <div className="text-csecondary-light mr-2 mt-1">•</div>
              <span>Not use the bot for spam or harassment purposes</span>
            </li>
            <li className="flex items-start">
              <div className="text-csecondary-light mr-2 mt-1">•</div>
              <span>Not attempt to reverse engineer or extract the bot's code</span>
            </li>
            <li className="flex items-start">
              <div className="text-csecondary-light mr-2 mt-1">•</div>
              <span>Respect the rate limits and cooldowns implemented in the bot</span>
            </li>
          </ul>
        </div>

        {/* Service Availability */}
        <div id="availability" className="bg-cbackground-light border border-cborder-light rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-cprimary-light mb-4 flex items-center">
            <span className="flex items-center justify-center bg-cprimary-light text-white rounded-full h-8 w-8 mr-3 text-sm">4</span>
            Service Availability
          </h2>
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
            <p className="text-ctext-light leading-relaxed">
              While we strive to provide uninterrupted service, Aeri is provided &quot;as is&quot; and &quot;as available&quot; without 
              warranties of any kind. We do not guarantee that the service will always be available, uninterrupted, 
              timely, secure, or error-free.
            </p>
          </div>
          <p className="text-ctext-light leading-relaxed">
            We reserve the right to temporarily or permanently suspend the service for maintenance, updates, 
            or for any other reason, with or without notice.
          </p>
        </div>

        {/* AniList Integration */}
        <div id="anilist" className="bg-cbackground-light border border-cborder-light rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-cprimary-light mb-4 flex items-center">
            <span className="flex items-center justify-center bg-cprimary-light text-white rounded-full h-8 w-8 mr-3 text-sm">5</span>
            AniList Integration
          </h2>
          <p className="text-ctext-light leading-relaxed mb-4">
            When you link your AniList account, you authorize Aeri to:
          </p>
          <div className="mb-4 pl-4 border-l-2 border-csecondary-light/30">
            <ul className="space-y-2 text-ctext-light">
              <li className="flex items-start">
                <div className="text-csecondary-light mr-2">•</div>
                <span>Access your anime and manga lists</span>
              </li>
              <li className="flex items-start">
                <div className="text-csecondary-light mr-2">•</div>
                <span>View your profile information</span>
              </li>
              <li className="flex items-start">
                <div className="text-csecondary-light mr-2">•</div>
                <span>Modify your lists when specifically commanded to do so</span>
              </li>
            </ul>
          </div>
          <p className="text-ctext-light leading-relaxed">
            You remain responsible for all actions taken through this integration, and should keep 
            your linked accounts secure. You may unlink your account at any time using the bot's commands.
          </p>
        </div>

        {/* Intellectual Property */}
        <div id="intellectual" className="bg-cbackground-light border border-cborder-light rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-cprimary-light mb-4 flex items-center">
            <span className="flex items-center justify-center bg-cprimary-light text-white rounded-full h-8 w-8 mr-3 text-sm">6</span>
            Intellectual Property
          </h2>
          <p className="text-ctext-light leading-relaxed mb-4">
            The Aeri bot, its name, logo, code, and all content related to it are owned by us or our licensors 
            and are protected by intellectual property laws. You may not use, reproduce, distribute, or create 
            derivative works based upon Aeri without our express permission.
          </p>
          <p className="text-ctext-light leading-relaxed">
            Anime, manga, and character data retrieved through the bot belong to their respective owners and creators. 
            We do not claim ownership over this third-party content.
          </p>
        </div>

        {/* Content Liability */}
        <div id="content" className="bg-cbackground-light border border-cborder-light rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-cprimary-light mb-4 flex items-center">
            <span className="flex items-center justify-center bg-cprimary-light text-white rounded-full h-8 w-8 mr-3 text-sm">7</span>
            Content Liability
          </h2>
          <p className="text-ctext-light leading-relaxed">
            We do not moderate or pre-screen the content retrieved from third-party APIs. While we attempt to filter 
            NSFW content according to Discord channel settings, we are not responsible for any content that may be 
            considered offensive, inappropriate, or inaccurate.
          </p>
        </div>

        {/* Limitation of Liability */}
        <div id="liability" className="bg-cbackground-light border border-cborder-light rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-cprimary-light mb-4 flex items-center">
            <span className="flex items-center justify-center bg-cprimary-light text-white rounded-full h-8 w-8 mr-3 text-sm">8</span>
            Limitation of Liability
          </h2>
          <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 mb-4">
            <p className="text-ctext-light leading-relaxed">
              To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, 
              consequential, or punitive damages, or any loss of profits or revenue, whether incurred directly or 
              indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from:
            </p>
          </div>
          <ul className="space-y-2 pl-2 text-ctext-light">
            <li className="flex items-start">
              <div className="text-csecondary-light mr-2">•</div>
              <span>Your use or inability to use the bot</span>
            </li>
            <li className="flex items-start">
              <div className="text-csecondary-light mr-2">•</div>
              <span>Any unauthorized access to or use of our servers and/or any personal information stored therein</span>
            </li>
            <li className="flex items-start">
              <div className="text-csecondary-light mr-2">•</div>
              <span>Any bugs, viruses, or other harmful code that may be transmitted through the bot</span>
            </li>
            <li className="flex items-start">
              <div className="text-csecondary-light mr-2">•</div>
              <span>Any content obtained from the bot</span>
            </li>
            <li className="flex items-start">
              <div className="text-csecondary-light mr-2">•</div>
              <span>Any interruption or cessation of transmission to or from the bot</span>
            </li>
          </ul>
        </div>

        {/* Changes to the Service and Terms */}
        <div id="changes" className="bg-cbackground-light border border-cborder-light rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-cprimary-light mb-4 flex items-center">
            <span className="flex items-center justify-center bg-cprimary-light text-white rounded-full h-8 w-8 mr-3 text-sm">9</span>
            Changes to the Service and Terms
          </h2>
          <p className="text-ctext-light leading-relaxed mb-4">
            We reserve the right to modify or replace these Terms of Service at any time. We will provide notice 
            of significant changes through our Discord support server or bot announcements. Your continued use of 
            the bot after such changes constitutes your acceptance of the new Terms of Service.
          </p>
          <p className="text-ctext-light leading-relaxed">
            We may also modify, suspend, or discontinue the bot or any of its features at any time, with or without notice.
          </p>
        </div>

        {/* Termination */}
        <div id="termination" className="bg-cbackground-light border border-cborder-light rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-cprimary-light mb-4 flex items-center">
            <span className="flex items-center justify-center bg-cprimary-light text-white rounded-full h-8 w-8 mr-3 text-sm">10</span>
            Termination
          </h2>
          <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0 mb-4">
            <div className="w-full md:w-1/2">
              <div className="bg-cbackground-light/60 border border-cborder-light rounded-lg p-4 h-full">
              <h3 className="text-lg font-semibold text-cprimary-light mb-2">Our Rights</h3>
              <p className="text-ctext-light leading-relaxed">
                We may terminate or suspend your access to the bot immediately, without prior notice or liability, 
                for any reason, including violations of these Terms of Service.
              </p>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="bg-cbackground-light/60 border border-cborder-light rounded-lg p-4 h-full">
              <h3 className="text-lg font-semibold text-cprimary-light mb-2">Your Rights</h3>
              <p className="text-ctext-light leading-relaxed">
                You may remove the bot from your Discord server at any time. Your server-specific settings 
                will be retained for 30 days, after which they may be deleted.
              </p>
              </div>
            </div>
          </div>
        </div>

        {/* Governing Law */}
        <div id="governing" className="bg-cbackground-light border border-cborder-light rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-cprimary-light mb-4 flex items-center">
            <span className="flex items-center justify-center bg-cprimary-light text-white rounded-full h-8 w-8 mr-3 text-sm">11</span>
            Governing Law
          </h2>
          <p className="text-ctext-light leading-relaxed mb-4">
            These Terms shall be governed and construed in accordance with the laws of the European Union, without
            regard to its conflict of law provisions.
          </p>
          <p className="text-ctext-light leading-relaxed">
            Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. 
            If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions 
            of these Terms will remain in effect.
          </p>
        </div>

        {/* Contact Information */}
        <div id="contact" className="bg-cbackground-light border border-cborder-light rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-cprimary-light mb-4 flex items-center">
            <span className="flex items-center justify-center bg-cprimary-light text-white rounded-full h-8 w-8 mr-3 text-sm">12</span>
            Contact Information
          </h2>
          <p className="text-ctext-light leading-relaxed mb-4">
            If you have any questions about these Terms, please contact us:
          </p>
          <div className="flex flex-col md:flex-row gap-4">
            <a href="https://discord.gg/MwGjd9nHsh" className="bg-[#5865F2]/10 hover:bg-[#5865F2]/20 border border-[#5865F2]/30 text-white rounded-lg p-4 flex items-center transition-colors">
              <svg className="h-6 w-6 mr-3 text-[#5865F2]" viewBox="0 0 127.14 96.36" fill="currentColor">
                <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/>
              </svg>
              Discord Support Server
            </a>
            <a href="https://github.com/tomosfps/aeri/issues" className="bg-gray-800/10 hover:bg-gray-800/20 border border-gray-600/30 text-white rounded-lg p-4 flex items-center transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-gray-300" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="mt-12 pt-6 border-t border-cborder-light text-ctext-light/70 text-sm">
        <p>
          These Terms of Service were last updated on March 3, 2025 and apply to all users of the Aeri Discord bot.
        </p>
        <p className="mt-4">
          <Link to="/privacy" className="text-csecondary-light hover:underline">View our Privacy Policy</Link>
        </p>
      </div>
    </main>
  );
}