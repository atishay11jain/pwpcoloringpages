/**
 * Paint With Purpose — Static Pages Content
 *
 * Single source of truth for all static page content.
 * Used by: /about, /contact, /newsletter, /privacy-policy, /terms-of-use
 *
 * Brand tokens (for reference):
 *   Primary Pink    → #ea1974
 *   Primary Purple  → #bc25c4
 *   Primary Cyan    → #58b7da
 *   Dark BG         → #111118
 *   Font Heading    → Fredoka
 *   Font Body       → DM Sans
 *   Contact Email   → hello@pwpcoloringpages.com
 *   Domain          → pwpcoloringpages.com
 */

// ─────────────────────────────────────────────────────────────
// SHARED
// ─────────────────────────────────────────────────────────────

export const BRAND = {
  name: "Paint With Purpose",
  domain: "pwpcoloringpages.com",
  email: "paintwithpurpose111@gmail.com",
  url: "https://pwpcoloringpages.com",
  logo: "https://pwpcoloringpages.com/logo.png",
} as const;

export const LEGAL_DATES = {
  effectiveDate: "April 1, 2025",
  lastUpdated: "April 1, 2025",
} as const;

// ─────────────────────────────────────────────────────────────
// PAGE 1 — ABOUT
// ─────────────────────────────────────────────────────────────

export const ABOUT_PAGE = {
  meta: {
    title: "About Us | Paint With Purpose",
    description:
      "Learn about Paint With Purpose — 500+ free printable coloring pages for kids, teens, and adults. Our mission: make creative play free and accessible for everyone.",
    slug: "/about",
  },

  hero: {
    eyebrow: "Our Story",
    headline: {
      line1: "Free Printable Coloring Pages,",
      line2: "Built With Purpose & Love",
    },
    subheadline:
      "We believe that picking up a crayon — at any age — is an act of joy. Paint With Purpose exists to make that moment free, frictionless, and beautiful for everyone.",
  },

  mission: {
    heading: "Why We Built This",
    body: [
      "Coloring is one of the oldest forms of creative expression. It calms the mind, develops fine motor skills in children, reduces stress in adults, and sparks imagination at every stage of life.",
      "But the best coloring pages were scattered across the internet, buried behind paywalls, low-resolution downloads, or ad-heavy websites that made the experience frustrating.",
      "We built Paint With Purpose to fix that.",
      "Every page on this site is free. Every download is a clean, print-ready PDF. No subscriptions, no hidden fees, no accounts required. Just art — ready when you are.",
    ],
  },

  offerings: {
    heading: "What You'll Find Here",
    cards: [
      {
        iconHint: "palette",
        title: "500+ Free Printable Coloring Pages",
        body: "Printable PDFs across 11+ categories — animals, nature, holidays, characters, mandalas, and more. New free pages added every week.",
      },
      {
        iconHint: "users",
        title: "For Every Age Group",
        body: "Free coloring pages for toddlers (simple shapes), easy coloring pages for kids (fun characters), detailed designs for teens, and intricate coloring pages for adults — PDF-ready for every skill level.",
      },
      {
        iconHint: "book",
        title: "Curated Coloring Books",
        body: "Love what you color? We hand-pick the best physical and digital coloring books and link directly to them on Amazon — so you can take your hobby further.",
      },
    ],
  },

  values: {
    heading: "What We Stand For",
    items: [
      {
        title: "Always Free",
        body: "Every coloring page on this site is free to download and print. That's not a promotion — it's a permanent promise. We will never lock a coloring page behind a paywall.",
      },
      {
        title: "Quality Over Quantity",
        body: "We don't upload filler. Every page is reviewed for print quality, line clarity, and creative value. If it doesn't meet our standards, it doesn't go live.",
      },
      {
        title: "Safe for Families",
        body: "All content on Paint With Purpose is appropriate for children. Parents can browse and download with full confidence — no surprises, no inappropriate imagery.",
      },
      {
        title: "Honest Affiliate Links",
        body: "We recommend coloring books because we genuinely love them. When you buy through our Amazon links, we earn a small commission at no extra cost to you. This keeps the site running and the pages free.",
      },
    ],
  },

  audience: {
    heading: "Made for Everyone Who Colors",
    intro: "Paint With Purpose was built with a wide audience in mind:",
    groups: [
      "Parents looking for screen-free activities for their kids on a weekend afternoon",
      "Teachers and educators who need printable art materials without a budget",
      "Therapists and caregivers using coloring as a mindfulness or fine motor tool",
      "Teens who want expressive, detailed designs that go beyond kiddie coloring",
      "Adults rediscovering the meditative power of pen on paper",
    ],
    closing: "If you color, this site is for you.",
  },

  cta: {
    heading: "Start Coloring Today",
    body: "Browse our full library of free printable coloring pages — no sign-up required.",
    primaryButton: {
      label: "Browse Free Coloring Pages",
      href: "/free-coloring-pages",
    },
    secondaryButton: {
      label: "Get Weekly Pages by Email",
      href: "/newsletter",
    },
  },
} as const;

// ─────────────────────────────────────────────────────────────
// PAGE 2 — CONTACT
// ─────────────────────────────────────────────────────────────

export const CONTACT_PAGE = {
  meta: {
    title: "Contact Us | Paint With Purpose",
    description:
      "Get in touch with the Paint With Purpose team. We'd love to hear from you — whether it's a question, a suggestion, or a coloring page request.",
    slug: "/contact",
  },

  hero: {
    eyebrow: "Get In Touch",
    headline: "We'd Love to Hear From You",
    subheadline:
      "Questions, suggestions, page requests, or just want to say hi? Drop us a message and we'll get back to you within 2 business days.",
  },

  form: {
    heading: "Send Us a Message",
    fields: [
      {
        id: "fullName",
        label: "Full Name",
        type: "text" as const,
        placeholder: "Your name",
        required: true,
        validation: { minLength: 2 },
      },
      {
        id: "email",
        label: "Email Address",
        type: "email" as const,
        placeholder: "your@email.com",
        required: true,
        validation: { format: "email" },
      },
      {
        id: "subject",
        label: "Subject",
        type: "select" as const,
        placeholder: "What's this about?",
        required: true,
        options: [
          { value: "general", label: "General Question" },
          { value: "page-request", label: "Coloring Page Request" },
          { value: "broken-download", label: "Report a Broken Download" },
          { value: "content-issue", label: "Content Issue or Concern" },
          { value: "partnership", label: "Partnership or Collaboration" },
          { value: "press", label: "Press Inquiry" },
          { value: "other", label: "Other" },
        ],
      },
      {
        id: "message",
        label: "Message",
        type: "textarea" as const,
        placeholder: "Tell us more...",
        required: true,
        rows: 5,
        validation: { minLength: 20, maxLength: 1000 },
      },
    ],
    submitLabel: "Send Message",
    successMessage: {
      title: "Thanks for reaching out!",
      body: "Your message has been received. We'll reply within 2 business days.",
      actionLabel: "Back to Home",
      actionHref: "/",
    },
    errorMessage: `Something went wrong. Please try again or email us directly at ${BRAND.email}`,
  },

  contactDetails: {
    heading: "Other Ways to Reach Us",
    email: BRAND.email,
    responseTime: "We respond within 2 business days",
    note: "We're a small team, but we read every message personally. Please allow up to 2 business days for a reply — we'll get back to you.",
  },

  faqs: {
    heading: "Common Questions",
    items: [
      {
        question: "Can I request a specific coloring page theme?",
        answer:
          "Absolutely. Use the form above and select \"Coloring Page Request\" as the subject. We take requests seriously — many of our most popular pages started as user suggestions.",
      },
      {
        question: "I downloaded a page but the PDF won't open. What do I do?",
        answer:
          "Try downloading it again in a different browser, or use Adobe Acrobat Reader (free) to open the file. If the issue persists, contact us with the page name and we'll send it to you directly.",
      },
      {
        question:
          "Can I use your coloring pages in my classroom or therapy practice?",
        answer:
          "Yes — all pages are free to print and use in personal, educational, and therapeutic settings. Please do not resell or redistribute the files digitally.",
      },
      {
        question:
          "Are you open to partnerships or content collaborations?",
        answer:
          "Yes. If you're an author, illustrator, educator, or brand aligned with our mission, we'd love to connect. Select \"Partnership or Collaboration\" in the contact form.",
      },
    ],
  },
} as const;

// ─────────────────────────────────────────────────────────────
// PAGE 3 — NEWSLETTER
// ─────────────────────────────────────────────────────────────

export const NEWSLETTER_PAGE = {
  meta: {
    title: "Free Coloring Pages Newsletter | Paint With Purpose",
    description:
      "Get free printable coloring pages in your inbox every week. Join the Paint With Purpose newsletter — new PDF coloring sheets every Tuesday. Free forever. No spam.",
    slug: "/newsletter",
  },

  hero: {
    eyebrow: "Free Weekly Printables",
    headline: {
      line1: "Get Free Printable Coloring Pages",
      line2: "Delivered Every Week",
    },
    subheadline:
      "Join thousands of parents, teachers, and coloring enthusiasts who get brand-new printable PDFs in their inbox every Tuesday — completely free, forever.",
  },

  form: {
    heading: "Join the Community",
    fields: [
      {
        id: "firstName",
        label: "First Name",
        type: "text" as const,
        placeholder: "Your first name",
        required: true,
      },
      {
        id: "email",
        label: "Email Address",
        type: "email" as const,
        placeholder: "your@email.com",
        required: true,
      },
    ],
    submitLabel: "Subscribe Free — It's 100% Free",
    finePrint: "No spam. No paid upsells. Unsubscribe anytime in one click.",
  },

  benefits: {
    heading: "What You'll Get Every Week",
    cards: [
      {
        iconHint: "paintbrush",
        title: "New Pages Every Tuesday",
        body: "A handpicked set of 3–5 brand-new coloring pages, delivered straight to your inbox before the weekend.",
      },
      {
        iconHint: "calendar",
        title: "Holiday & Seasonal Specials",
        body: "Exclusive themed drops for holidays, seasons, and special occasions — Halloween, Christmas, Spring, Back to School, and more.",
      },
      {
        iconHint: "sparkle",
        title: "First Access to New Collections",
        body: "Subscribers hear about new category launches and featured pages before anyone else.",
      },
    ],
  },

  socialProof: {
    heading: "You're in Good Company",
    stats: [
      { value: "10,000+", label: "Subscribers and growing" },
      { value: "Every Tuesday", label: "Consistent, reliable delivery" },
      { value: "0 spam emails", label: "Ever. We mean it." },
    ],
    testimonials: [
      {
        quote:
          "My kids wait for Tuesday now because of this newsletter. It's become part of our weekly routine.",
        author: "Sarah M.",
        role: "Parent of two",
      },
      {
        quote:
          "As a kindergarten teacher, this is my go-to for printable art. New pages every week means I never run out of ideas.",
        author: "Mrs. Peterson",
        role: "Elementary Art Teacher",
      },
      {
        quote:
          "I'm an adult who loves coloring for stress relief. The mandala drops are stunning. Worth every bit of the (zero) cost.",
        author: "James K.",
        role: "Subscriber since 2024",
      },
    ],
  },

  howItWorks: {
    heading: "Here's How It Works",
    steps: [
      "Enter your first name and email above",
      "Check your inbox for a confirmation email",
      "Confirm your subscription with one click",
      "Every Tuesday, open your free coloring pages and print",
    ],
  },

  promise: {
    heading: "Our Promise to You",
    items: [
      "We will never sell or share your email address with anyone — ever.",
      "Every email will contain genuine value: actual printable coloring pages.",
      "There are no paid tiers, premium upgrades, or upsells hiding behind the subscribe button.",
      "You can unsubscribe instantly at any time using the link at the bottom of any email.",
    ],
    closing:
      "This newsletter exists because we love coloring — not because we're trying to sell you something.",
  },

  bottomCta: {
    heading: "Ready to Start?",
    body: "Your first free coloring pages are one click away.",
    buttonLabel: "Subscribe Free",
  },
} as const;

// ─────────────────────────────────────────────────────────────
// PAGE 4 — PRIVACY POLICY
// ─────────────────────────────────────────────────────────────

export const PRIVACY_POLICY_PAGE = {
  meta: {
    title: "Privacy Policy | Paint With Purpose",
    description:
      "Read the Paint With Purpose Privacy Policy to understand how we collect, use, and protect your personal information.",
    slug: "/privacy-policy",
  },

  header: {
    heading: "Privacy Policy",
    effectiveDate: LEGAL_DATES.effectiveDate,
    lastUpdated: LEGAL_DATES.lastUpdated,
    intro: `Paint With Purpose ("we," "us," or "our") operates the website pwpcoloringpages.com (the "Site"). This Privacy Policy explains what information we collect, how we use it, and what rights you have regarding your personal data.\n\nWe are committed to protecting your privacy. Please read this policy carefully. By using the Site, you agree to the practices described below.`,
  },

  sections: [
    {
      id: "information-we-collect",
      heading: "1. Information We Collect",
      subsections: [
        {
          id: "voluntary-information",
          heading: "1.1 Information You Provide Voluntarily",
          body: "We collect personal information only when you choose to provide it. This includes:\n\n— Email address and first name when you subscribe to our newsletter\n— Name, email address, and message content when you contact us via the contact form\n— Email address when you use the newsletter signup form embedded on any page of the Site",
        },
        {
          id: "automatic-information",
          heading: "1.2 Information Collected Automatically",
          body: "When you visit the Site, certain information is collected automatically through standard web technologies:\n\n— Browser type and version\n— Operating system\n— IP address (anonymized where possible)\n— Pages visited and time spent on each page\n— Referring website or search query\n— Device type (desktop, tablet, mobile)\n\nThis data is collected through cookies and similar tracking technologies to help us understand how visitors use the Site and to improve your experience.",
        },
        {
          id: "not-collected",
          heading: "1.3 Information We Do Not Collect",
          body: "We do not collect:\n\n— Payment or financial information (we have no paid products)\n— Government-issued identification\n— Sensitive personal data such as health or location data\n— Personal data from children under 13 without verifiable parental consent",
        },
      ],
    },
    {
      id: "how-we-use",
      heading: "2. How We Use Your Information",
      body: "We use the information we collect for the following purposes:\n\n— To send you our weekly newsletter of free coloring pages (only if you subscribed)\n— To respond to your messages and inquiries submitted via the contact form\n— To analyze Site traffic and improve our content and user experience\n— To detect and prevent fraudulent or abusive activity\n— To comply with legal obligations\n\nWe will never use your personal information for purposes other than those listed above without your explicit consent.",
    },
    {
      id: "newsletter",
      heading: "3. Email Newsletter",
      body: "When you subscribe to our newsletter, we collect your email address and, optionally, your first name. This information is used solely to send you our weekly coloring page newsletter.\n\nWe use a third-party email service provider to manage our mailing list and send emails. Your data is stored securely within that provider's systems and is never shared with unaffiliated third parties.\n\nYou may unsubscribe from the newsletter at any time by clicking the \"Unsubscribe\" link at the bottom of any email we send. Upon unsubscribing, your email address will be removed from our active mailing list promptly.",
    },
    {
      id: "cookies",
      heading: "4. Cookies and Tracking Technologies",
      body: "We use cookies and similar technologies to operate and improve the Site. Cookies are small text files stored on your device by your browser.\n\nTypes of cookies we use:\n\nEssential Cookies: Required for the Site to function correctly. These cannot be disabled.\n\nAnalytics Cookies: Help us understand how visitors interact with the Site (e.g., which pages are most popular, how long visitors stay). We use anonymized data only.\n\nPreference Cookies: Remember your settings and preferences to improve your experience on return visits.\n\nYou can control cookie behavior through your browser settings. Note that disabling certain cookies may affect the functionality of the Site.",
    },
    {
      id: "third-party",
      heading: "5. Third-Party Services and Affiliate Links",
      body: `Amazon Associates Program:\nPaint With Purpose is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com.\n\nWhen you click on an Amazon affiliate link on this Site and make a purchase, we may earn a small commission at no additional cost to you. Amazon collects data according to their own privacy policy, which you can review at amazon.com/privacy.\n\nAnalytics:\nWe may use web analytics tools to help us understand Site traffic. These services may collect anonymized usage data. We do not share personally identifiable information with these providers.\n\nEmail Service Provider:\nWe use a third-party provider to manage our newsletter mailing list. Your email address is stored within that provider's secure infrastructure in accordance with applicable data protection laws.`,
    },
    {
      id: "data-retention",
      heading: "6. Data Retention",
      body: "Newsletter subscribers: We retain your email address for as long as you remain subscribed. Upon unsubscribing, your address is removed from our active list. Residual backup copies may be retained for up to 30 days.\n\nContact form submissions: Messages sent via the contact form are retained for up to 12 months to allow us to respond to follow-up inquiries, then deleted.\n\nAnalytics data: Aggregated, anonymized analytics data may be retained indefinitely as it cannot be used to identify individuals.",
    },
    {
      id: "childrens-privacy",
      heading: "7. Children's Privacy",
      body: `Paint With Purpose is designed to be a family-safe resource. While our content is appropriate for children of all ages, we do not knowingly collect personal information from children under the age of 13.\n\nIf you are a parent or guardian and believe your child has submitted personal information to us, please contact us at ${BRAND.email} and we will promptly delete the information.\n\nChildren under 13 should not subscribe to our newsletter or submit contact forms without parental supervision.`,
    },
    {
      id: "your-rights",
      heading: "8. Your Rights",
      body: `Depending on your location, you may have the following rights regarding your personal data:\n\n— Right to Access: Request a copy of the personal information we hold about you.\n— Right to Correction: Request correction of inaccurate or incomplete information.\n— Right to Deletion: Request that we delete your personal data (subject to legal retention requirements).\n— Right to Withdraw Consent: Withdraw consent for newsletter emails at any time by unsubscribing.\n— Right to Opt Out of Sale: We do not sell personal data. This right is automatically honored.\n\nTo exercise any of these rights, contact us at: ${BRAND.email}\n\nWe will respond to all legitimate requests within 30 days.`,
    },
    {
      id: "security",
      heading: "9. Data Security",
      body: "We take the security of your personal information seriously and implement reasonable technical and organizational measures to protect it from unauthorized access, disclosure, alteration, or destruction.\n\nHowever, no method of internet transmission or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your data, we cannot guarantee absolute security.",
    },
    {
      id: "changes",
      heading: "10. Changes to This Privacy Policy",
      body: "We may update this Privacy Policy from time to time to reflect changes in our practices, technologies, or legal requirements. When we do, we will update the \"Last Updated\" date at the top of this page.\n\nWe encourage you to review this page periodically. Continued use of the Site after any changes constitutes acceptance of the updated policy.",
    },
    {
      id: "contact",
      heading: "11. Contact Us",
      body: `If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:\n\nEmail:    ${BRAND.email}\nWebsite:  ${BRAND.domain}/contact`,
    },
  ],
} as const;

// ─────────────────────────────────────────────────────────────
// PAGE 5 — TERMS OF USE
// ─────────────────────────────────────────────────────────────

export const TERMS_OF_USE_PAGE = {
  meta: {
    title: "Terms of Use | Paint With Purpose",
    description:
      "Read the Terms of Use for Paint With Purpose. Understand the rules for using our free coloring pages, website content, and services.",
    slug: "/terms-of-use",
  },

  header: {
    heading: "Terms of Use",
    effectiveDate: LEGAL_DATES.effectiveDate,
    lastUpdated: LEGAL_DATES.lastUpdated,
    intro: `Welcome to Paint With Purpose. By accessing or using the website located at pwpcoloringpages.com (the "Site"), you agree to be bound by these Terms of Use ("Terms"). Please read them carefully.\n\nIf you do not agree with these Terms, please do not use the Site.`,
  },

  sections: [
    {
      id: "acceptance",
      heading: "1. Acceptance of Terms",
      body: "By visiting, browsing, or using any part of this Site, you represent that:\n\n— You are at least 13 years of age, or are accessing the Site under the supervision of a parent or guardian.\n— You have read and understood these Terms and agree to be bound by them.\n— You will comply with all applicable local, national, and international laws and regulations while using the Site.",
    },
    {
      id: "use-of-content",
      heading: "2. Use of Coloring Pages and Downloadable Content",
      subsections: [
        {
          id: "permitted-use",
          heading: "2.1 What You May Do",
          body: "All coloring pages available for download on the Site are provided free of charge for personal, educational, and therapeutic use. You are permitted to:\n\n— Download and print coloring pages for your own personal use\n— Print and distribute coloring pages in non-commercial classroom, school, or educational settings\n— Print and use coloring pages in therapeutic, clinical, or non-profit settings\n— Share links to pages on this Site (please link to the page, not directly to the PDF file)",
        },
        {
          id: "prohibited-use",
          heading: "2.2 What You May Not Do",
          body: "You may not, without prior written permission from Paint With Purpose:\n\n— Sell, resell, or commercially distribute any coloring page or PDF downloaded from this Site\n— Upload or redistribute PDF files to other websites, platforms, file-sharing services, or digital marketplaces\n— Remove, alter, or obscure any watermarks, logos, or attribution embedded in downloadable files\n— Use our coloring pages to create derivative products for commercial sale (e.g., printed merchandise, coloring books, digital packs)\n— Claim authorship or ownership of any coloring page content from this Site\n— Use automated tools to bulk-download content from the Site",
        },
      ],
    },
    {
      id: "intellectual-property",
      heading: "3. Intellectual Property",
      body: "All content on this Site — including but not limited to coloring page artwork, illustrations, graphics, text, logos, and page layouts — is the property of Paint With Purpose or its content licensors and is protected by applicable copyright, trademark, and intellectual property laws.\n\nThe \"Paint With Purpose\" name and logo are trademarks of Paint With Purpose. You may not use our name, logo, or branding without prior written consent.\n\nUnauthorized use of any content from this Site may violate copyright law and may result in legal action.",
    },
    {
      id: "affiliate-disclosure",
      heading: "4. Affiliate Link Disclosure",
      body: "Paint With Purpose participates in the Amazon Services LLC Associates Program. Some links on this Site are affiliate links, meaning we may earn a commission if you make a purchase through those links — at no additional cost to you.\n\nWe only recommend products we genuinely believe in. Affiliate commissions help fund the Site and keep all coloring pages free.\n\nThis disclosure is made in accordance with the Federal Trade Commission's (FTC) guidelines on endorsements and testimonials (16 CFR Part 255).",
    },
    {
      id: "user-conduct",
      heading: "5. User Conduct",
      body: "When using the Site or contacting us through any form or channel, you agree not to:\n\n— Submit false, misleading, or fraudulent information\n— Attempt to gain unauthorized access to any part of the Site, its servers, or associated systems\n— Introduce viruses, malware, or other harmful code\n— Use the Site in any way that could damage, disable, or impair its performance\n— Harvest or collect data from the Site using automated means (scraping, bots, crawlers) without express written permission\n— Harass, threaten, or abuse other users or our team members",
    },
    {
      id: "third-party-links",
      heading: "6. Third-Party Links",
      body: "The Site contains links to third-party websites, including Amazon product pages. These links are provided for your convenience only.\n\nPaint With Purpose has no control over the content, privacy practices, or availability of third-party sites. We are not responsible for any content, claims, or damages arising from your use of linked third-party websites.\n\nClicking on a third-party link means you are leaving pwpcoloringpages.com and entering a site governed by that party's own terms and policies.",
    },
    {
      id: "disclaimers",
      heading: "7. Disclaimers",
      body: "The Site and all content are provided on an \"AS IS\" and \"AS AVAILABLE\" basis, without warranties of any kind — either express or implied.\n\nPaint With Purpose does not warrant that:\n— The Site will be available at all times or free from errors\n— Downloadable files will be free from defects or viruses\n— The information on the Site is accurate, complete, or current\n\nWe reserve the right to update, modify, or remove any content — including coloring pages — at any time without notice.",
    },
    {
      id: "liability",
      heading: "8. Limitation of Liability",
      body: "To the maximum extent permitted by applicable law, Paint With Purpose and its operators, contributors, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages — including loss of data, revenue, or goodwill — arising out of your use of, or inability to use, the Site or its content.\n\nOur total liability to you for any claim arising from these Terms or your use of the Site shall not exceed $100 USD.",
    },
    {
      id: "modifications",
      heading: "9. Modifications to These Terms",
      body: "We reserve the right to update or change these Terms of Use at any time. Changes will be effective immediately upon posting to the Site, with the \"Last Updated\" date revised accordingly.\n\nYour continued use of the Site after any changes are posted constitutes your acceptance of the revised Terms. We encourage you to review this page periodically.",
    },
    {
      id: "governing-law",
      heading: "10. Governing Law",
      body: "These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to conflict of law principles. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts located within the United States.",
    },
    {
      id: "contact",
      heading: "11. Contact Us",
      body: `If you have questions about these Terms of Use, please contact us:\n\nEmail:    ${BRAND.email}\nWebsite:  ${BRAND.domain}/contact`,
    },
  ],
} as const;

// ─────────────────────────────────────────────────────────────
// BARREL EXPORT — import everything from one place
// ─────────────────────────────────────────────────────────────

export const STATIC_PAGES = {
  about: ABOUT_PAGE,
  contact: CONTACT_PAGE,
  newsletter: NEWSLETTER_PAGE,
  privacyPolicy: PRIVACY_POLICY_PAGE,
  termsOfUse: TERMS_OF_USE_PAGE,
} as const;
