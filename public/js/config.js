/* ═══════════════════════════════════════════════════
   AGENT BKS97 — config.js
   Central configuration file.
   Front-end settings only. No keys live in this project.
═══════════════════════════════════════════════════ */

const CONFIG = {

  /* ── SERVER ENDPOINTS ──────────────────────────
     No keys or model settings live in the browser.
     The Netlify functions hold them as environment
     variables on the server.
  ─────────────────────────────────────────────── */
  GENERATE_URL: '/.netlify/functions/generate-background',
  STATUS_URL: '/.netlify/functions/status',
  POLL_INTERVAL_MS: 3000,
  POLL_TIMEOUT_MS: 360000,

  /* ── APP INFO ──────────────────────────────── */
  APP_NAME: 'Agent BKS97',
  APP_VERSION: '1.0.0',
  BUILDER_URL: 'builder.html',
  HOME_URL: 'index.html',

};

/* ═══════════════════════════════════════════════════
   QUICK-START TEMPLATES
   Pre-written prompts for common South African
   business types. Used on both pages.
═══════════════════════════════════════════════════ */

const TEMPLATES = {
  hair: `A landing page for my hair salon called Naledi's Hair Studio in Soweto, Johannesburg. We specialise in box braids, weaves, locs, relaxers and natural hair care treatments. Our brand colours are deep purple (#3b0764) and warm gold (#c9a84c). Include: a hero section with a strong tagline, services with prices (box braids R450, full weave R600, locs from R800, relaxer R300, silk press R280), about us with a warm personal story, and a contact section with a WhatsApp button for 0712345678. Make it look luxury and premium.`,

  restaurant: `A landing page for a township restaurant called Kasi Flavours in Alexandra, Johannesburg. We serve traditional South African food — pap en vleis, mogodu, chakalaka, braai specials, umqombothi and ting. Open Tuesday to Sunday 11am to 9pm. Brand colours are warm orange (#ea580c) and dark earthy brown (#1c0a00). Sections: hero with an appetite-inducing tagline, featured dishes with prices (mogodu R85, braai plate R120, pap en vleis R75), about our story, opening hours and address, and a WhatsApp order button for 0823456789.`,

  tutoring: `A landing page for a tutoring service called Pass With Distinction based in Pretoria, Gauteng. We offer Grade 10 to 12 tutoring in Mathematics, Physical Science, Accounting and English. R150 per hour per subject, both online and in-person sessions available. Brand colours are deep navy blue (#1e3a8a) and bright yellow (#fbbf24). Sections: powerful hero, subjects and pricing table, 3-step how it works, parent and student testimonials, and a booking enquiry contact form.`,

  spaza: `A landing page for a spaza shop and grocery delivery service called Quick Corner in Tembisa, Ekurhuleni. We deliver groceries, airtime, electricity tokens, and household essentials within 5km. Open 7 days a week, 7am to 10pm. Minimum order R50, delivery fee R20. Brand colours are bold red (#dc2626) and white (#ffffff). Sections: hero, what we stock (groceries, snacks, drinks, airtime, electricity), delivery zones and fees, and a WhatsApp order button for 0734567890.`,

  construction: `A landing page for a construction and renovations company called Basadi Builders in Polokwane, Limpopo. We specialise in home renovations, tiling, painting, plumbing, paving and new residential builds. We serve Limpopo and surrounding provinces. Brand colours are dark charcoal (#111827) and bright orange (#f97316). Sections: strong hero with a bold tagline, services offered with descriptions, why choose us (3 compelling reasons), a project gallery placeholder with 6 image boxes, and a quote request contact form.`,

  cleaning: `A landing page for a professional cleaning company called SparkleClean based in Cape Town, Western Cape. We offer domestic home cleaning, commercial office cleaning, post-construction cleaning and Airbnb turnaround cleaning. Rates from R200 per cleaner per hour. Brand colours are sky blue (#0ea5e9) and crisp white (#ffffff). Sections: hero, service types with descriptions and starting prices, 3-step booking process, client testimonials, and a contact/booking form.`,

  gym: `A landing page for a community gym called Iron Tribe Fitness in Durban, KwaZulu-Natal. We offer gym membership, personal training, group fitness classes (yoga, HIIT, boxing) and nutritional guidance. Monthly membership from R250. Brand colours are deep black (#0a0a0a) and electric yellow (#eab308). Sections: powerful hero with an energy-filled tagline, membership tiers and pricing, class schedule overview, trainer profiles with names and specialties, and a sign-up form.`,

  mechanic: `A landing page for an auto repair workshop called Rapid Mechanics in Germiston, Ekurhuleni, Gauteng. We do engine diagnostics and repairs, tyre fitting and balancing, brake repairs, full vehicle services, roadworthy testing and exhaust repairs. Open Monday to Saturday 7am to 5pm. Brand colours are dark grey (#1f2937) and red (#ef4444). Sections: strong hero, services list with prices, why choose us, opening hours, and contact with a WhatsApp button for 0765432100.`,

  beauty: `A landing page for a beauty and nail salon called Glam Studio in Sandton, Johannesburg. We offer gel nails, nail art, lash extensions, waxing, eyebrow shaping and facials. Brand colours are blush pink (#f9a8d4) and rose gold (#c9a84c). Sections: elegant hero, services menu with prices (gel nails R350, lash extensions R450, facial R380), about us, gallery placeholder, and a WhatsApp booking button for 0823456789.`,

  nonprofit: `A landing page for a nonprofit organisation called Ubuntu Youth Foundation in Cape Town. We provide after-school tutoring, meals and mentorship for underprivileged youth aged 8 to 18 in Khayelitsha. We are SARS registered and donor-funded. Brand colours are warm gold (#c9a84c) and dark green (#14532d). Sections: emotional hero with a mission statement, our impact statistics (350 learners, 5 schools, 8 years), what we do, how to donate or volunteer, and a contact form.`,
};

