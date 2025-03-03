import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  return (
    <main className="w-full max-w-5xl mx-auto px-4 py-12">
      {/* Header Section */}
      <div className="mb-12 border-b border-cborder-light pb-6">
        <h1 className="text-4xl font-bold text-cprimary-light mb-4">Privacy Policy</h1>
        <p className="text-sm text-ctext-light/70">Last updated: March 3, 2025</p>
      </div>

      {/* Table of Contents */}
      <div className="bg-cbackground-light/30 rounded-lg p-6 mb-12 border border-cborder-light">
        <h2 className="text-xl text-cprimary-light mb-4 font-medium">Contents</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <li>
            <a href="#introduction" className="text-csecondary-light hover:underline flex items-center">
              <span className="text-xs bg-cprimary-light/10 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">1</span>
              Introduction
            </a>
          </li>
          <li>
            <a href="#information-collected" className="text-csecondary-light hover:underline flex items-center">
              <span className="text-xs bg-cprimary-light/10 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">2</span>
              Information We Collect
            </a>
          </li>
          <li>
            <a href="#how-we-use" className="text-csecondary-light hover:underline flex items-center">
              <span className="text-xs bg-cprimary-light/10 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">3</span>
              How We Use Your Information
            </a>
          </li>
          <li>
            <a href="#data-storage" className="text-csecondary-light hover:underline flex items-center">
              <span className="text-xs bg-cprimary-light/10 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">4</span>
              Data Storage and Security
            </a>
          </li>
          <li>
            <a href="#data-sharing" className="text-csecondary-light hover:underline flex items-center">
              <span className="text-xs bg-cprimary-light/10 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">5</span>
              Data Sharing
            </a>
          </li>
          <li>
            <a href="#data-retention" className="text-csecondary-light hover:underline flex items-center">
              <span className="text-xs bg-cprimary-light/10 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">6</span>
              Data Retention
            </a>
          </li>
          <li>
            <a href="#your-rights" className="text-csecondary-light hover:underline flex items-center">
              <span className="text-xs bg-cprimary-light/10 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">7</span>
              Your Rights
            </a>
          </li>
          <li>
            <a href="#childrens-privacy" className="text-csecondary-light hover:underline flex items-center">
              <span className="text-xs bg-cprimary-light/10 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">8</span>
              Children's Privacy
            </a>
          </li>
          <li>
            <a href="#changes" className="text-csecondary-light hover:underline flex items-center">
              <span className="text-xs bg-cprimary-light/10 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">9</span>
              Changes to This Policy
            </a>
          </li>
          <li>
            <a href="#contact" className="text-csecondary-light hover:underline flex items-center">
              <span className="text-xs bg-cprimary-light/10 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">10</span>
              Contact Information
            </a>
          </li>
          <li>
            <a href="#consent" className="text-csecondary-light hover:underline flex items-center">
              <span className="text-xs bg-cprimary-light/10 rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">11</span>
              Consent
            </a>
          </li>
        </ul>
      </div>

      {/* Policy Content */}
      <section className="space-y-12">
        {/* Introduction */}
        <div id="introduction" className="bg-cbackground-light border border-cborder-light rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-cprimary-light mb-4 flex items-center">
            <span className="flex items-center justify-center bg-cprimary-light text-white rounded-full h-8 w-8 mr-3 text-sm">1</span>
            Introduction
          </h2>
          <p className="text-ctext-light leading-relaxed">
            Welcome to Aeri (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;). We respect your privacy and are committed to 
            protecting your personal data. This privacy policy explains how we collect, use, and protect information 
            that identifies you (&quot;personal data&quot;) when you use our Discord bot services.
          </p>
        </div>

        {/* Information We Collect */}
        <div id="information-collected" className="bg-cbackground-light border border-cborder-light rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-cprimary-light mb-4 flex items-center">
            <span className="flex items-center justify-center bg-cprimary-light text-white rounded-full h-8 w-8 mr-3 text-sm">2</span>
            Information We Collect
          </h2>
          <p className="text-ctext-light leading-relaxed mb-4">We may collect, use, store and transfer the following kinds of data about you:</p>
          
          <div className="mb-4 pl-4 border-l-2 border-csecondary-light/30">
            <h3 className="text-xl font-medium text-csecondary-light mb-2">2.1. Information Collected Through Discord</h3>
            <ul className="list-disc pl-5 text-ctext-light space-y-1">
              <li>Discord User ID</li>
              <li>Discord Username</li>
              <li>Discord Guild ID (Server ID)</li>
              <li>Discord Guild Name (Server Name)</li>
              <li>Discord Channel IDs where our commands are used</li>
              <li>Command usage data (which commands you use and when)</li>
            </ul>
          </div>

          <div className="pl-4 border-l-2 border-csecondary-light/30">
            <h3 className="text-xl font-medium text-csecondary-light mb-2">2.2. Connected Third-Party Services</h3>
            <p className="text-ctext-light leading-relaxed mb-2">
              If you choose to link your AniList account to our service, we collect:
            </p>
            <ul className="list-disc pl-5 text-ctext-light space-y-1">
              <li>AniList username</li>
              <li>AniList user ID</li>
              <li>Authentication tokens for accessing your AniList data</li>
              <li>Data about your anime and manga lists, including titles, ratings, and progress</li>
            </ul>
          </div>
        </div>

        {/* How We Use Your Information */}
        <div id="how-we-use" className="bg-cbackground-light border border-cborder-light rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-cprimary-light mb-4 flex items-center">
            <span className="flex items-center justify-center bg-cprimary-light text-white rounded-full h-8 w-8 mr-3 text-sm">3</span>
            How We Use Your Information
          </h2>
          <p className="text-ctext-light leading-relaxed mb-4">We use your information for the following purposes:</p>
          <ul className="list-disc pl-5 text-ctext-light grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
            <li>To provide, operate, and maintain our bot services</li>
            <li>To personalize commands and features for your specific use</li>
            <li>To link your Discord account with AniList (only if you specifically request this)</li>
            <li>To save your preferences for future interactions</li>
            <li>To analyze command usage and improve our services</li>
            <li>To detect and prevent abuse or unauthorized use</li>
            <li>To respond to your requests or questions</li>
          </ul>
        </div>

        {/* Data Storage and Security */}
        <div id="data-storage" className="bg-cbackground-light border border-cborder-light rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-cprimary-light mb-4 flex items-center">
            <span className="flex items-center justify-center bg-cprimary-light text-white rounded-full h-8 w-8 mr-3 text-sm">4</span>
            Data Storage and Security
          </h2>
          <p className="text-ctext-light leading-relaxed mb-4">
            We use modern security practices to store your personal information securely. All data is 
            stored in secure databases and we implement appropriate technical safeguards to protect your information.
          </p>
          <p className="text-ctext-light leading-relaxed">
            Your data is stored on secure servers located in the European Union. Authentication tokens are 
            encrypted, and we regularly update our security practices to enhance protection.
          </p>
        </div>

        {/* Data Sharing */}
        <div id="data-sharing" className="bg-cbackground-light border border-cborder-light rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-cprimary-light mb-4 flex items-center">
            <span className="flex items-center justify-center bg-cprimary-light text-white rounded-full h-8 w-8 mr-3 text-sm">5</span>
            Data Sharing
          </h2>
          <p className="text-ctext-light leading-relaxed mb-4">We do not sell, trade, or otherwise transfer your personal information to outside parties. We may share limited data with:</p>
          <ul className="list-disc pl-5 text-ctext-light space-y-2">
            <li><span className="font-medium text-csecondary-light">AniList API:</span> To perform the functions you request (searching anime/manga, updating profiles)</li>
            <li><span className="font-medium text-csecondary-light">Service providers:</span> For hosting and operating our services</li>
            <li><span className="font-medium text-csecondary-light">Legal requirements:</span> When required by law or to protect our rights</li>
          </ul>
        </div>

        {/* Data Retention */}
        <div id="data-retention" className="bg-cbackground-light border border-cborder-light rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-cprimary-light mb-4 flex items-center">
            <span className="flex items-center justify-center bg-cprimary-light text-white rounded-full h-8 w-8 mr-3 text-sm">6</span>
            Data Retention
          </h2>
          <p className="text-ctext-light leading-relaxed mb-4">
            We retain your personal data only for as long as necessary to fulfill the purposes we collected 
            it for. User data related to preferences and linked accounts is stored until you explicitly 
            request its removal or unlink your accounts.
          </p>
          <p className="text-ctext-light leading-relaxed">
            Command usage data is retained for analytical purposes for up to 90 days, after which it is aggregated 
            and anonymized.
          </p>
        </div>

        {/* Your Rights */}
        <div id="your-rights" className="bg-cbackground-light border border-cborder-light rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-cprimary-light mb-4 flex items-center">
            <span className="flex items-center justify-center bg-cprimary-light text-white rounded-full h-8 w-8 mr-3 text-sm">7</span>
            Your Rights
          </h2>
          <p className="text-ctext-light leading-relaxed mb-4">Depending on your location, you may have the following rights regarding your data:</p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <li className="flex items-start">
              <div className="bg-cprimary-light/10 rounded p-1 mr-2 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cprimary-light" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-ctext-light">Access to your personal data</span>
            </li>
            <li className="flex items-start">
              <div className="bg-cprimary-light/10 rounded p-1 mr-2 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cprimary-light" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-ctext-light">Correction of inaccurate data</span>
            </li>
            <li className="flex items-start">
              <div className="bg-cprimary-light/10 rounded p-1 mr-2 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cprimary-light" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-ctext-light">Deletion of your data</span>
            </li>
            <li className="flex items-start">
              <div className="bg-cprimary-light/10 rounded p-1 mr-2 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cprimary-light" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-ctext-light">Restriction of processing of your data</span>
            </li>
            <li className="flex items-start">
              <div className="bg-cprimary-light/10 rounded p-1 mr-2 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cprimary-light" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-ctext-light">Withdrawal of consent for data processing</span>
            </li>
          </ul>
          <div className="bg-csecondary-light/5 border border-csecondary-light/20 rounded p-4">
            <p className="text-ctext-light leading-relaxed">
              To exercise these rights, you can use the <code className="bg-csecondary-light/10 text-csecondary-light px-1.5 py-0.5 rounded">/unlink</code> command to remove AniList connections, 
              or contact us directly.
            </p>
          </div>
        </div>

        {/* Children's Privacy */}
        <div id="childrens-privacy" className="bg-cbackground-light border border-cborder-light rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-cprimary-light mb-4 flex items-center">
            <span className="flex items-center justify-center bg-cprimary-light text-white rounded-full h-8 w-8 mr-3 text-sm">8</span>
            Children&apos;s Privacy
          </h2>
          <p className="text-ctext-light leading-relaxed">
            Our services are not intended for use by children under 13 years of age. We do not knowingly collect 
            personal information from children under 13. If you are a parent or guardian and believe we may have 
            collected information about a child, please contact us.
          </p>
        </div>

        {/* Changes to This Privacy Policy */}
        <div id="changes" className="bg-cbackground-light border border-cborder-light rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-cprimary-light mb-4 flex items-center">
            <span className="flex items-center justify-center bg-cprimary-light text-white rounded-full h-8 w-8 mr-3 text-sm">9</span>
            Changes to This Privacy Policy
          </h2>
          <p className="text-ctext-light leading-relaxed">
            We may update our privacy policy from time to time. We will notify users of any material changes by posting 
            the new privacy policy in our Discord support server and updating the &quot;Last updated&quot; date.
          </p>
        </div>

        {/* Contact Information */}
        <div id="contact" className="bg-cbackground-light border border-cborder-light rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-cprimary-light mb-4 flex items-center">
            <span className="flex items-center justify-center bg-cprimary-light text-white rounded-full h-8 w-8 mr-3 text-sm">10</span>
            Contact Information
          </h2>
          <p className="text-ctext-light leading-relaxed mb-4">
            If you have questions or concerns about this privacy policy or our data practices, please contact us:
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

        {/* Consent */}
        <div id="consent" className="bg-cbackground-light border border-cborder-light rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-cprimary-light mb-4 flex items-center">
            <span className="flex items-center justify-center bg-cprimary-light text-white rounded-full h-8 w-8 mr-3 text-sm">11</span>
            Consent
          </h2>
          <p className="text-ctext-light leading-relaxed">
            By using Aeri&apos;s services, you consent to our privacy policy and agree to its terms. If you do not 
            agree with this policy, please do not use our services.
          </p>
        </div>
      </section>

      {/* Footer */}
      <div className="mt-12 pt-6 border-t border-cborder-light text-ctext-light/70 text-sm">
        <p>
          This document was last updated on March 3, 2025 and applies to the Aeri Discord bot and related services.
        </p>
        <p className="mt-4">
          <Link to="/tos" className="text-csecondary-light hover:underline">View our Terms of Service</Link>
        </p>
      </div>
    </main>
  );
}