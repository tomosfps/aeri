import { Link } from "react-router-dom";
import "~/styles/privacy.css";

export function meta() {
  return [{ title: "Privacy Policy | Aeri" }];
}

export default function PrivacyPolicy() {
  return (
    <main className="privacy-container">
      {/* Header Section */}
      <div className="privacy-header">
        <h1 className="privacy-title">Privacy Policy</h1>
        <p className="privacy-last-updated">Last updated: May 17th, 2025</p>
      </div>

      {/* Table of Contents */}
      <div className="privacy-toc">
        <h2 className="privacy-toc-title">Contents</h2>
        <ul className="privacy-toc-list">
          <li className="privacy-toc-item">
            <a href="#introduction">
              <span className="privacy-toc-number">1</span>
              Introduction
            </a>
          </li>
          <li className="privacy-toc-item">
            <a href="#information-collected">
              <span className="privacy-toc-number">2</span>
              Information We Collect
            </a>
          </li>
          <li className="privacy-toc-item">
            <a href="#how-we-use">
              <span className="privacy-toc-number">3</span>
              How We Use Your Information
            </a>
          </li>
          <li className="privacy-toc-item">
            <a href="#data-storage">
              <span className="privacy-toc-number">4</span>
              Data Storage and Security
            </a>
          </li>
          <li className="privacy-toc-item">
            <a href="#data-sharing">
              <span className="privacy-toc-number">5</span>
              Data Sharing
            </a>
          </li>
          <li className="privacy-toc-item">
            <a href="#data-retention">
              <span className="privacy-toc-number">6</span>
              Data Retention
            </a>
          </li>
          <li className="privacy-toc-item">
            <a href="#your-rights">
              <span className="privacy-toc-number">7</span>
              Your Rights
            </a>
          </li>
          <li className="privacy-toc-item">
            <a href="#childrens-privacy">
              <span className="privacy-toc-number">8</span>
              Children's Privacy
            </a>
          </li>
          <li className="privacy-toc-item">
            <a href="#changes">
              <span className="privacy-toc-number">9</span>
              Changes to This Policy
            </a>
          </li>
          <li className="privacy-toc-item">
            <a href="#contact">
              <span className="privacy-toc-number">10</span>
              Contact Information
            </a>
          </li>
          <li className="privacy-toc-item">
            <a href="#consent">
              <span className="privacy-toc-number">11</span>
              Consent
            </a>
          </li>
        </ul>
      </div>

      {/* Privacy Content */}
      <section className="privacy-content">
        {/* Introduction */}
        <div id="introduction" className="privacy-section">
          <h2 className="privacy-section-title">
            <span className="privacy-section-number">1</span>
            Introduction
          </h2>
          <p className="privacy-text">
            Welcome to Aeri (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;). We respect your privacy and are committed to
            protecting your personal data. This privacy policy explains how we collect, use, and protect information
            that identifies you (&quot;personal data&quot;) when you use our Discord bot services.
          </p>
        </div>

        {/* Information We Collect */}
        <div id="information-collected" className="privacy-section">
          <h2 className="privacy-section-title">
            <span className="privacy-section-number">2</span>
            Information We Collect
          </h2>
          <p className="privacy-text">We may collect, use, store and transfer the following kinds of data about you:</p>

          <div className="privacy-subsection">
            <h3 className="privacy-subsection-title">2.1. Information Collected Through Discord</h3>
            <div className="privacy-list">
              <div className="privacy-list-item">
                <span>Discord User ID</span>
              </div>
              <div className="privacy-list-item">
                <span>IDs of Discord guilds in which you have made use of the service</span>
              </div>
            </div>
          </div>

          <div className="privacy-subsection">
            <h3 className="privacy-subsection-title">2.2. Connected Third-Party Services</h3>
            <p className="privacy-text">
              If you choose to link your AniList account to our service, we collect:
            </p>
            <div className="privacy-list">
              <div className="privacy-list-item">
                <span>AniList username</span>
              </div>
              <div className="privacy-list-item">
                <span>AniList user ID</span>
              </div>
              <div className="privacy-list-item">
                <span>OAuth2 token for accessing your AniList data</span>
              </div>
            </div>
          </div>
        </div>

        {/* How We Use Your Information */}
        <div id="how-we-use" className="privacy-section">
          <h2 className="privacy-section-title">
            <span className="privacy-section-number">3</span>
            How We Use Your Information
          </h2>
          <p className="privacy-text">We use your information for the following purposes:</p>
          <div className="privacy-columns">
            <div className="privacy-list">
              <div className="privacy-list-item">
                <span>To provide, operate, and maintain our bot services</span>
              </div>
              <div className="privacy-list-item">
                <span>To personalize commands and features for your specific use</span>
              </div>
              <div className="privacy-list-item">
                <span>To link your Discord account with AniList (only if you specifically request this)</span>
              </div>
              <div className="privacy-list-item">
                <span>To save your preferences for future interactions</span>
              </div>
              <div className="privacy-list-item">
                <span>To detect and prevent abuse or unauthorized use</span>
              </div>
              <div className="privacy-list-item">
                <span>To respond to your requests or questions</span>
              </div>
            </div>
          </div>
        </div>

        {/* Data Storage and Security */}
        <div id="data-storage" className="privacy-section">
          <h2 className="privacy-section-title">
            <span className="privacy-section-number">4</span>
            Data Storage and Security
          </h2>
          <p className="privacy-text">
            We use modern security practices to store your personal information securely. All data is
            stored in secure databases and we implement appropriate technical safeguards to protect your information.
          </p>
            <p className="privacy-text">
              Your data is stored on secure servers located in the European Union.
            </p>
        </div>

        {/* Data Sharing */}
        <div id="data-sharing" className="privacy-section">
          <h2 className="privacy-section-title">
            <span className="privacy-section-number">5</span>
            Data Sharing
          </h2>
          <p className="privacy-text">We do not sell, trade, or otherwise transfer your personal information to outside parties. We may share limited data with:</p>
          <div className="privacy-list">
            <div className="privacy-list-item">
              <span><strong>AniList API:</strong> To perform the functions you request</span>
            </div>
            <div className="privacy-list-item">
              <span><strong>Legal requirements:</strong> When required by law or to protect our rights</span>
            </div>
          </div>
        </div>

        {/* Data Retention */}
        <div id="data-retention" className="privacy-section">
          <h2 className="privacy-section-title">
            <span className="privacy-section-number">6</span>
            Data Retention
          </h2>
          <p className="privacy-text">
            We retain your personal data only for as long as necessary to fulfill the purposes we collected
            it for. User data related to preferences and linked accounts is stored until you explicitly
            request its removal or unlink your accounts.
          </p>
        </div>

        {/* Your Rights */}
        <div id="your-rights" className="privacy-section">
          <h2 className="privacy-section-title">
            <span className="privacy-section-number">7</span>
            Your Rights
          </h2>
          <p className="privacy-text">Depending on your location, you may have the following rights regarding your data:</p>
          <div className="privacy-grid">
            <div className="privacy-grid-item">
              <div className="privacy-checkmark"></div>
              <span>Access to your personal data</span>
            </div>
            <div className="privacy-grid-item">
              <div className="privacy-checkmark"></div>
              <span>Correction of inaccurate data</span>
            </div>
            <div className="privacy-grid-item">
              <div className="privacy-checkmark"></div>
              <span>Deletion of your data</span>
            </div>
            <div className="privacy-grid-item">
              <div className="privacy-checkmark"></div>
              <span>Restriction of processing of your data</span>
            </div>
            <div className="privacy-grid-item">
              <div className="privacy-checkmark"></div>
              <span>Withdrawal of consent for data processing</span>
            </div>
          </div>
          <div className="privacy-alert privacy-alert-info">
            <p className="privacy-text">
              To exercise these rights, you can use the <code className="privacy-code">/unlink</code> command to remove AniList connections,
              or contact us directly.
            </p>
          </div>
        </div>

        {/* Children's Privacy */}
        <div id="childrens-privacy" className="privacy-section">
          <h2 className="privacy-section-title">
            <span className="privacy-section-number">8</span>
            Children&apos;s Privacy
          </h2>
          <p className="privacy-text">
            Our services are not intended for use by children under 13 years of age. We do not knowingly collect
            personal information from children under 13. If you are a parent or guardian and believe we may have
            collected information about a child, please contact us.
          </p>
        </div>

        {/* Changes to This Privacy Policy */}
        <div id="changes" className="privacy-section">
          <h2 className="privacy-section-title">
            <span className="privacy-section-number">9</span>
            Changes to This Policy
          </h2>
          <p className="privacy-text">
            We may update our privacy policy from time to time. We will notify users of any material changes by posting
            the new privacy policy in our Discord support server and updating the &quot;Last updated&quot; date.
          </p>
        </div>

        {/* Contact Information */}
        <div id="contact" className="privacy-section">
          <h2 className="privacy-section-title">
            <span className="privacy-section-number">10</span>
            Contact Information
          </h2>
          <p className="privacy-text">
            If you have questions or concerns about this privacy policy or our data practices, please contact us:
          </p>
          <div className="privacy-contact">
            <a href="https://discord.gg/kKqsaKYUfz" className="privacy-contact-link privacy-discord">
              <svg className="privacy-contact-icon" viewBox="0 0 127.14 96.36" fill="currentColor">
                <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
              </svg>
              Discord Support Server
            </a>
            <a href="https://github.com/tomosfps/aeri/issues" className="privacy-contact-link privacy-github">
              <svg xmlns="http://www.w3.org/2000/svg" className="privacy-contact-icon" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              GitHub Issues
            </a>
          </div>
        </div>

        {/* Consent */}
        <div id="consent" className="privacy-section">
          <h2 className="privacy-section-title">
            <span className="privacy-section-number">11</span>
            Consent
          </h2>
          <p className="privacy-text">
            By using Aeri&apos;s services, you consent to our privacy policy and agree to its terms. If you do not
            agree with this policy, please do not use our services.
          </p>
        </div>
      </section>

      {/* Footer */}
      <div className="privacy-footer">
        <p>
          This Privacy Policy was last updated on May 17th, 2025 and applies to all users of the Aeri Discord bot.
        </p>
        <p>
          <Link to="/terms">View our Terms of Service</Link>
        </p>
      </div>
    </main>
  );
}