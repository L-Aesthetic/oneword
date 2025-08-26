import React from "react";
import SiteFooter from "../components/SiteFooter.jsx";
import { Link } from "react-router-dom";

export default function WhyOneWordPage() {
  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 24 }}>
      <header className="row hdr-right-wrap" style={{ gap: 12, marginBottom: 24 }}>
        <div className="brand"><Link to="/">OneWord</Link></div>
      </header>

      <article className="document" style={{ maxWidth: 860, margin: "0 auto" }}>
        <h1>Why OneWord</h1>

        <p style={{ fontSize: 18 }}>
          Most social spaces ask for more: more content, more time, more performance. OneWord asks for less... just one word.
          Limiting the canvas lowers the pressure to perform and raises the signal. You don’t need the perfect sentence
          to tell the truth; one word is enough.
        </p>
        <p style={{ fontSize: 18 }}>
          When you share your word, it quietly joins millions of others to form a collective pulse. You’ll see themes
          emerge (hope, tired, calm, love), shifting through the day across cities and countries. It’s not a popularity
          contest. There are no follower counts to chase, no comments to fear. Just presence.
        </p>

        <h2 style={{ marginTop: 28 }}>How it works</h2>
        <ul>
          <li><strong>One word a day.</strong> Type a single word (max 64 characters).</li>
          <li><strong>Anonymous by default.</strong> We don’t ask for your name or email.</li>
          <li><strong>Optional location.</strong> If you allow location, your word is grouped into coarse regions (never precise pins).</li>
          <li><strong>Gentle guardrails.</strong> Profanity and abuse are blocked.</li>
          <li><strong>Live wall.</strong> New words appear in real time and softly merge into shared concepts (e.g., “happy” joins “joy”).</li>
          <li><strong>Private by design.</strong> We aggregate and anonymize what’s shown; no public lists of individuals.</li>
        </ul>

        <h2 style={{ marginTop: 28 }}>Why one word?</h2>
        <ul>
          <li><strong>Focus.</strong> A single word forces honesty over performance.</li>
          <li><strong>Universality.</strong> Words travel across languages like “esperanza,” “希望,” “hope” and still connect.</li>
          <li><strong>Ritual.</strong> Once per day sets a humane cadence; it’s a check-in, not a feed.</li>
          <li><strong>Belonging.</strong> Your word is small alone but meaningful together.</li>
        </ul>

        <h2 style={{ marginTop: 28 }}>What you’ll see</h2>
        <ul>
          <li>A <strong>live, moving wall</strong> of words that ebb and flow throughout the day.</li>
          <li><strong>Concept clusters</strong> (love/joy/hope/etc.) that reveal what’s rising.</li>
          <li>Optional <strong>views by country/region/local</strong> when there’s enough data to protect anonymity.</li>
          <li>A gentle, ad-free space with <strong>no likes, no comments, no scores</strong>.</li>
        </ul>

        <h2 style={{ marginTop: 28 }}>What we don’t do</h2>
        <ul>
          <li>No public profiles, follower graphs, or infinite scroll.</li>
          <li>No selling of personal data.</li>
          <li>No precise location display.</li>
          <li>No “engagement hacks.” We prefer calm to compulsive.</li>
        </ul>

        <h2 style={{ marginTop: 28 }}>Privacy &amp; data use (plain language)</h2>
        <ul>
          <li>We store your word, timestamp, and coarse region if you share location.</li>
          <li>We may apply light sentiment labels (e.g., joy/hope/anger) to organize the wall.</li>
          <li>What we show is aggregated and anonymized; we don’t reveal who submitted what.</li>
          <li>We may publish aggregated, anonymized insights (e.g., “Hope rose in Europe this week”).</li>
          <li>If you want a submission removed, email us with your approximate time + region so we can find it.</li>
        </ul>

        <h2 style={{ marginTop: 28 }}>Who it’s for</h2>
        <ul>
          <li>Individuals who want a quick, honest check-in without noise.</li>
          <li>Communities &amp; teams curious about shared mood without surveillance.</li>
          <li>Researchers &amp; journalists looking for ethical, anonymized signals of public sentiment.</li>
        </ul>

        <h2 style={{ marginTop: 28 }}>Our promises</h2>
        <ul>
          <li><strong>Human-first.</strong> We optimize for care, not clicks.</li>
          <li><strong>Simple.</strong> One word. One time a day.</li>
          <li><strong>Transparent.</strong> Clear, readable policies.</li>
          <li><strong>Privacy-minded.</strong> Defaults to anonymous; location is optional and coarse.</li>
          <li><strong>Global.</strong> Multilingual by design; words are merged into shared concepts.</li>
        </ul>

        <h2 style={{ marginTop: 28 }}>Join us</h2>
        <p>Share your word. Come back tomorrow. Watch the world breathe.</p>

        <p style={{ marginTop: 24 }}>
          <Link to="/">Back to the wall</Link>
        </p>
      </article>

      <SiteFooter />
    </div>
  );
}


