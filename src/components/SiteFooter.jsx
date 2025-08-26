import React from "react";
import { Link } from "react-router-dom";

export default function SiteFooter() {
  return (
    <footer
      className="footer container"
      style={{
        paddingTop: 16,
        paddingBottom: 24,
        position: "relative",
        zIndex: 5,
        background: "#fff",
      }}
    >
      <div>Anonymous • 1 word/day • No likes • No ads</div>
      {/* remove inline display:flex so CSS grid can take over */}
      <nav className="footer__nav" style={{ marginTop: 8 }}>
        <Link to="/why">Why One Word</Link>
        <Link to="/legal/terms">Terms</Link>
        <Link to="/legal/privacy">Privacy</Link>
        <Link to="/legal/data-use">Data Use</Link>
      </nav>
    </footer>
  );
}

