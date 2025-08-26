import React, { Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import './styles.css'

// robust page imports: works with default OR named exports
import * as WhyMod from './pages/WhyOneWordPage.jsx'
import * as TermsMod from './pages/TermsPage.jsx'
import * as PrivacyMod from './pages/PrivacyPage.jsx'
import * as DataUseMod from './pages/DataUsePage.jsx'

// pick whichever export exists
const WhyOneWordPage = WhyMod.default || WhyMod.WhyOneWordPage
const TermsPage      = TermsMod.default || TermsMod.TermsPage
const PrivacyPage    = PrivacyMod.default || PrivacyMod.PrivacyPage
const DataUsePage    = DataUseMod.default || DataUseMod.DataUsePage

// tiny fallback while pages load (even though these are static imports)
const Fallback = () => <div style={{padding:16}}>Loading…</div>

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Suspense fallback={<Fallback />}>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/why" element={<WhyOneWordPage />} />

        {/* canonical short paths */}
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/data" element={<DataUsePage />} />

        {/* aliases to match footer links */}
        <Route path="/legal/terms" element={<TermsPage />} />
        <Route path="/legal/privacy" element={<PrivacyPage />} />
        <Route path="/legal/data-use" element={<DataUsePage />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
)


