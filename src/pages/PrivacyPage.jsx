import React from "react";
import SiteFooter from "../components/SiteFooter.jsx";
import { Link } from "react-router-dom";

const LAST_UPDATED = "August 26, 2025";

export default function PrivacyPage() {
  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 24 }}>
      <header className="row hdr-right-wrap" style={{ gap: 12, marginBottom: 24 }}>
        <div className="brand"><Link to="/">OneWord</Link></div>
      </header>

      <article className="document" style={{ maxWidth: 860, margin: "0 auto" }}>
        <h1>OneWord Privacy Policy</h1>
        <p><em>Effective Date: {LAST_UPDATED}</em></p>

        <p>
          Welcome to OneWord. Your privacy is important to us. This Privacy Policy explains how OneWord
          ("OneWord," "we," or "us") collects, uses, and protects your information when you use our platform.
          OneWord is a service that allows users to submit one word per day reflecting their thoughts, emotions,
          or mood. At launch, OneWord is an anonymous-only platform – you do not need to create an account or
          provide personal details to use it. We only collect minimal data necessary to provide and improve the
          service. We wrote this policy in clear, plain language so you can easily understand our practices. 
          This Privacy Policy applies globally to all users of OneWord.
        </p>

        <h2>Information We Collect</h2>
        <p>
          We aim to collect only the data that is necessary for OneWord to function and be improved. The types
          of information we collect include:
        </p>
        <ul>
          <li>
            <strong>One-Word Submissions:</strong> The single word you submit each day on OneWord. This word is
            your daily personal entry. By design, we do not require you to include any personal information in
            your word submissions. These submissions are stored anonymously without your name or contact details
            attached.
          </li>
          <li>
            <strong>Device and Technical Data:</strong> When you use OneWord, we automatically collect certain
            technical information to make sure you can only submit one word per day and to maintain the service.
            This includes data such as your device or browser identifier (for example, a unique ID assigned via a
            cookie or local storage), your IP address, the date and time of your submission, and basic device
            information (like browser type and operating system). We might infer a coarse location (e.g., city or
            country) from your IP address for analytics and language or regional settings. This technical data
            helps us prevent abuse (such as multiple submissions in one day) and troubleshoot any issues.
          </li>
          <li>
            <strong>Cookies and Local Storage:</strong> We may use a small file (a cookie) or similar local
            storage on your browser/device to remember your unique device ID or settings. For example, a cookie
            might store an anonymous ID so that OneWord knows you already submitted your word for the day. These
            cookies do not contain personal details about you, just technical identifiers.
          </li>
          <li>
            <strong>Optional Account Information:</strong> In the future, we plan to introduce optional user
            accounts. If you choose to create an account, we would collect information you provide for that
            account. This may include a username, email address, password, or other profile details you choose to
            give. Any words you submit while logged in would then be linked to your account (so you can view your
            personal word history). Providing an account is entirely optional – you can continue to use OneWord
            anonymously if you prefer.
          </li>
          <li>
            <strong>Payment Information (Premium Features):</strong> As part of our roadmap, we may offer premium
            features or subscriptions. If you choose to purchase a premium feature, we will collect information
            needed to process the payment. However, OneWord will use a trusted third-party payment processor to
            handle your payment information (such as credit card number or financial account details). We do not
            store your full payment card details on our servers. We might keep records of your transactions (e.g.,
            that you purchased a premium tier and when) for account management, support, and compliance with tax
            or financial laws.
          </li>
          <li>
            <strong>Support and Communications:</strong> If you contact us (for example, by emailing support or
            filling out a contact form), we will collect the information you voluntarily provide in that
            communication, such as your email address and the content of your message. We will use this
            information to respond to you and solve your issue. We may also keep a record of these communications
            for future reference and to improve our support services.
          </li>
          <li>
            <strong>No Sensitive Personal Data:</strong> OneWord does not intentionally collect any sensitive
            personal data such as government ID numbers, health information, biometric data, or similar sensitive
            details. Because OneWord only asks for a single word and no identity info, you should not include
            sensitive personal details in your daily word submissions. If in the future optional accounts are
            offered, we will still not ask for sensitive information as part of registration.
          </li>
        </ul>

        <h2>How We Use Your Information</h2>
        <p>We use the information we collect for the following purposes:</p>
        <ul>
          <li>
            <strong>Provide and Improve the Service:</strong> We use your one-word submissions and technical data
            to run OneWord and deliver its core functionality. For example, we use the device ID or IP to ensure
            you can only post one word per day and prevent abuse. We also analyze the words submitted (in
            aggregate, not individually by user) to understand trends and improve our features and user
            experience.
          </li>
          <li>
            <strong>Personalize Your Experience:</strong> In the future, if you have an account or premium
            features, we may use your data to personalize the service for you. For instance, if you opt into
            creating an account, we will use your submission history to show you your past words or patterns over
            time. If you use premium features, we’ll use your data to deliver those features (for example,
            unlocking additional insights about your words).
          </li>
          <li>
            <strong>Analytics:</strong> We may use analytics tools to understand how people use OneWord. These
            tools might use technical data (like device information and general location) to provide us insights
            such as which features are most popular or what times of day users are most active. This information
            helps us make informed decisions on improving OneWord. Analytics will be performed on aggregated data
            — for example, we might look at overall patterns like the most common mood word of the day across all
            users, without focusing on any individual.
          </li>
          <li>
            <strong>Moderation and Safety:</strong> We use the information we collect to keep OneWord safe and
            fair. For example, technical data helps us detect and prevent spam or multiple submissions from the
            same user in a single day. We may also monitor word submissions for offensive or prohibited content
            (e.g., hate speech) and use technical tools or filters to block or remove such content. This ensures
            OneWord remains a positive space.
          </li>
          <li>
            <strong>Communication:</strong> We may use your contact information (if provided) to communicate with
            you about the service. For instance, if you email us for help, we will respond using your email. In
            the future, if you create an account, we might send service-related notices (like important updates to
            this Privacy Policy or confirmation emails) or, with your consent, occasional product updates. We will
            not spam you; communication will generally be minimal and purposeful.
          </li>
          <li>
            <strong>Payments and Transactions:</strong> If you make a purchase for premium features, we use the
            data to process your payment and provide you the paid service. For example, we may confirm that your
            payment was received and activate your premium features. We might also send you a receipt or notify
            you of any issues with your subscription.
          </li>
          <li>
            <strong>Legal Compliance and Enforcement:</strong> We may process and use your information to comply
            with applicable laws, regulations, legal processes or government requests. Additionally, we will use
            information as necessary to enforce our Terms of Service, to investigate or prevent fraud or security
            issues, and to protect the rights, property, and safety of OneWord, our users, or the public. This
            could include using technical data to investigate violations (for example, if someone is attempting to
            hack our service or post malicious content).
          </li>
        </ul>

        <h2>How We Share Your Information</h2>
        <p>
          We do not share or disclose your personal information to third parties except in the limited situations
          described below. When we do share data, we take steps to protect it. We do not sell your personal
          information to data brokers or marketers.
        </p>
        <ul>
          <li>
            <strong>Service Providers (Processors):</strong> We use trusted third-party companies to help us
            operate OneWord. For example, we may use cloud hosting providers to store data, analytics services to
            help us understand usage, or email service providers to send account verification or support emails.
            These service providers only receive the information necessary for them to perform their functions, and
            they are contractually obligated to protect your data and use it only for our specified purposes.
          </li>
          <li>
            <strong>Aggregated or Anonymous Data:</strong> We may share aggregated, non-identifiable information
            publicly or with partners. For example, we might publish overall trends such as "Today, 60% of OneWord
            users described their mood as 'happy'." Such information will never include personal identifiers and is
            not linked to any individual user.
          </li>
          <li>
            <strong>Legal Requirements:</strong> We may disclose information if required to do so by law or in
            response to a valid legal request (such as a subpoena, court order, or search warrant). We will only
            share what is necessary to comply with such requirements. Additionally, if we need to investigate or
            address illegal activities, suspected fraud, threats to personal safety, or violations of our Terms of
            Service, we may disclose information to the appropriate authorities or involved parties as necessary.
          </li>
          <li>
            <strong>Business Transfers:</strong> If OneWord is involved in a merger, acquisition, investment,
            restructuring, or sale of assets, or in the unlikely event of bankruptcy, your information may be
            transferred to the successor or acquiring entity. If such a transfer occurs, we will ensure that your
            information remains subject to the protections described in this Privacy Policy, and we will notify you
            (for example, via a notice on our website or other communication) if a transfer happens.
          </li>
          <li>
            <strong>With Your Consent:</strong> In any situation other than the ones listed above, if we ever need
            to share your information, we will ask for your consent. For instance, if in the future a third-party
            partner offers a new feature and we want to share some data with them, we would only do so if you
            opt-in to that sharing. As of now, there are no such data sharing arrangements.
          </li>
        </ul>

        <h2>Third-Party Services We Use</h2>
        <p>
          OneWord relies on certain third-party services to function and to provide a quality experience. We
          choose these providers carefully and ensure they are bound to protect your information. The main types
          of third-party services we use (or may use in the future) include:
        </p>
        <ul>
          <li>
            <strong>Hosting and Infrastructure:</strong> We host OneWord on secure cloud servers (for example, a
            reputable cloud service provider like AWS, Google Cloud, or similar). This means that the words you
            submit and related data are stored on their servers. These providers may have access to data for
            storage and backup purposes, but they cannot use your data for any other purposes.
          </li>
          <li>
            <strong>Analytics Tools:</strong> To understand how OneWord is used, we may use third-party analytics
            services (such as Google Analytics or similar platforms). These tools collect usage information like
            page visits, device information, and other usage statistics. This helps us see overall patterns (for
            example, how many users use OneWord each day, or aggregated mood trends). We configure these tools not
            to collect any more data than necessary. For instance, we might anonymize IP addresses in analytics if
            possible. You can opt-out of certain analytics by using browser settings or plugins if you wish.
          </li>
          <li>
            <strong>Email and Communication Services:</strong> If OneWord sends emails (for example, an optional
            account verification email, password reset, or a newsletter if you subscribe), we will use a third-party
            email service provider to send those messages. That provider will handle your email address and the
            content of the email for the sole purpose of sending communications on our behalf.
          </li>
          <li>
            <strong>Payment Processing:</strong> For any premium subscriptions or purchases, we use third-party
            payment processors (such as Stripe, PayPal, or app store payment systems) to handle payment
            transactions securely. These processors will handle your payment information (like credit card numbers
            or bank info) directly. OneWord itself does not receive or store your sensitive financial details; we
            only get confirmation of payment and basic information like the amount and your subscription status.
            The payment processors are compliant with security standards (such as PCI-DSS for credit card
            processing) to protect your financial data.
          </li>
          <li>
            <strong>Content Moderation Tools:</strong> To keep OneWord safe, we may use third-party services or
            automated tools to help moderate submissions (for example, to filter out profanity or detect spam). If
            we do so, any data sent to these moderation services will be limited to what's needed (e.g., the word
            content) and will not include information that directly identifies the user.
          </li>
          <li>
            <strong>Other Partners:</strong> If in the future we integrate other third-party services (for example,
            an optional feature to share your word to another app, or a map to show how moods vary by region), we
            will update this Privacy Policy to explain what data is shared with those partners. We will always give
            you notice and choices if any new third-party integration would handle your personal data.
          </li>
        </ul>

        <h2>Data Security</h2>
        <p>We take security seriously and use a variety of measures to protect your information:</p>
        <ul>
          <li>
            <strong>Encryption:</strong> All communication between your device and OneWord is encrypted using HTTPS
            (SSL/TLS). This means that your one-word submissions and other data are transmitted securely and cannot
            be easily intercepted. If we store any personal information, we also encrypt it at rest (or apply
            hashing in the case of passwords) to add an extra layer of protection.
          </li>
          <li>
            <strong>Access Controls:</strong> We restrict access to personal data to authorized personnel who need
            it to operate or improve OneWord. Because OneWord collects minimal personal data, very few people (if
            any) within our team have access to identifying information. For future account data, access will be
            limited to staff who need to support your account or maintain the service. All staff are trained on the
            importance of user privacy.
          </li>
          <li>
            <strong>Separation of Data:</strong> Where possible, we keep different types of data separate. For
            example, if we introduce accounts, we plan to store account registration information (like email
            addresses) in a different database or table from the one-word submissions. This way, even if someone
            were to access the submissions database, they still would not have a direct way to link those words to
            your contact info.
          </li>
          <li>
            <strong>Monitoring and Testing:</strong> We regularly monitor OneWord for potential vulnerabilities or
            attacks. We keep our software and systems updated. We may run security audits or tests (either
            internally or using external specialists) to identify and fix weaknesses.
          </li>
          <li>
            <strong>Incident Response:</strong> In the unlikely event of a data breach or security incident, we
            have a process in place to respond quickly. This includes investigating the issue, notifying affected
            users and regulators as required by law, and taking steps to prevent future incidents.
          </li>
          <li>
            <strong>No Guarantee:</strong> While we strive to protect your information with robust security
            measures, no method of transmission over the internet or electronic storage is 100% secure. Therefore,
            we cannot guarantee absolute security of your data. However, we continuously work to update and improve
            our security practices to meet or exceed industry standards.
          </li>
        </ul>

        <h2>Data Retention and Deletion</h2>
        <p>
          We retain your information only for as long as necessary to fulfill the purposes described in this
          Privacy Policy, or as required by law. How long we keep data can depend on its type and the context:
        </p>
        <ul>
          <li>
            <strong>Anonymous Word Submissions:</strong> Your daily one-word entries that are not linked to any
            account are stored in our system. We may keep these submissions indefinitely in an anonymized form to
            allow long-term analysis of trends and to improve OneWord. Since these words are not tied to your
            identity at launch, they are essentially anonymous data points. However, if we detect old data that is
            no longer needed, we may delete or aggregate it over time.
          </li>
          <li>
            <strong>Account Data:</strong> If you create an account in the future, we will retain your personal
            information (like your email, profile info, and word history) for as long as your account is active.
            You can delete your account at any time (through a delete account option or by contacting us). Upon
            account deletion, we will erase or anonymize personal data associated with your account (such as your
            email and any identifiable profile info). Your past word submissions may be retained in an aggregated
            or anonymous form (without any link to you) so that overall platform trends remain intact, but they
            will no longer be tied to a deleted account.
          </li>
          <li>
            <strong>Technical Logs:</strong> We may keep technical logs (for example, server logs recording IP
            addresses, errors, or security events) for a short period of time for troubleshooting and security
            monitoring. These logs are generally purged on a routine schedule, unless we need to retain them longer
            (for example, to investigate a security incident or comply with legal obligations).
          </li>
          <li>
            <strong>Payment and Transaction Records:</strong> If you have made payments for premium features, we
            may retain records of those transactions (amount, date, and the services provided) as required for
            financial reporting, auditing, and tax compliance. We do not keep your credit card or bank details
            (those are handled by the payment processor), but we may keep non-sensitive information like that a
            transaction occurred. Transaction records are typically kept for the time period required by law (for
            example, accounting rules might require keeping records for a number of years).
          </li>
          <li>
            <strong>Backup and Archival Copies:</strong> Your data might reside in our secure backups for a period
            of time even after it is deleted from our active systems. We periodically overwrite or delete backups
            as part of our data retention practices. If we restore data from a backup, we will take steps to ensure
            that any previously deleted information remains deleted in the restored data as well.
          </li>
          <li>
            <strong>Legal Requirements:</strong> In certain cases, we may need to retain information for longer if
            required by law. For example, if a law requires us to keep certain data for a minimum time (such as
            financial transaction records), or if we receive a legal order to preserve data, we will comply with
            those requirements. We also may retain information if needed to resolve disputes or enforce our
            agreements, but only for as long as necessary for those purposes.
          </li>
        </ul>

        <h2>International Data Transfers</h2>
        <p>
          OneWord is a global service. The data you provide may be processed and stored in countries other than
          your own. For example, if you are located in the European Economic Area (EEA) or United Kingdom, your
          data might be transferred to the United States or another country where our servers or service providers
          are located. We understand that different countries may have different data protection laws, but we will
          protect your information in line with this Privacy Policy wherever it is processed.
        </p>
        <p>
          If we transfer personal data from the EEA/UK or other regions with data transfer restrictions, we will
          ensure appropriate safeguards are in place. For instance, we may use standard contractual clauses
          approved by the EU Commission or rely on another lawful transfer mechanism to ensure your data is
          protected during transfer. Our service providers are also obligated to uphold data
          protection standards in line with these requirements. By using OneWord or providing us information, you
          understand that your data may be transferred to and stored in our facilities and with those third parties
          with whom we share it as described in this policy, which may be located in different countries.
        </p>

        <h2>Your Rights and Choices</h2>
        <p>
          You have certain rights regarding your personal information, especially if you are in jurisdictions with
          strong privacy laws (such as the European Union or California). OneWord is designed to respect and
          extend these rights to all users where feasible. These rights include:
        </p>
        <ul>
          <li>
            <strong>Right to Access:</strong> You have the right to ask us if we are processing any personal data
            about you, and to request a copy of the information we hold about you. For example, if you create an
            account, you can ask for a copy of your account information and your submitted words associated with
            that account. We will provide this information in a portable format (such as a JSON or CSV
            file) so you can easily review it.
          </li>
          <li>
            <strong>Right to Rectification (Correction):</strong> If any personal information we have about you is
            incorrect or incomplete, you have the right to request that we correct it. For instance, if you have
            an account and you change your email address, you can update it in your profile (or ask us to update
            it). We want to ensure that your information is accurate and up to date.
          </li>
          <li>
            <strong>Right to Deletion:</strong> You have the right to request deletion of your personal data. This
            is sometimes called the "right to be forgotten." If you have an account, you can delete it (which will
            remove personal info like your email and username, and disassociate your identity from any word
            history). If you use OneWord without an account and somehow your data is personal (for example, if you
            contacted support and gave an email), you can request we delete that information as well. We will honor
            valid deletion requests and erase your personal data, except when we have a legal obligation or a
            compelling legitimate reason to keep it (we will let you know if that is the case).
          </li>
          <li>
            <strong>Right to Withdraw Consent:</strong> Where we rely on your consent to process data, you have the
            right to withdraw that consent at any time. For example, if we ever ask for your consent to receive a
            newsletter or to share your data with a new feature, you can opt out later if you change your mind.
            Withdrawing consent will not affect the lawfulness of any processing we already did, but it will stop
            the future processing of your data for that purpose.
          </li>
          <li>
            <strong>Right to Object or Opt-Out:</strong> You have the right to object to certain types of
            processing or to opt out. For example, if we were to use your data for marketing or if you are a
            California resident and want to opt out of any "sale" of your data, you can let us know. OneWord does
            not sell personal data, so there is no sale to opt out of in our case. If we send you any
            marketing communications, we will provide an easy way to opt out (such as an "unsubscribe" link in an
            email).
          </li>
          <li>
            <strong>Right to Non-Discrimination:</strong> OneWord will never punish or treat you differently for
            exercising your privacy rights. If you choose to exercise any of the rights described here, we will not
            deny you our service, charge you different prices, or give you a lower quality experience because of it. 
            These rights are provided to empower you, and we support your ability to use them freely.
          </li>
          <li>
            <strong>Right to Data Portability:</strong> You can request that we provide your personal data in a
            structured, commonly used, machine-readable format, so that you can transfer it to another service if
            you want. Typically, this would apply to data in your account (e.g., your collection of word
            submissions and any profile info). We will assist with such requests to the extent required by law.
          </li>
          <li>
            <strong>Right to Complain:</strong> If you have a concern about how we are handling your data, you have
            the right to lodge a complaint. If you are in the EU/EEA, you can complain to your local data
            protection authority. We encourage you to contact us first at OneWord so we can address
            your concerns directly, but this option is available to you. For California residents, if you feel we
            have not addressed your privacy concern, you can contact the California Attorney General’s office or
            the California Privacy Protection Agency.
          </li>
        </ul>
        <p>
          <strong>How to Exercise Your Rights:</strong> You can exercise these rights by contacting us (see the
          "Contact Us" section below). For certain requests, we may need to verify your identity (to protect your
          privacy and ensure we are providing data to the correct person). We will respond to your request as soon
          as possible, and in any event within any timeframes required by law. There is no fee for making a request, unless it is
          excessive or unfounded, in which case we will explain why a fee might apply.
        </p>

        <h2>Children's Privacy</h2>
        <p>
          OneWord is not directed to children under the age of 13. We do not knowingly collect personal information
          from anyone under 13 years old. If you are under 13, please do not use OneWord or submit any information
          to us.
        </p>
        <p>
          If we become aware that we have unknowingly collected personal data from a child under 13, we will take
          prompt steps to delete such information from our records. If you are a parent or guardian and believe that
          a child under your care has provided personal data to OneWord, please contact us immediately so we can
          investigate and delete any such data.
        </p>
        <p>
          (Note: In some regions, such as the European Union, stricter age limits may apply (for example, age 16 under
          GDPR unless parental consent is obtained) If you are below the applicable age in your region,
          please use OneWord only with parental permission.)
        </p>

        <h2>Changes to This Privacy Policy</h2>
        <p>
          We may update this Privacy Policy from time to time to reflect changes in our practices, technologies,
          legal requirements, or for other reasons. If we make changes, we will post the updated policy on our
          website or app and update the "Effective Date" at the top. If the changes are significant, we will provide
          a more prominent notice (such as by email to account holders or a pop-up notice on the site) to inform you.
          We encourage you to review this Privacy Policy periodically to stay informed about how we are protecting
          your information.
        </p>
        <p>
          Any updated policy will be effective as of the stated effective date. By continuing to use OneWord after an
          update, you will be considered to have accepted the changes, to the extent permitted by applicable law. If
          you do not agree to the changes, you should stop using OneWord or delete your account (if you have one), and
          you may always contact us with any concerns.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please
          contact us. We are here to help and address any privacy-related inquiries you might have.
        </p>
        <p>
          You can reach us by email at <a href="mailto:privacy@oneword.world">privacy@oneword.world</a>.
        </p>
        <p>
          If you prefer to contact us by mail, our address is:
        </p>
        <p>
          OneWord Privacy Team<br />
          OneWord Co.<br />
          New York, NY<br />
          USA
        </p>
        <p>
          We will respond to your inquiry as soon as possible, typically within a few business days. For security and
          confidentiality, we may need to verify your identity before processing certain requests (such as access or
          deletion requests) to ensure we are protecting your data from unauthorized requests.
        </p>
      </article>

      <SiteFooter />
    </div>
  );
}
