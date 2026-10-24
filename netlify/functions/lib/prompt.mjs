export const PALETTES = {
  dark:     { label: 'Dark',     desc: 'very dark background (near black), light cream text, subtle gold accents' },
  light:    { label: 'Light',    desc: 'clean white background, dark charcoal text, with warm accent colour' },
  purple:   { label: 'Purple',   desc: 'deep purple background (#2d0a4e), light text, lavender and gold accents' },
  emerald:  { label: 'Emerald',  desc: 'dark emerald green background (#064e3b), light text, bright green accents' },
  ocean:    { label: 'Ocean',    desc: 'deep navy blue background (#0c1a3a), light text, bright blue and cyan accents' },
  sunset:   { label: 'Sunset',   desc: 'dark warm background, light text, burnt orange and amber accent colours' },
  rose:     { label: 'Rose',     desc: 'dark background with rose pink and deep red accent colours' },
  gold:     { label: 'Gold',     desc: 'dark background with rich gold (#c9a84c) as the primary accent colour throughout' },
  slate:    { label: 'Slate',    desc: 'dark slate grey background (#0f172a), light text, cool blue-grey accents' },
  mint:     { label: 'Mint',     desc: 'dark background with fresh mint green and teal accent colours' },
};

/* ═══════════════════════════════════════════════════
   FONT STYLE DEFINITIONS
═══════════════════════════════════════════════════ */

export const FONT_STYLES = {
  modern:  'Use a clean modern sans-serif font. Use "Inter" or "DM Sans" from Google Fonts.',
  elegant: 'Use an elegant serif font for headings. Use "Playfair Display" from Google Fonts for headings and DM Sans for body.',
  bold:    'Use a bold condensed display font for headings. Use "Oswald" or "Bebas Neue" from Google Fonts. Make headlines large and impactful.',
  minimal: 'Use a minimal light-weight font. Use "Raleway" or "Nunito" from Google Fonts with generous spacing.',
};

/* ═══════════════════════════════════════════════════
   PAGE STYLE DEFINITIONS
═══════════════════════════════════════════════════ */

export const PAGE_STYLES = {
  professional: 'Professional and corporate — clean organised layout, structured sections, conservative colour use, confidence-building.',
  vibrant:      'Vibrant and energetic — bold colours, dynamic asymmetric layout, strong contrasts, eye-catching visuals.',
  luxury:       'Luxury and premium — refined generous spacing, editorial feel, subtle animations, high-end brand positioning.',
  playful:      'Playful and fun — rounded shapes, friendly warm colours, relaxed layout, approachable and inviting.',
};

export const ALLOWED_SECTIONS = [
  "Hero banner",
  "Navigation bar",
  "About us",
  "Services or products",
  "Pricing and rates",
  "Gallery or portfolio",
  "Testimonials",
  "Contact section with WhatsApp button",
  "Footer",
  "FAQ",
  "Team or staff profiles",
  "How it works steps",
  "Opening hours",
];

export function buildSystemPrompt(options) {
  const sections = options.sections.join(', ');
  const palette  = PALETTES[options.palette].desc;
  const font     = FONT_STYLES[options.font];
  const style    = PAGE_STYLES[options.style];

  return `You are an expert web designer specialising in stunning, professional landing pages for South African small businesses.

Generate a complete, self-contained landing page as a single HTML file with all CSS and JS embedded.

DESIGN REQUIREMENTS:
- Colour theme: ${palette}
- Typography: ${font}
- Design style: ${style}
- Required sections to include: ${sections}

TECHNICAL REQUIREMENTS:
- Return ONLY raw HTML starting with <!DOCTYPE html>. No markdown, no backticks, no commentary before or after.
- All CSS inside a <style> tag. All JS inside a <script> tag. No external JS libraries.
- One Google Font allowed via <link> tag.
- Fully mobile responsive. Mobile-first approach. Test every breakpoint.
- Sticky navigation bar if page has multiple sections.
- Smooth scroll behaviour.
- Subtle scroll-triggered animations (use IntersectionObserver).
- Hover effects on all interactive elements.

SOUTH AFRICAN CONTEXT:
- All prices in South African Rands (R). Never use $ or £.
- Phone numbers in South African format: 0XX XXX XXXX.
- If a phone number is mentioned, add a prominent WhatsApp button using: https://wa.me/27XXXXXXXXX (replace leading 0 with 27, remove spaces).
- Use South African English spelling (colour, centre, organise, etc).
- Footer copyright year: 2026.

QUALITY STANDARD — This is non-negotiable:
- Must look like it was designed by a professional studio charging R50,000+/month.
- Hero section: bold headline, compelling subheading, clear primary call-to-action button.
- Strong visual hierarchy throughout every section.
- Generous whitespace, consistent spacing system.
- Colour used intentionally — not randomly.
- Every section must feel intentional, polished and purposeful.
- Do NOT use Lorem Ipsum. Use realistic, relevant South African content based on the business described.`;
}
