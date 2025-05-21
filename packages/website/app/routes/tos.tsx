import { Link } from "react-router-dom";
import "~/styles/tos.css";

export function meta() {
  return [{ title: "Terms of Service | Aeri" }];
}

export default function TermsOfService() {
  return (
    <main className="tos-container">
      {/* Header Section */}
      <div className="tos-header">
        <h1 className="tos-title">Terms of Service</h1>
        <p className="tos-last-updated">Last updated: May 17th, 2025</p>
      </div>

      {/* Table of Contents */}
      <div className="tos-toc">
        <h2 className="tos-toc-title">Contents</h2>
        <ul className="tos-toc-list">
          <li className="tos-toc-item">
            <a href="#acceptance">
              <span className="tos-toc-number">1</span>
              Acceptance of Terms
            </a>
          </li>
          <li className="tos-toc-item">
            <a href="#service">
              <span className="tos-toc-number">2</span>
              Service Description
            </a>
          </li>
          <li className="tos-toc-item">
            <a href="#responsibilities">
              <span className="tos-toc-number">3</span>
              User Responsibilities
            </a>
          </li>
          <li className="tos-toc-item">
            <a href="#availability">
              <span className="tos-toc-number">4</span>
              Service Availability
            </a>
          </li>
          <li className="tos-toc-item">
            <a href="#anilist">
              <span className="tos-toc-number">5</span>
              AniList Integration
            </a>
          </li>
          <li className="tos-toc-item">
            <a href="#intellectual">
              <span className="tos-toc-number">6</span>
              Intellectual Property
            </a>
          </li>
          <li className="tos-toc-item">
            <a href="#content">
              <span className="tos-toc-number">7</span>
              Content Liability
            </a>
          </li>
          <li className="tos-toc-item">
            <a href="#liability">
              <span className="tos-toc-number">8</span>
              Limitation of Liability
            </a>
          </li>
          <li className="tos-toc-item">
            <a href="#changes">
              <span className="tos-toc-number">9</span>
              Changes to Service and Terms
            </a>
          </li>
          <li className="tos-toc-item">
            <a href="#termination">
              <span className="tos-toc-number">10</span>
              Termination
            </a>
          </li>
          <li className="tos-toc-item">
            <a href="#governing">
              <span className="tos-toc-number">11</span>
              Governing Law
            </a>
          </li>
          <li className="tos-toc-item">
            <a href="#contact">
              <span className="tos-toc-number">12</span>
              Contact Information
            </a>
          </li>
        </ul>
      </div>

      {/* Terms Content */}
      <section className="tos-content">
        {/* Acceptance of Terms */}
        <div id="acceptance" className="tos-section">
          <h2 className="tos-section-title">
            <span className="tos-section-number">1</span>
            Acceptance of Terms
          </h2>
          <p className="tos-text">
            By inviting Aeri (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;, &quot;the bot&quot;) to your Discord server or using its features, you agree
            to be bound by these Terms of Service and our <Link to="/privacy" className="tos-link">Privacy Policy</Link>.
            If you disagree with any part of these terms, you may not use our services.
          </p>
        </div>

        {/* Service Description */}
        <div id="service" className="tos-section">
          <h2 className="tos-section-title">
            <span className="tos-section-number">2</span>
            Service Description
          </h2>
          <p className="tos-text">
            Aeri is a Discord bot that provides anime and manga information services, including but not limited to:
          </p>
          <div className="tos-list numbered-list">
            <div className="tos-list-item">
              <span>Searching for anime and manga information</span>
            </div>
            <div className="tos-list-item">
              <span>Viewing character details</span>
            </div>
            <div className="tos-list-item">
              <span>Tracking user anime/manga lists</span>
            </div>
            <div className="tos-list-item">
              <span>Comparing media affinities between users</span>
            </div>
            <div className="tos-list-item">
              <span>Updating AniList profiles via Discord</span>
            </div>
            <div className="tos-list-item">
              <span>Displaying user statistics and recommendations</span>
            </div>
          </div>
          <p className="tos-text">
            The bot communicates with the AniList API and other third-party services to provide these features.
          </p>
        </div>

        {/* User Responsibilities */}
        <div id="responsibilities" className="tos-section">
          <h2 className="tos-section-title">
            <span className="tos-section-number">3</span>
            User Responsibilities
          </h2>
          <p className="tos-text">Users of Aeri agree to:</p>
          <div className="tos-list numbered-list">
            <div className="tos-list-item">
              <span>Comply with Discord's <a href="https://discord.com/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a></span>
            </div>
            <div className="tos-list-item">
              <span>Only use the bot in channels where anime/manga content is appropriate</span>
            </div>
            <div className="tos-list-item">
              <span>Not use the bot to retrieve or distribute NSFW content in channels not marked accordingly</span>
            </div>
            <div className="tos-list-item">
              <span>Not attempt to abuse, exploit, or otherwise misuse the bot's functions</span>
            </div>
            <div className="tos-list-item">
              <span>Not use the bot for spam or harassment purposes</span>
            </div>
            <div className="tos-list-item">
              <span>Respect the rate limits and cooldowns implemented in the bot</span>
            </div>
          </div>
        </div>

        {/* Service Availability */}
        <div id="availability" className="tos-section">
          <h2 className="tos-section-title">
            <span className="tos-section-number">4</span>
            Service Availability
          </h2>
          <div className="tos-alert tos-alert-warn">
            <p className="tos-text">
              While we strive to provide uninterrupted service, Aeri is provided &quot;as is&quot; and &quot;as available&quot; without
              warranties of any kind. We do not guarantee that the service will always be available, uninterrupted,
              timely, secure, or error-free.
            </p>
          </div>
          <p className="tos-text">
            We reserve the right to temporarily or permanently suspend the service for maintenance, updates,
            or for any other reason, with or without notice.
          </p>
        </div>

        {/* AniList Integration */}
        <div id="anilist" className="tos-section">
          <h2 className="tos-section-title">
            <span className="tos-section-number">5</span>
            AniList Integration
          </h2>
          <p className="tos-text">
            When you login through OAuth2 with your AniList account, you authorize Aeri to:
          </p>
          <div className="tos-list numbered-list">
            <div className="tos-list-item">
              <span>Access your anime and manga lists</span>
            </div>
            <div className="tos-list-item">
              <span>View your profile information</span>
            </div>
            <div className="tos-list-item">
              <span>Modify your lists when specifically commanded to do so</span>
            </div>
          </div>
          <p className="tos-text">
            You remain responsible for all actions taken through this integration, and should keep
            your linked accounts secure. You may unlink your account at any time using the bot's commands.
          </p>
        </div>

        {/* Intellectual Property */}
        <div id="intellectual" className="tos-section">
          <h2 className="tos-section-title">
            <span className="tos-section-number">6</span>
            Intellectual Property
          </h2>
          <p className="tos-text">
            The Aeri bot, its name, logo, code, and all content related to it are owned by us or our licensors
            and are protected by intellectual property laws. You may not use, reproduce, distribute, or create
            derivative works based upon Aeri without our express permission.
          </p>
          <p className="tos-text">
            Anime, manga, and character data retrieved through the bot belong to their respective owners and creators.
            We do not claim ownership over this third-party content.
          </p>
        </div>

        {/* Content Liability */}
        <div id="content" className="tos-section">
          <h2 className="tos-section-title">
            <span className="tos-section-number">7</span>
            Content Liability
          </h2>
          <p className="tos-text">
            We do not moderate or pre-screen the content retrieved from third-party APIs. While we attempt to filter
            adult content according to Discord channel settings, we are not responsible for any content that may be
            considered offensive, inappropriate, or inaccurate.
          </p>
        </div>

        {/* Limitation of Liability */}
        <div id="liability" className="tos-section">
          <h2 className="tos-section-title">
            <span className="tos-section-number">8</span>
            Limitation of Liability
          </h2>
          <div className="tos-alert tos-alert-danger">
            <p className="tos-text">
              To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special,
              consequential, or punitive damages, or any loss of profits or revenue, whether incurred directly or
              indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from:
            </p>
          </div>
          <div className="tos-list numbered-list">
            <div className="tos-list-item">
              <span>Your use or inability to use the bot</span>
            </div>
            <div className="tos-list-item">
              <span>Any unauthorized access to or use of our servers and/or any personal information stored therein</span>
            </div>
            <div className="tos-list-item">
              <span>Any bugs, viruses, or other harmful code that may be transmitted through the bot</span>
            </div>
            <div className="tos-list-item">
              <span>Any content obtained from the bot</span>
            </div>
            <div className="tos-list-item">
              <span>Any interruption or cessation of transmission to or from the bot</span>
            </div>
          </div>
        </div>

        {/* Changes to the Service and Terms */}
        <div id="changes" className="tos-section">
          <h2 className="tos-section-title">
            <span className="tos-section-number">9</span>
            Changes to Service and Terms
          </h2>
          <p className="tos-text">
            We reserve the right to modify or replace these Terms of Service at any time. We will provide notice
            of significant changes through our Discord support server or bot announcements. Your continued use of
            the bot after such changes constitutes your acceptance of the new Terms of Service.
          </p>
          <p className="tos-text">
            We may also modify, suspend, or discontinue the bot or any of its features at any time, with or without notice.
          </p>
        </div>

        {/* Termination */}
        <div id="termination" className="tos-section">
          <h2 className="tos-section-title">
            <span className="tos-section-number">10</span>
            Termination
          </h2>
          <div className="tos-columns">
            <div className="tos-column">
              <div className="tos-panel">
                <h3 className="tos-panel-title">Our Rights</h3>
                <p className="tos-text">
                  We may terminate or suspend your access to the bot immediately, without prior notice or liability,
                  for any reason, including violations of these Terms of Service.
                </p>
              </div>
            </div>
            <div className="tos-column">
              <div className="tos-panel">
                <h3 className="tos-panel-title">Your Rights</h3>
                <p className="tos-text">
                  You may remove the bot from your Discord server at any time. Your server-specific settings
                  will be deleted upon removal. You may also unlink your AniList account
                  through the bot's commands or by revoking access through your AniList account settings.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Governing Law */}
        <div id="governing" className="tos-section">
          <h2 className="tos-section-title">
            <span className="tos-section-number">11</span>
            Governing Law
          </h2>
          <p className="tos-text">
            These Terms shall be governed and construed in accordance with the laws of the European Union, without
            regard to its conflict of law provisions.
          </p>
          <p className="tos-text">
            Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
            If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions
            of these Terms will remain in effect.
          </p>
        </div>

        {/* Contact Information */}
        <div id="contact" className="tos-section">
          <h2 className="tos-section-title">
            <span className="tos-section-number">12</span>
            Contact Information
          </h2>
          <p className="tos-text">
            If you have any questions about these Terms, please contact us:
          </p>
          <div className="tos-contact">
            <a href="https://discord.gg/kKqsaKYUfz" className="tos-contact-link tos-discord">
              <svg className="tos-contact-icon" viewBox="0 0 127.14 96.36" fill="currentColor">
                <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
              </svg>
              Discord Support Server
            </a>
            <a href="https://github.com/tomosfps/aeri/issues" className="tos-contact-link tos-github">
              <svg xmlns="http://www.w3.org/2000/svg" className="tos-contact-icon" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              GitHub Issues
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="tos-footer">
        <p>
          These Terms of Service were last updated on May 17th, 2025 and apply to all users of the Aeri Discord bot.
        </p>
        <p>
          <Link to="/privacy">View our Privacy Policy</Link>
        </p>
      </div>
    </main>
  );
}