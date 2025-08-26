import React from "react";
import SiteFooter from "../components/SiteFooter.jsx";
import { Link } from "react-router-dom";

const LAST_UPDATED = "August 25, 2025";

export default function DataUsePage() {
  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 24 }}>
      <header className="row hdr-right-wrap" style={{ gap: 12, marginBottom: 24 }}>
        <div className="brand"><Link to="/">OneWord</Link></div>
      </header>

      <article className="document" style={{ maxWidth: 860, margin: "0 auto" }}>
        <h1>Data Use</h1>
        <p><em>Last updated: {LAST_UPDATED}</em></p>

        <h2>Summary</h2>
        <p>
          We collect one word per user per day (along with basic metadata) 
          as a way to gauge global mood trends. This minimal data collection is 
          by design – it allows us to produce insights on collective emotions while minimizing 
          personal information. Privacy is a top priority. We utilize k-anonymity principles and 
          pseudonymization techniques to protect individual contributors. In practice, each person’s 
          daily word is grouped into aggregated “bins” with at least k other entries, so no single user’s 
          word can be isolated. We also hash IP addresses and never store them in raw form. 
          Hashing means converting the IP into an irreversible random-looking string, which helps us count 
          unique submissions without retaining actual IP data. These measures ensure that individual 
          contributions remain anonymous within the overall dataset, and no one can trace a word back to you.
        </p>

        <h2>What we publish</h2>
        <p>
          <strong>Aggregated counts and trends:</strong> We share high-level statistics that combine many users’ inputs. 
          For example, we might show “Top emotions by region this week” or a graph of mood trends over time. 
          These aggregated insights never single out individuals – they only reflect broad groups. 
          By combining data from many people, we can highlight patterns (like a spike in stress-related words worldwide) 
          while preserving anonymity. No personal details are included in these public trends.
        </p>
        <p>
          <strong>Anonymized examples:</strong> To help illustrate insights, we may occasionally show sample words or entries, 
          but only in an anonymized way. For instance, we might mention that “One user from Canada described feeling ‘optimistic’ 
          on Monday” to give context to a trend. These examples are carefully stripped of any identifying info 
          (no names, exact locations, etc.) and are chosen from large pools of similar entries. 
          They are used solely to explain concepts and cannot be traced back to any specific person.
        </p>

        <h2>What we do not publish</h2>
        <p>
          <strong>Raw IP addresses or precise locations:</strong> We never disclose anyone’s network or exact location data. 
          In fact, we don’t even keep raw IPs in our systems – they’re only used in hashed form internally and are never shown 
          publicly. Similarly, if you share your location, we won’t publish your exact city or coordinates. All location data is 
          generalized (more on that below) to protect your privacy.
        </p>
        <p>
          <strong>Personally Identifiable Information (PII):</strong> Our platform does not collect sensitive personal identifiers 
          like names, emails, phone numbers, or IDs along with your word. Naturally, we do not publish any PII. 
          The one-word submissions are meant to be anonymous reflections of mood, not tied to your personal identity. 
          We are careful that nothing we release can be linked back to an individual’s identity.
        </p>
        <p>
          <strong>Small-sample details (no low-count slices):</strong> We avoid sharing any statistic so narrow that it’s 
          based on only a few people. If a data slice (e.g. a specific region or demographic) has too few contributors, 
          we either combine it with a larger group or omit it from public stats. This is to uphold k-anonymity – ensuring each 
          published data point represents at least a minimum number of users. For example, we wouldn’t 
          publish “the top mood word in a particular small town” if only 3 people from there participated that week, 
          because such a small sample could potentially reveal or guess who those individuals are. 
          By enforcing a minimum group size (often 5 users or more) for any reported statistic, we make sure no one can 
          be singled out from the data.
        </p>

        <h2>Location &amp; geography</h2>
        <p>
          We understand location can provide interesting context for mood trends (e.g. regional patterns), 
          but we handle it in a privacy-safe way. If you choose to allow location access, we immediately transform your 
          precise location into a coarse geocode. Specifically, we use a shortened Geohash or broad regional code – this 
          essentially maps your coordinates to a big square area on the map (for instance, ~hundreds of kilometers across) 
          rather than an exact point. Using a coarse geohash means your exact latitude/longitude or address is never stored; 
          instead, we only keep an approximate region that many people share. This technique “hides the exact location 
          coordinates… in a spatial region,” so all locations within that area look the same.
        </p>
        <p>
          When showing geographic trends, we further apply group-size thresholds. We only display location-based data for 
          areas where we have a sufficiently large number of users. For example, we might show mood trends by country or by 
          a large state/province, but only if that country or region has a lot of entries (meeting our k-anonymity cutoff). 
          We will not spotlight tiny areas with just a handful of users, to avoid pinpointing anyone. In summary, any location 
          information we use is both coarse (not pinpoint) and aggregated among many people, ensuring your privacy is maintained 
          even when exploring geographic insights.
        </p>

        <h2>AI processing</h2>
        <p>
          To make sense of the one-word inputs across different languages and expressions, we utilize AI processing in our 
          pipeline. This includes automatic translation and emotion tagging. For example, if you submit a word in Spanish or 
          Chinese, our system may translate it into English (or a common language) so that we can combine it with similar words 
          from other languages. Similarly, if you input a word like “joyful”, an AI model might tag it with an “emotion” 
          category (e.g. Happy family) so that we can group it with related words (cheerful, content, etc.). The goal 
          is to merge multilingual and synonymous inputs into unified trends, ensuring that we’re comparing apples to apples.
        </p>
        <p>
          However, we recognize that AI isn’t perfect. Automated translations and sentiment analyses can sometimes 
          misinterpret context or nuance. Even state-of-the-art AI can produce awkward or incorrect outputs – 
          for instance, translating idioms word-for-word, or mislabeling a positive word as negative. That’s why we monitor 
          and validate the AI-generated results. We have systems and human oversight in place to review the AI’s performance 
          and correct obvious mistakes. If the AI suggests a wrong emotion tag or a poor translation, we adjust it to maintain 
          accuracy. All AI outputs are used as assistive tools, not final truth: they help speed up our processing of many words, 
          but the final aggregated data is reviewed for quality. We continuously refine our models (and their training data) 
          and keep an eye on the outputs, so that the trends we publish are as accurate and meaningful as possible. In short, 
          AI helps us scale our multilingual mood analysis, but humans remain in the loop to ensure the insights make sense.
        </p>

        <h2>Retention</h2>
        <p>
          How long do we keep your one-word submissions? We retain the historical data over time in order to provide 
          longitudinal trends and insights. Part of the value of OneWord is seeing how the global mood shifts over weeks, 
          months, or years – so we do not routinely purge the daily words after a short period. Your contributions become 
          part of an ever-growing, aggregated timeline of emotional data. Importantly, this data remains aggregate-only 
          (just counts of words/emotions per day or region, etc.) with privacy safeguards as described above.
        </p>
        <p>
          That said, we respect user rights and privacy regulations. If you ever want your data removed, you can request 
          deletion at any time. Simply contact us at <a href="mailto:privacy@oneword.world">privacy@oneword.world</a> with a 
          deletion request. We will then locate and erase your past submissions from our records. This process honors 
          the principle of the “right to erasure” (right to be forgotten) provided in laws like GDPR. We will delete your data 
          entirely from our active databases upon request. (Keep in mind that since our data is highly aggregated, 
          removing one person’s word won’t noticeably affect the published trends – which is by design for privacy.) 
          We do not offer a self-serve deletion button yet, so please reach out via email and we’ll handle it promptly 
          and confidentially. Other than fulfilling legitimate deletion requests, we generally keep the data indefinitely 
          (again, in anonymized form) to allow for year-over-year comparisons and long-term insights. We also implement 
          standard security measures to safeguard the stored data. Overall, our retention policy balances the benefit of 
          long-term trends with an individual’s control over their data.
        </p>

        <h2>Licensing</h2>
        <p>
          On occasion, we may share or license out portions of our dataset – for example, to academic researchers 
          studying global mood, or organizations interested in emotional trend analysis. Any such data sharing is 
          done with extreme care for privacy. We only license aggregated and anonymized datasets. This means the 
          data contains statistics like counts, trends, or summary metrics, and no personal identifiers or raw submissions. 
          Before any dataset leaves our system, we ensure it meets strict de-identification standards 
          (removing anything that could reasonably identify a person).
        </p>
        <p>
          Furthermore, we place binding conditions on data usage through our licensing agreements. All licenses or data use 
          agreements explicitly prohibit any attempt to re-identify individuals in the data. This is aligned with best practices 
          and legal definitions of de-identified data, which require technical and organizational safeguards to prevent 
          re-identification. For example, our agreements require that the recipient of the data will not combine 
          it with other information to try to single out individuals, and will not share it onward except under the same 
          privacy-preserving terms. We also require that any public findings or visualizations derived from the data must 
          respect the same aggregation thresholds we use (to avoid inadvertently exposing small-group information). 
          In short, we might allow others to use the insights from our collection, but never at the expense of user privacy. 
          Every external use is governed by strong privacy rules, and any licensee who violates them 
          (e.g. attempts re-identification) would be in breach of contract and face termination of access 
          (and possibly legal action). By enforcing these conditions, we enable beneficial research and applications 
          using the data without compromising the anonymity of the people behind the data. Our commitment is that your 
          one-word contributions will only ever be used in anonymized, aggregated form, whether by us or anyone we collaborate 
          with, and absolutely no one is permitted to try to uncover individual identities from the dataset.
        </p>
      </article>

      <SiteFooter />
    </div>
  );
}
