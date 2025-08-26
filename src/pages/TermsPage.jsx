import React from "react";
import SiteFooter from "../components/SiteFooter.jsx";
import { Link } from "react-router-dom";

const LAST_UPDATED = "August 26, 2025";

export default function TermsPage() {
  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 24 }}>
      <header className="row hdr-right-wrap" style={{ gap: 12, marginBottom: 24 }}>
        <div className="brand"><Link to="/">OneWord</Link></div>
      </header>

      <article className="document" style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1>OneWord Terms of Service</h1>
        <p><em>Last updated: {LAST_UPDATED}</em></p>

        <h2>Acceptance of Terms</h2>
        <p>
          These Terms of Service ("Terms") govern your access to and use of the OneWord application, website, and related services (collectively, the "Service") provided by OneWord ("we", "us", or "our"). By accessing or using OneWord, you agree to be bound by these Terms. If you do not agree to these Terms, you may not use the Service.
        </p>

        <h2>Description of the Service</h2>
        <p>
          OneWord is a platform that allows users to submit one word per day as a daily entry, reflecting something about their day, mood, or thoughts. The core idea is to keep things simple: each user can contribute a single word every 24 hours, creating a daily ritual of expression. At launch, OneWord is completely free to use and does not require any sign-up or personal account. The Service may display aggregated information such as popular words of the day or other anonymous statistics derived from user submissions. Over time, OneWord may introduce new features or enhancements (such as optional accounts, commenting, or premium tools), but the foundational one-word-per-day experience will remain central.
        </p>

        <h2>User Eligibility</h2>
        <p>
          You must be at least 13 years old to use OneWord. If you are under the age of majority in your jurisdiction (typically 18 years old), you should use the Service only with the permission and supervision of a parent or legal guardian. By using the Service, you represent that you meet this age requirement and are otherwise legally qualified to enter into these Terms. You are responsible for ensuring that your use of OneWord complies with all laws and regulations applicable to you.
        </p>

        <h2>User Accounts and Anonymity</h2>
        <p>
          <strong>No Account Required (Anonymous Use):</strong> Currently, OneWord does not require you to create an account or provide personal information in order to participate. You can visit the site or app and submit your daily word anonymously without any login. We do not ask for your name, email, or other identifiers for the basic use of the Service. Each daily submission is generally associated only with technical data (like a device ID or cookie) to enforce the one-word-per-day limit, not with your real identity.
        </p>
        <p>
          <strong>Optional Accounts (Future Feature):</strong> In the future, we may introduce optional user accounts to enhance your experience. For example, creating an account might allow you to view your personal word history, track streaks of consecutive days, see a "word cloud" of your most-used words, or otherwise personalize OneWord. Should such account functionality be added:
        </p>
        <ul>
          <li>Creating an account will be optional – the core Service (one word per day) will remain accessible without logging in.</li>
          <li>You must provide accurate information if you choose to register (for example, a valid email if required).</li>
          <li>You will be responsible for maintaining the confidentiality of any account credentials, and for all activities that occur under your account.</li>
          <li>If you become aware of any unauthorized use of your account, you should notify us immediately.</li>
          <li>We reserve the right to suspend or terminate any account that (i) provides false information, (ii) violates these Terms or other policies, or (iii) is used in a harmful or inappropriate manner.</li>
        </ul>
        <p>
          We emphasize that to start, OneWord is designed for quick, anonymous use to lower friction and encourage participation. As the community grows, we will reassess the need for accounts and implement them only when they add clear value for our users (for instance, once there is significant demand for personal tracking features).
        </p>

        <h2>User Content and Acceptable Use</h2>
        <h3>One-Word Daily Submissions</h3>
        <p>
          By using OneWord, you may submit a single word each day as your contribution ("User Content"). This word could be anything that reflects your current feeling, an idea, or any expression you choose — but it is limited to one word. The Service will not accept lengthy messages or multiple words in a single day from the same user. Any attempt to bypass the one-word limit (for example, by using spaces or punctuation to join words, or using multiple accounts/devices to submit more than one word per day) is prohibited and may result in your submissions being ignored, deleted, or your access being limited.
        </p>
        <h3>Ownership of Your Content</h3>
        <p>
          You retain ownership of the words you submit to OneWord. We do not claim any ownership rights in your individual submissions. However, by submitting a word, you grant us a non-exclusive, worldwide, royalty-free, perpetual license to use, display, reproduce, aggregate, and adapt that content for the purposes of operating and improving the Service. This license allows us, for example, to:
        </p>
        <ul>
          <li>Display your word back to you and (in anonymous form) to other users (e.g., as part of a global "word of the day" showcase or in an aggregated word cloud).</li>
          <li>Include your word in the calculation of anonymized statistics (such as trending words or frequency counts).</li>
          <li>Store your submission on our servers and back it up as part of our normal data management.</li>
        </ul>
        <p>
          This license to your content is necessary for us to provide the Service (since showing the day's words or computing trends inherently uses user submissions). It does not give us the right to sell your individual words as standalone content or to use your word in connection with your personal identity without permission. (In fact, during anonymous use, we have no personal identity info attached to your word.)
        </p>
        <h3>Content Guidelines</h3>
        <p>Even though you're only submitting one word at a time, you must adhere to basic content standards:</p>
        <ul>
          <li><strong>No Illegal Content:</strong> Your word should not be unlawful, threatening, or encourage any illegal activity. (For example, do not submit a word that constitutes a credible threat or that violates someone else's rights.)</li>
          <li><strong>No Hate or Harassment:</strong> Do not submit words that are slurs or epithets against protected groups, or that harass or bully an individual. Hateful or extremely offensive words have no place in OneWord.</li>
          <li><strong>No Extreme or Graphic Content:</strong> Avoid highly disturbing, violent, or sexually explicit words that would not be appropriate in a broad public setting.</li>
          <li><strong>No Personal Data:</strong> Do not use your daily word to post someone’s personal information (like someone’s full name, address, phone number, email) or confidential data. OneWord is not a platform for doxing or sharing sensitive personal details.</li>
          <li><strong>Relevance and Spam:</strong> The spirit of the Service is one meaningful word per day. Do not spam with irrelevant or random characters, ads, or self-promotion. (For example, posting a brand or product name with the intent to advertise is not allowed.)</li>
        </ul>
        <p>
          Remember that your one-word submissions may be visible to others in aggregated forms (and potentially in future community features), so treat this like a public forum in terms of appropriateness. We reserve the right to moderate user content. Although we do not pre-approve each word, we employ simple moderation measures (both automated filters and, as needed, human review) to flag and remove words that clearly violate these guidelines. We may also ban or restrict users who repeatedly submit inappropriate content.
        </p>
        <h3>Future Community Features</h3>
        <p>
          At launch, OneWord focuses strictly on solitary daily word entries without additional social interaction (which keeps moderation simple). In the future, we may introduce community-oriented features that expand on user-generated content, such as:
        </p>
        <ul>
          <li><strong>Tagging/Flagging:</strong> The ability for users to tag certain words or flag inappropriate submissions for review.</li>
          <li><strong>Comments or "Echoes":</strong> The ability to leave a short comment or reaction (an "echo") in response to a daily word, or to discuss the day's global word trends.</li>
        </ul>
        <p>
          If and when such features are added, they will come with additional guidelines and possibly updated Terms or Community Standards. All user interactions will still be expected to remain respectful and lawful, following the same spirit of the content guidelines above. We will prioritize proving that the core one-word daily ritual works and is valuable before layering on these social features.
        </p>

        <h2>Premium Features and Subscriptions</h2>
        <p>
          OneWord is currently provided to users free of charge. There are no fees or paid features at launch, ensuring maximum accessibility and viral growth potential. However, we have plans to offer optional premium features in the future as the user base grows and the product matures (likely a few months after launch, depending on user demand and retention metrics).
        </p>
        <p>
          <strong>Future Premium Tier (Planned):</strong> We may introduce an optional subscription (for example, at an affordable price point around US $4.99 per month, subject to change) that offers paying users extra benefits beyond the free one-word-per-day experience. Potential premium features could include:
        </p>
        <ul>
          <li><strong>Personal History &amp; Archives:</strong> Access to your complete history of past daily words beyond the basic recent history. (For free users, the app might only show a limited history or none at all, whereas premium users could see all their past entries over months/years.)</li>
          <li><strong>Analytics and Mood Trends:</strong> Insights and visualizations based on your words over time. For example, charts or word clouds showing your most common words, sentiment analysis indicating mood trends, streak counters for consecutive days of posting, etc.</li>
          <li><strong>Customization &amp; Cosmetic Features:</strong> Premium options to personalize the app, such as special themes, badges, or the ability to keep a private journal entry alongside your one word (e.g., writing a short note that only you can see when looking at your past word).</li>
          <li><strong>Other Perks:</strong> Any additional features we develop that add value for power-users or dedicated community members, potentially including priority access to new features or an ad-free experience (should we ever introduce ads in the free version).</li>
        </ul>
        <p>
          If you choose to subscribe to a premium tier once available, you will be informed of all applicable fees, terms, and payment procedures at that time. Subscriptions will be completely optional and meant to enhance your experience; the core service of submitting one word per day will remain free for all users. We will ensure transparency about what features are free vs. paid, and you will not be charged without your clear consent (typically through an in-app purchase or similar subscription sign-up flow).
        </p>
        <p>
          <strong>No Premium Services Now:</strong> Since no premium or paid services are currently offered, you should not be asked for any payment information during the basic use of OneWord. Any solicitation of payment claiming to be for OneWord (outside of official channels when we launch a premium service) is invalid and should be reported to us. Likewise, if and when premium features launch, we plan to keep the cost low and the value high; revenue is not our initial focus until we've proven strong daily retention and engagement. That said, we are building the option for premium features into our roadmap from the start so that we can smoothly introduce them when the time comes.
        </p>

        <h2>Data Collection, Analytics, and Privacy</h2>
        <p>
          Your privacy and data security are extremely important to us. We strive to collect only the data that is necessary to provide and improve the OneWord service, and to handle it with care and transparency. Please review our Privacy Policy (if available separately) for full details on our data practices. Key points include:
        </p>
        <h3>Analytics and Usage Data</h3>
        <p>
          We collect basic analytics data from the start to help us understand how OneWord is used and to improve the Service. This includes things like the number of daily active users, retention rates (how many users come back each day), and engagement metrics. For example, we might track that a particular device or browser submitted a word 7 days in a row, or measure what times of day see the most activity. This information helps us make product decisions (e.g., when to send a reminder notification, or which features increase retention).
        </p>
        <p>
          Importantly, in the anonymous phase of our Service, this usage data is not directly tied to your real identity because we do not ask you to log in. We might use browser cookies or device identifiers to distinguish unique users for analytics purposes, but these are random IDs and not things like your name or email. If you later create an account, we may link your past anonymous activity to your new account (for example, to show your historical streak) — but only if that can be done in a privacy-respecting way, and we'll clearly communicate it at that time.
        </p>
        <h3>Data Storage and Security</h3>
        <p>
          All data (including the words you submit and any associated metadata like timestamp or general location if we collect it) is stored securely using reputable cloud infrastructure providers (such as Firebase by Google, Amazon Web Services, or similar services). We separate personal information (if any is provided, such as email for accounts) from the daily word entries to minimize any risk to your privacy. We take industry-standard measures to protect our databases and transmissions, including encryption of data in transit and at rest where appropriate. However, no system can be 100% secure, so we cannot guarantee absolute security of the data. You understand that you provide any data at your own risk, but know that we work hard to safeguard it.
        </p>
        <p>
          We will not store any more data than necessary for running the Service. For example, if no account is created, we might only store your word and a timestamp (plus a hashed device ID for rate-limiting). If an account is created, we'll store your account info (like email and password hash) separately from your words. We will also avoid storing any sensitive personal details that are not needed for the core functionality.
        </p>
        <h3>Data Sharing and Public Display</h3>
        <p>
          By default, words you submit are collected into our database. We may share or display aggregated, anonymized data derived from user submissions to all users or publicly. For instance:
        </p>
        <ul>
          <li>We might show a list of the top 10 most common words submitted on a given day globally.</li>
          <li>We might reveal statistics like "500 people felt 'happy' today" or "20% of users used a positive word this Monday."</li>
          <li>In a future update, we might provide an explore page where users can see a collage or cloud of words submitted (with no personal info attached).</li>
        </ul>
        <p>
          Such displays or shares will never include your personal information. In fact, since we don't collect personal identifiers for anonymous users, the shared trends are inherently anonymized. If you have an account, we will not publish your identity tied to your word without consent; for example, we won't say "Username123 said 'happy' today" publicly, unless a specific feature allows you to share your word with attribution (and you'd control that).
        </p>
        <p>
          We may also share aggregated data externally, for example:
        </p>
        <ul>
          <li><strong>Business or Marketing:</strong> We might share overall usage metrics or trends with partners or in press releases ("OneWord now has 10,000 daily users, and the most popular word this month was 'grateful'.").</li>
          <li><strong>Research:</strong> If we collaborate with academic or well-being researchers, we might provide datasets of words for analysis. These datasets would not contain any information that could identify individual users. They would be purely lists of words and timestamps or other non-identifying markers.</li>
        </ul>
        <p>
          We will never share raw, unaggregated personal submissions with any third party in a way that could identify you, unless we are required to by law (such as a lawful subpoena), and even in such cases we will notify you if permissible. We do not sell personal data to data brokers or advertisers. Any data sharing we do is either internal (to run the service), with service providers under strict controls (see below), or in an anonymized aggregate form.
        </p>
        <h3>Service Providers</h3>
        <p>
          To run OneWord, we may use trusted third-party services (for example, cloud hosting, analytics services, or email providers if we send newsletters or authentication emails). These providers might process some data on our behalf (for instance, storing data on servers or analyzing usage patterns). We will ensure any such providers are bound by appropriate data protection obligations and that they only use your data for the purposes of providing services to us (not for their own purposes).
        </p>
        <h3>No Personal Data Sales</h3>
        <p>
          We want to be very clear: We do not sell your personal data. Building user trust is paramount for OneWord. Any data we collect is used to serve you and to improve our Service, not to make money by selling it to third parties. Our business model, if any, will be based on optional premium subscriptions or aggregated insights, not on exploiting individual user data.
        </p>
        <h3>Transparency and Privacy Choices</h3>
        <p>We believe transparency is key. We will openly communicate any significant changes in our data practices. You have choices about your data:</p>
        <ul>
          <li>If you create an account, you will be able to access and review the personal information associated with it (likely just your email and profile info, plus your word history).</li>
          <li>You will have the ability to delete your account, which will remove or anonymize personal data associated with you. (Your past submitted words might remain in aggregate counts, but they will no longer be tied to any identifier and cannot be linked back to you.)</li>
          <li>If you are an anonymous user and wish to stop using OneWord, you can simply stop visiting the app. We do not have a way to identify an "anonymous" submission as yours to delete it specifically, but since we store minimal personal info in that case, there is not much that can be linked to you personally. If you have concerns, you can contact us for guidance.</li>
          <li>At any time, if you have questions about what data we have about you, or need assistance with privacy matters, you can reach out to us (see Contact section below).</li>
          <li>For users in certain jurisdictions (see next section), you have specific legal rights regarding data which we also honor.</li>
        </ul>

        <h2>International Users and Legal Compliance</h2>
        <h3>GDPR (European Union Users)</h3>
        <p>
          If you are in the European Union (or in a jurisdiction with similar laws, such as the UK or EEA countries), you have rights under the General Data Protection Regulation ("GDPR") and similar regulations. These include the right to access personal data we hold about you, the right to request correction or deletion of your data, the right to withdraw consent (if we ever rely on consent), and the right to object to or restrict certain processing. OneWord is designed to be compliant with these principles:
        </p>
        <ul>
          <li>We minimize data collection (especially avoiding personal data unless you choose to provide it for an account).</li>
          <li>We obtain consent for any optional data uses (for example, if we ever send marketing emails, we would ask your permission).</li>
          <li>If you request deletion of your personal data, we will promptly erase your account and any identifying information, keeping only anonymized records as needed for our legitimate interests (like overall word counts).</li>
          <li>We will also fulfill any data access or correction requests you submit, within a reasonable time and as required by law (typically within 30 days for GDPR requirements).</li>
          <li>You can exercise your GDPR rights by contacting us with your request (see Contact section). We may need to verify your identity for security before fulfilling certain requests.</li>
        </ul>
        <h3>CCPA (California Users)</h3>
        <p>
          If you are a resident of California, the California Consumer Privacy Act ("CCPA") and its amendments provide you similar rights regarding your personal information. California users can request a report of what categories of personal info we have collected and for what purposes, ask us to delete any personal information, and opt-out of any "sale" of personal data (as defined by CCPA). As stated, OneWord does not sell personal data, and we only use your data to provide the Service or as otherwise described in these Terms/our Privacy Policy.
        </p>
        <p>
          California residents may exercise their rights by contacting us with your request. We will treat verified requests in accordance with CCPA. Also, under California's "Shine the Light" law, California users may request certain disclosures about any sharing of personal information with third parties for their direct marketing purposes; however, since we do not share data for direct marketing, this is not applicable.
        </p>
        <h3>Other Jurisdictions</h3>
        <p>
          We aim to respect privacy and data protection laws globally. If you are in another region (for example, Canada, Australia, etc.) that grants you particular data rights, we will similarly respect those. Our policy is to extend core privacy rights to all users regardless of location, to the extent reasonably feasible. For example, any user can ask to delete their data, not just EU or California users, and we will strive to honor it (again, with the caveat that truly anonymous data might not be traceable to delete, in which case it's effectively already private).
        </p>
        <h3>Data Transfers</h3>
        <p>
          If you are accessing OneWord from outside the United States, be aware that your data (to the minimal extent we have any on you) will be transferred to and processed in the United States (or wherever our servers and personnel are located, which currently is primarily the U.S.). The data protection laws in the U.S. may differ from those in your country, but we take steps to ensure appropriate protections are in place (such as using GDPR-compliant frameworks if applicable, and securing data as described above). By using the Service, you acknowledge this transfer and processing of your data.
        </p>
        <h3>Legal Use of the Service</h3>
        <p>
          Regardless of where you are, you agree to use OneWord in compliance with all applicable laws. You are responsible for not violating any export controls, sanctions, or local regulations through your use of the Service. (Though it’s hard to imagine one word causing an export law issue, this is a standard legal reminder.)
        </p>
        <p>
          If using OneWord would be illegal in your jurisdiction (for example, if any content-sharing service is banned or if you are not allowed to transmit certain types of content), then unfortunately you must not use the Service.
        </p>

        <h2>Intellectual Property Rights</h2>
        <h3>Our Intellectual Property</h3>
        <p>
          The OneWord name, logo, and all related graphics, design, compilation of user submissions, and software code that make up the Service ("OneWord Content") are owned by us or our licensors and are protected by intellectual property laws. We reserve all rights in and to our intellectual property. You may not use the OneWord name or logo in a way that confuses others as to our affiliation or endorsement of you or any product or service (for example, don't use our name in the title of your own app or service). You also may not reverse engineer, decompile, or attempt to extract the source code of our software, or create derivative works from our content, except to the extent that such actions are explicitly permitted by law.
        </p>
        <h3>Your Intellectual Property</h3>
        <p>
          Aside from the license you grant us to use your submitted word (as described in "Ownership of Your Content" above), you retain any intellectual property rights you have in the content you submit. Since a single word is typically not a protected work of authorship, this is mostly a formality — but if you believe your submission is creative or proprietary, nothing in these Terms transfers ownership of it to us. You simply give us the permissions outlined to use it for OneWord's operation.
        </p>
        <p>
          If you submit feedback, suggestions, or ideas about OneWord (for example, suggestions for new features or improvements), you acknowledge that we may use them without obligation to you. Specifically, you grant us a royalty-free, perpetual, irrevocable license to use and incorporate any feedback or ideas you provide in any manner, without any compensation or credit to you. This helps us avoid any disputes if we implement something similar to what you suggested.
        </p>

        <h2>Suspension and Termination</h2>
        <h3>Termination by You</h3>
        <p>
          You are free to stop using OneWord at any time. Since there are no account requirements for basic use, you can simply discontinue visiting the site or app. If you have created an account and wish to terminate it, you can likely do so via an account settings option (if available) or by contacting us to request deletion. Terminating your account will remove your personal profile and credentials; however, any words you submitted (as part of anonymized aggregates or public word history) may persist in a non-personally identifiable form as described earlier.
        </p>
        <h3>Termination or Suspension by Us</h3>
        <p>
          We reserve the right to suspend or terminate your access to the Service (or certain features of the Service) at any time, with or without notice, if we believe:
        </p>
        <ul>
          <li>You have violated any portion of these Terms (for example, you posted disallowed content or attempted to abuse the system).</li>
          <li>You are using OneWord in a way that could cause harm to other users, interfere with the Service, or expose us to risk or liability.</li>
          <li>We are required to do so to comply with a law or legal order (for instance, if a particular user’s activity is unlawful).</li>
          <li>You have been inactive for a long period (though typically we wouldn't terminate accounts just for inactivity, except perhaps to recycle usernames if that ever became an issue).</li>
          <li>Or for any other reason at our sole discretion. (We will generally only use this clause in extreme or unusual cases, as we want to encourage, not discourage, usage.)</li>
        </ul>
        <p>
          If we suspend/terminate your access and you believe it was a mistake, you may contact us to discuss the issue. In some cases we may reinstate access if the situation is resolved. However, OneWord has no obligation to retain any content relating to any user after termination (so your stored words or account data may be deleted as a result of your account being terminated).
        </p>
        <p>
          Certain provisions of these Terms by their nature should survive termination of your use. For example, the licenses you granted to us for your content, our disclaimers of warranties, limitations of liability, and dispute resolution terms will remain in effect even after your relationship with OneWord ends.
        </p>

        <h2>Disclaimers of Warranty</h2>
        <p>
          OneWord is a novel, evolving service and we strive to provide an enjoyable and reliable experience. However, there are some things we need to disclaim legally:
        </p>
        <p>
          <strong>Use “As-Is”:</strong> The Service is provided to you on an "as is" and "as available" basis, without warranties of any kind, either express or implied. This means we do not guarantee that OneWord will meet all your expectations or requirements, or that it will be uninterrupted, error-free, or secure. For example, we do not promise that:
        </p>
        <ul>
          <li>The service will always be available at any given moment or that any particular feature (like the daily word submission) will always function without error or downtime.</li>
          <li>The results of using the service (such as any insights you gain from looking at word trends or your personal analytics) will be accurate or suit your purposes perfectly.</li>
          <li>Submissions will never be lost or that data will be preserved indefinitely (though we do our best to maintain everything, unforeseen issues could occur).</li>
        </ul>
        <p>
          <strong>No Implied Warranties:</strong> To the fullest extent allowed by applicable law, we disclaim any and all implied warranties or conditions, including implied warranties of merchantability, fitness for a particular purpose, and non-infringement. OneWord is not a product specifically designed or licensed for any particular professional use (for example, it's not a medical or psychological service, so while sharing a word might be reflective or therapeutic, we make no professional health claims).
        </p>
        <p>
          <strong>User Responsibility:</strong> You understand and agree that your use of OneWord is at your own discretion and risk. You are solely responsible for any consequences of sharing your one-word entries (bearing in mind they might be seen or inferred by others in aggregated form). While we aim to cultivate a positive environment, we aren't responsible for the content that users submit and you might occasionally see a word that you find inappropriate or offensive (though we moderate as described, no system catches everything immediately). We do not endorse any particular user submission.
        </p>
        <p>
          Some jurisdictions do not allow the exclusion of certain warranties, so some of the above disclaimers may not fully apply to you. In such cases, our warranties are limited to the minimum extent permitted by applicable law.
        </p>

        <h2>Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, OneWord (and its creators, owners, employees, and affiliates) will not be liable for any indirect, incidental, special, consequential, or exemplary damages that result from or in connection with your use of (or inability to use) the Service. This includes, for example, damages for lost profits, loss of data, goodwill, or other intangible losses, even if we have been advised of the possibility of such damages.
        </p>
        <p><strong>In plain terms:</strong></p>
        <ul>
          <li>We are not liable if something goes wrong with OneWord and it causes you some harm or inconvenience. For instance, if the service goes down and you lose a streak that was important to you, or if someone sees an offensive word before it's removed, or if any third party gains unauthorized access to data despite our security measures, those outcomes (while unfortunate and not intended) are not things for which we can accept liability in a legal sense.</li>
          <li>We are not liable for user behaviors or content. If another user’s submission somehow causes you distress or other harm, we sympathize and will act to moderate if appropriate, but we are not legally responsible for actions of users on the platform.</li>
        </ul>
        <p>
          If for some reason we are found liable, despite the above, our total cumulative liability to you will be limited to the greater of: (a) the total amount you have paid us in the 6 months prior to the event giving rise to the liability (for most users this is $0, since the Service is free), or (b) US $50. This limitation applies to any and all claims, whether based on warranty, contract, statute, tort (including negligence), or any other legal theory.
        </p>
        <p>
          Some jurisdictions do not allow the exclusion or limitation of liability for incidental or consequential damages, so the above limitations may not apply fully to you. In those cases, our liability is limited to the smallest amount permitted by law.
        </p>

        <h2>Indemnification</h2>
        <p>
          You agree that, to the extent legally permitted, you will indemnify and hold harmless OneWord and its officers, agents, partners, and employees from any claim, demand, lawsuit, or proceeding (including reasonable attorneys' fees) made by any third party due to or arising out of:
        </p>
        <ul>
          <li>Your violation of these Terms or any applicable law or regulation.</li>
          <li>Your misuse of the Service or any content, or your submission of content that violates third-party rights or law (for example, if you submit a word that is someone’s trademark in a defamatory context and they sue, or you post someone’s private information and there’s a legal dispute, you would cover us for any costs or damages).</li>
          <li>Your breach of any agreements or policies referenced in these Terms.</li>
        </ul>
        <p>
          We reserve the right to assume the exclusive defense and control of any matter otherwise subject to indemnification by you (at your expense), and you agree to cooperate with our defense of such claim. You will not settle any claim that affects OneWord without our prior written approval.
        </p>

        <h2>Changes to the Service and Terms</h2>
        <p>
          OneWord is an evolving project. We may revise these Terms from time to time as we add new features, change our practices, or for other operational, legal, or regulatory reasons.
        </p>
        <p>
          <strong>Term Changes:</strong> If we make material changes to these Terms, we will provide notice to users in a manner appropriate to the significance of the changes. This might include posting a prominent notice on our website or app, or sending an email to account holders if applicable. The "Last updated" date at the top will always indicate when the latest modifications were made. By continuing to use OneWord after updated Terms are in effect, you agree to be bound by the revised Terms. If you do not agree with any update, you should stop using the Service.
        </p>
        <p>
          <strong>Service Changes:</strong> Similarly, OneWord's features and offerings will likely expand or change over time. We reserve the right to modify, suspend, or discontinue any part of the Service (or the entire Service) at any time. For example, we might change the way the one-word submission works, introduce a new daily prompt, add a social feed, or even shut down the service if necessary. We hope to always move forward in a positive way, but we must include the possibility. We are not liable to you or any third party for any modification, suspension, or discontinuation of the Service, though we will endeavor to give advance notice to the community if any major changes are planned.
        </p>
        <p>
          Please note that no oral or written feedback or information you provide to us will constitute a waiver of any term or enlarge any warranty beyond what is expressly stated in these Terms.
        </p>

        <h2>Governing Law and Jurisdiction</h2>
        <p>
          These Terms and any dispute arising out of or related to these Terms or the Service will be governed by the laws of the State of New York, USA, without regard to its conflict of laws principles. We chose New York law as our governing law because our team is based in New York City and the Service is (or will be) officially operated from there.
        </p>
        <p>
          If you are a consumer located outside the US, you might have certain mandatory rights under your local consumer protection law; nothing in this section is meant to override those rights. However, to the extent permitted, you agree that all disputes between you and OneWord will be subject to the exclusive jurisdiction of the state and federal courts located in New York, New York, USA. You and OneWord consent to the personal jurisdiction of these courts. (If you and we ever have a serious dispute, we hope to resolve it amicably, but if it goes to court, it will be in New York unless another venue is required by applicable law.)
        </p>
        <p>
          We also both agree to waive any right to a jury trial in any such litigation (to the extent enforceable in your jurisdiction) and to not participate in any class or representative action against each other. Any claim must be brought in each party's individual capacity, not as a plaintiff or class member in any purported class or representative proceeding.
        </p>
        <p>
          Note: This governing law and forum selection clause does not apply where prohibited. For example, if you are in a country that does not allow this choice of law or forum for consumer contracts, your country's law may apply and you might be able to file in your local courts.
        </p>

        <h2>Miscellaneous</h2>
        <p><strong>Entire Agreement:</strong> These Terms (along with any other policies or guidelines we provide, such as our Privacy Policy) constitute the entire agreement between you and OneWord regarding your use of the Service. They supersede any prior agreements or communications between you and us relating to the subject matter.</p>
        <p><strong>Severability:</strong> If any provision of these Terms is held by a court of competent jurisdiction to be invalid or unenforceable, then that provision will be deemed severable from the Terms and will not affect the validity and enforceability of the remaining provisions, which will remain in full force and effect.</p>
        <p><strong>No Waiver:</strong> Our failure to enforce any right or provision of these Terms will not be considered a waiver of that right or provision. Any waiver must be in writing and signed by an authorized representative of OneWord.</p>
        <p><strong>Assignment:</strong> You may not assign or transfer these Terms (or any rights or licenses granted under them) without our prior written consent. Any attempt to do so without consent is void. We may assign these Terms without restriction (for instance, to a successor in interest, such as if we undergo a merger, acquisition, or sale of assets, or to any affiliate or as part of a corporate reorganization).</p>
        <p><strong>Relationship:</strong> Nothing in these Terms creates any agency, partnership, joint venture, or employment relationship between you and OneWord. Both parties are independent.</p>
        <p><strong>Headings:</strong> Section headings in these Terms are for convenience only and have no legal or contractual effect.</p>
        <p><strong>Contact &amp; Notices:</strong> When you use OneWord or send communications to us through the Service, you are communicating with us electronically. You consent to receive communications from us electronically (such as emails or in-app notices). We will communicate with you via the Service, or the email associated with your account (if you have one), or by posting general notices on the site.</p>

        <h2>Contact Us</h2>
        <p>
          If you have any questions, concerns, or feedback about these Terms or the Service, or if you need to reach us for any reason (including to exercise any of your rights regarding data privacy or to report a problem user/content), please contact us.
        </p>
        <p>You can reach the OneWord team at:</p>
        <ul>
          <li><strong>Email:</strong> support@oneword.world (for general inquiries or support)</li>
          <li><strong>Privacy Contact:</strong> privacy@oneword.world (for privacy-specific questions or data requests)</li>
          <li><strong>Mailing Address:</strong> OneWord Co. (Attn: Legal) —  New York, NY, USA </li>
        </ul>
        <p>
          We are committed to listening to our users and doing our best to address your needs while keeping OneWord a simple, fun, and safe place to share a bit of yourself each day.
        </p>
        <p>
          Thank you for reading these Terms. By using OneWord, you’re part of a community focused on the beauty of simplicity—one day, one word at a time. We appreciate your trust and participation, and we hope you enjoy the Service!
        </p>
      </article>

      <SiteFooter />
    </div>
  );
}

