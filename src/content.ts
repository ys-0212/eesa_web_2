// Single source of truth for every editable string, link, alt text and media reference on the page.
// Rich-text fields (`html`) are trusted local markup rendered as-is; keep them to <a>, <em>, <strong>.
// Media paths are relative to /public. Inline SVG artwork lives in src/svgs.ts; code snippets in src/snippets.ts.

import type { SvgName } from './svgs';

const S = 'https://sentry.io';

export type Link = { label: string; href: string; external?: boolean };
export type MenuLink = { label: string; href: string; pill?: string; icon?: string; nested?: boolean };
export type MenuColumn = { heading?: string; links: MenuLink[]; wide?: boolean; featured?: boolean };
export type MobileNode = { label: string; children: (MobileNode | MenuLink)[] };

export const media = {
  riveHero: '/media/rive/home-hero-scanner-animation.riv',
  riveWasm: '/media/rive/rive.wasm',
  heroPoster: '/media/images/hero-animation-poster.webp',
  welcomeBg: '/media/images/welcome-bg.webp',
  middleTexture: '/media/images/middle-bg-texture.webp',
  ufo: '/media/images/ufo-abduction-image.webp',
  quoteMark: '/media/images/quotemark.png',
  ogImage: '/media/images/home-hero-meta.webp',
} as const;

export const site = {
  title: 'Application Performance Monitoring & Error Tracking Software | Sentry',
  description:
    'Self-hosted and cloud-based application performance monitoring & error tracking that helps software teams see clearer, solve quicker, & learn continuously.',
  skipLink: 'Skip to main content',
};

/* ------------------------------------------------------------------ header */
export const header = {
  logo: { href: `${S}/welcome/`, ariaLabel: 'Welcome Page', svg: 'sentryLogo' as SvgName },
  menus: [
    {
      key: 'platform',
      label: 'Platform',
      columns: [
        {
          heading: 'Products',
          links: [
            { label: 'Error Monitoring', href: `${S}/product/error-monitoring/` },
            { label: 'Logs', href: `${S}/product/logs/` },
            { label: 'Session Replay', href: `${S}/product/session-replay/` },
            { label: 'Metrics', href: `${S}/product/metrics/`, pill: 'New' },
            { label: 'Tracing', href: `${S}/product/tracing/` },
            { label: 'Agent Tracing', href: `${S}/product/tracing/ai-agent/`, nested: true },
            { label: 'Profiling', href: `${S}/product/profiling/` },
            { label: 'Size Analysis', href: `${S}/product/size-analysis/` },
            { label: 'Cron Monitoring', href: `${S}/product/cron-monitoring/` },
            { label: 'Uptime Monitoring', href: `${S}/product/uptime-monitoring/` },
            { label: 'Labs', href: 'https://labs.sentry.dev/', pill: 'New' },
          ],
        },
        {
          heading: 'AI Debugging',
          wide: true,
          links: [
            { label: 'Seer', href: `${S}/product/seer/`, pill: 'New' },
            { label: 'Agent', href: `${S}/product/seer/agent/`, nested: true },
            { label: 'Autofix', href: `${S}/product/seer/autofix/`, nested: true },
            { label: 'AI Code Review', href: `${S}/product/seer/ai-code-review/`, nested: true },
          ],
        },
        {
          heading: 'Integrations',
          featured: true,
          links: [
            { label: 'Github', href: `${S}/integrations/github/`, icon: '/media/images/github.png' },
            { label: 'Slack', href: `${S}/integrations/slack/`, icon: '/media/images/slack.png' },
            { label: 'Sentry CLI', href: 'https://cli.sentry.dev/' },
            { label: 'Sentry MCP', href: 'https://mcp.sentry.dev/' },
            { label: 'All Integrations', href: `${S}/integrations/` },
          ],
        },
      ] as MenuColumn[],
    },
    {
      key: 'solutions',
      label: 'Solutions',
      columns: [
        {
          links: [
            { label: 'Web / Full Stack Development', href: `${S}/for/full-stack/` },
            { label: 'Mobile Crash Reporting', href: `${S}/solutions/mobile-developers/` },
            { label: 'Game Crash Reporting', href: `${S}/solutions/game-developers/` },
            { label: 'AI Observability', href: `${S}/solutions/ai-observability/` },
            { label: 'Application Performance Monitoring', href: `${S}/solutions/application-performance-monitoring/` },
            { label: 'Application Observability', href: `${S}/solutions/application-observability/` },
            { label: 'Real User Monitoring', href: `${S}/solutions/real-user-monitoring-rum/` },
            { label: 'Ecommerce', href: `${S}/solutions/ecommerce/` },
            { label: 'OpenTelemetry', href: `${S}/solutions/opentelemetry/` },
            { label: 'Enterprise', href: `${S}/for/enterprise/` },
            { label: 'Startups', href: `${S}/for/startups/` },
            { label: 'All SDKs', href: `${S}/platforms/` },
          ],
        },
      ] as MenuColumn[],
    },
    {
      key: 'resources',
      label: 'Resources',
      columns: [
        {
          heading: 'Learn',
          links: [
            { label: 'Blog', href: 'https://blog.sentry.io/' },
            { label: 'Changelog', href: `${S}/changelog/` },
            { label: 'Sandbox', href: 'https://sandbox.sentry.io/' },
            { label: 'Resources', href: `${S}/resources/` },
            { label: 'Syntax', href: 'https://syntax.fm/' },
            { label: 'Customers', href: `${S}/customers/` },
            { label: 'Cookbook', href: `${S}/cookbook/` },
          ],
        },
        {
          heading: 'Support',
          links: [
            { label: 'Contact Us', href: `${S}/contact/enterprise/` },
            { label: 'Help Center', href: 'https://help.sentry.io/' },
            { label: 'Status', href: 'https://status.sentry.io/' },
          ],
        },
        {
          heading: 'Hang out with us',
          links: [
            { label: 'Community', href: `${S}/community/` },
            { label: 'Events', href: `${S}/events/` },
            { label: 'Merch', href: 'https://sentry.shop/' },
          ],
        },
      ] as MenuColumn[],
      featuredCard: {
        image: '/media/images/automated-debugging.webp',
        alt: 'Automated Debugging Hub',
        title: 'Automated Debugging Hub',
        body: 'Guides, recipes, and videos on how Sentry gives your agents the context to find root causes and fix bugs.',
        cta: { label: 'Automate Your Debugging', href: `${S}/resources/automated-debugging/` },
      },
    },
  ],
  links: [
    { label: 'Docs', href: 'https://docs.sentry.io/' },
    { label: 'Pricing', href: `${S}/pricing/` },
    { label: 'Sign In', href: `${S}/auth/login/` },
  ] as Link[],
  ctas: {
    demo: { label: 'Get Demo', href: `${S}/demo/` },
    start: { label: 'Get Started', href: `${S}/signup/` },
  },
  mobileToggleLabel: 'Menu',
  // Mobile accordion groups differ from the desktop columns (Seer/Tracing nest inside Products).
  mobileTree: [
    {
      label: 'Platform',
      children: [
        {
          label: 'Products',
          children: [
            { label: 'Error Monitoring', href: `${S}/product/error-monitoring/` },
            { label: 'Logs', href: `${S}/product/logs/` },
            {
              label: 'Seer',
              children: [
                { label: 'Seer', href: `${S}/product/seer/`, pill: 'New' },
                { label: 'Agent', href: `${S}/product/seer/agent/`, nested: true },
                { label: 'Autofix', href: `${S}/product/seer/autofix/`, nested: true },
                { label: 'AI Code Review', href: `${S}/product/seer/ai-code-review/`, nested: true },
              ],
            },
            { label: 'Session Replay', href: `${S}/product/session-replay/` },
            { label: 'Metrics', href: `${S}/product/metrics/`, pill: 'New' },
            {
              label: 'Tracing',
              children: [
                { label: 'Tracing', href: `${S}/product/tracing/` },
                { label: 'Agent Tracing', href: `${S}/product/tracing/ai-agent/`, nested: true },
              ],
            },
            { label: 'Profiling', href: `${S}/product/profiling/` },
            { label: 'Size Analysis', href: `${S}/product/size-analysis/` },
            { label: 'Cron Monitoring', href: `${S}/product/cron-monitoring/` },
            { label: 'Uptime Monitoring', href: `${S}/product/uptime-monitoring/` },
            { label: 'Labs', href: 'https://labs.sentry.dev/', pill: 'New' },
          ],
        },
        {
          label: 'Integrations',
          children: [
            { label: 'Github', href: `${S}/integrations/github/` },
            { label: 'Slack', href: `${S}/integrations/slack/` },
            { label: 'Sentry CLI', href: 'https://cli.sentry.dev/' },
            { label: 'Sentry MCP', href: 'https://mcp.sentry.dev/' },
            { label: 'All Integrations', href: `${S}/integrations/` },
          ],
        },
      ],
    },
    { label: 'Solutions', children: [] }, // filled from the desktop Solutions column below
    { label: 'Resources', children: [] }, // filled from the desktop Resources columns below
  ] as MobileNode[],
};
// Solutions/Resources share their desktop link lists.
header.mobileTree[1].children = header.menus[1].columns[0].links;
header.mobileTree[2].children = header.menus[2].columns.map((c) => ({ label: c.heading ?? '', children: c.links }));

export const marketingToggle = {
  label: 'Marketing Mode',
  ariaLabel: 'Marketing mode is on. Switch to no-marketing mode',
  href: `${S}/no-marketing-mode/`,
};

/* ------------------------------------------------------------------ hero */
export const hero = {
  promo: { label: 'Sentry MCP: fix production issues right from your LLM  ➔', href: 'https://mcp.sentry.dev', external: true },
  headline: { before: 'Code', swing: 'breaks,', after: 'fix it faster' },
  // U+2028 after "considered " is present in the reference copy and renders as extra space.
  subtitle: 'Application monitoring software considered \u2028"not bad" by millions of developers.',
  ctas: {
    primary: { label: 'Get Started', href: `${S}/signup/` },
    secondary: { label: 'Get Demo', href: `${S}/demo/` },
  },
  animation: {
    src: media.riveHero,
    stateMachine: 'State Machine 1',
    poster: media.heroPoster,
    posterAlt: 'Illustration of a Sentry robot scanning error, replay, log and trace panels while a Seer panel explains the root cause',
    width: 1366,
    height: 540,
    viewportThreshold: 0.25,
  },
};

/* ------------------------------------------------------------------ logos */
export const logoRiver = {
  scrollSeconds: 60,
  ufoImage: media.ufo,
  // Names must match entries in customerLogoSvgs (src/svgs.ts); order = original order.
  logos: ['GitHub', 'Disney', 'Atlassian', 'Linear', 'Vercel', 'Cloudflare', 'Slack', 'Metronome', 'Autodesk', 'Microsoft', 'Instacart', 'Lyft', 'Bolt', 'Monday', 'Cursor', 'Anthropic', 'Factory AI', 'Sentry', 'Baseten', 'Runlayer', 'Convex', 'Supabase'],
  srLabel: 'Companies that use Sentry',
};

/* ------------------------------------------------------------------ developer first */
export const developerFirst = {
  heading: { main: 'Developer first.', accent: 'Always.' },
  carouselLabel: 'Features carousel',
  cards: [
    {
      title: 'Monitor in five lines',
      html: `Drop in the <a href="${S}/platforms/">SDK</a>. No agents to install. No performance surprises.`,
      image: '/media/images/install-1-line.webp',
      alt: 'Illustration of a terminal-style window showing the command npm install @sentry/browser on a dark purple background.',
    },
    {
      title: 'Automatically root-cause any issue',
      html: `Catch critical issues before you merge and fix them when they hit prod with <a href="${S}/product/seer/">Seer, our debugging agent and code reviewer</a>.`,
      image: '/media/images/automatic-rca.webp',
      alt: 'A section labeled “Root Cause” with code insight stating: “The code attempts to check if $quantities,” highlighting a probable bug in the application logic.',
    },
    {
      title: 'Babysit the bots',
      html: `<a href="${S}/product/tracing/ai-agent/">Agent tracing</a> helps you catch unexpected output issues, bad tool calls and visualize the spend and performance across all your agents.`,
      image: '/media/images/agent-tracing.webp',
      alt: 'Sentry agent tracing UI showing a manager_agent invoking a plant_expert_agent with spans for chat, handoff, and tool calls, alongside token usage, cost, and context details.',
    },
    {
      title: 'Stay in the flow',
      html: `From <a href="${S}/integrations/github/">GitHub</a>, <a href="${S}/integrations/slack/">Slack</a>, <a href="${S}/integrations/jira/">Jira</a>, and <a href="${S}/integrations/linear/">Linear</a> to coding agents with <a href="https://mcp.sentry.dev/">Sentry's MCP server</a>, Sentry brings full context to every fix from dev to prod.`,
      image: '/media/images/mcp-integration.webp',
      alt: 'Chat-style interface showing “Sentry agent connected” and a user named “codydearkland” asking, “@Sentry can i get some help?”',
    },
  ],
};

/* ------------------------------------------------------------------ tabbed sections */
export type TabbedSectionContent = {
  id: string;
  heading: { main: string; accent: string };
  subtitleHtml: string;
  subheading?: string;
  tabs: { text: string; image: string; alt: string }[];
};

export const tabbedSections: TabbedSectionContent[] = [
  {
    id: 'connected',
    heading: { main: 'Everything’s', accent: 'connected' },
    subtitleHtml: `Yeah, other tools exist. But <a href="${S}/product/error-monitoring/">errors</a>, <a href="${S}/product/logs/">logs</a>, <a href="${S}/product/session-replay/">replays</a>, <a href="${S}/product/tracing/">spans</a>, <a href="${S}/product/profiling/">profiles</a>, and <a href="${S}/product/metrics/">metrics</a> — all connected by the same trace? That’s kind of our thing.`,
    subheading: 'Go from Issue → Context → Fix.',
    tabs: [
      {
        text: "Debug 500's, trace slow requests, replay fetch() failures, and fix the broken code that caused it.",
        image: '/media/images/tabs-a-1.webp',
        alt: 'Sentry Session Replay showing a user session on empower-plant.com with clicks, navigation, and two key errors during checkout: out-of-stock and 500 server error.',
      },
      {
        text: 'Catch slow queries, N+1s, and request timeouts before the ‘why is this so slow?’ posts fill up your feed.',
        image: '/media/images/tabs-a-2.webp',
        alt: 'Sentry trace waterfall view for an HTTP POST to /api/v1/buy-plants, showing AI-related spans including invoke_agent, chat, and execute_tool, with one invocation taking 4.04s—80% faster than average.',
      },
      {
        text: 'Map every incident to the release, PR, and owner -- automatically.',
        image: '/media/images/tabs-a-3.webp',
        alt: 'Sentry issue view showing an unhandled exception in src/main.py at line 279: “Error validating enough inventory for product.” Includes code context, release details, and related file changes in the empower.flask package.',
      },
    ],
  },
  {
    id: 'context',
    heading: { main: 'Debugging needs context—', accent: 'with or without AI' },
    subtitleHtml: `<a href="${S}/product/seer/">Seer</a>, our AI debugger, uses Sentry context – logs, commits, traces, stack trace - so you can stop guessing and <em>it</em> can fix issues for you. `,
    tabs: [
      {
        text: 'Analyzes every signal to explain why your code failed, not just where.',
        image: '/media/images/tabs-b-1.webp',
        alt: 'Sentry issue detail page for a fatal read ETIMEDOUT error on a GET /api/projects request, showing root cause analysis: a missing DB connection timeout combined with latency and WebSocket activity. Includes stack trace, user impact, and code snippet with a new Pool() initialization lacking timeout settings.',
      },
      {
        text: 'Fixes what’s broken while you ship what’s next – generating precise, merge-ready patches.',
        image: '/media/images/tabs-b-2.webp',
        alt: 'Code diff view showing new configurations added to prevent database timeout errors, including connection pool sizing, timeouts for idle connections and queries, and keepalive settings in client.ts.',
      },
      {
        text: 'Stops bad code before it starts bad days. Correlating PRs against real error and performance history to catch regressions before they ship.',
        image: '/media/images/tabs-b-3.webp',
        alt: 'GitHub code review by the Seer highlighting a potential bug: inconsistent error handling for missing OpenAI API keys in ProjectDetectionService, which throws an error in the constructor and may crash the app on startup.',
      },
    ],
  },
];

/* ------------------------------------------------------------------ testimonials */
export const testimonials = {
  heading: { main: 'Loved by developers', accent: 'worldwide' },
  quoteMarkAlt: 'quote mark',
  items: [
    {
      quote: 'We wouldn’t have scaled without Sentry. Most of our incidents are hardware-related—and we debug them all inside Sentry',
      name: 'Nova DasSarma',
      role: 'Systems Lead, Anthropic',
      logo: '/media/images/Frame_1__2_.webp',
      logoAlt: 'Anthropic',
    },
    {
      quote: 'Sentry’s high-quality tooling helps Disney+ maintain high-quality service to its tens of millions of global subscribers.',
      name: 'Andrew Hay',
      role: 'Director at Disney Streaming Services, Disney+',
      logo: '/media/images/logo.png',
      logoAlt: 'Disney+',
    },
    {
      quote: 'The signal we get from Sentry is the most reliable indicator of software issues and is used throughout Instacart because it can be easily configured for each service regardless of the language or framework.',
      name: 'Igor Dobrovitski',
      role: 'Infrastructure Software Engineer, Instacart',
      logo: '/media/images/logo-instacart.webp',
      logoAlt: 'Instacart',
    },
  ],
};

/* ------------------------------------------------------------------ getting started */
export const gettingStarted = {
  heading: { main: 'Get started', accent: 'in minutes' },
  subtitle: "Five lines of code. That's it. No complex setup, no performance hits, no waiting around.",
  selectLabel: 'Choose your platform',
  defaultPlatform: 'nextjs',
  copyLabel: 'Copy code',
  copiedMessage: 'Copied!',
  copyFailedMessage: 'Failed',
  imageLeft: { src: '/media/images/getting-started-img-left.webp', alt: 'Left Installation Instructions Image', mobileAlt: 'Left Installation Instructions Image Mobile' },
  imageRight: { src: '/media/images/getting-started-img-right.webp', alt: 'Right Installation Instructions Image' },
};

/* ------------------------------------------------------------------ security */
export const security = {
  heading: { main: 'Built to be secure,', accent: 'Designed to not get in your way' },
  body: "Security and compliance aren't just checkboxes—they're built into how we run Sentry. We use industry-standard tech and practices to keep your data safe, and we stay out of your way while doing it.",
  badges: [
    { svg: 'badgeGdpr', label: 'GDPR' },
    { svg: 'badgeSoc2', label: 'SOC 2 Type 2' },
    { svg: 'badgeIso27001', label: 'ISO 27001' },
    { svg: 'badgeHipaa', label: 'HIPAA compliant' },
  ] as { svg: SvgName; label: string }[],
  ctas: {
    privacy: { label: 'Check out our Privacy Policy', href: `${S}/privacy/` },
    contact: { label: 'Contact Us', href: `${S}/contact/enterprise/` },
  },
};

/* ------------------------------------------------------------------ newsletter */
export const newsletter = {
  heading: { main: 'Get monthly product updates', accent: 'from our newsletter' },
  emailLabel: 'Your Email:',
  consentLabel: 'I want to receive the monthly newsletter and other updates from Sentry. You may unsubscribe at any time.',
  legalHtml: `<span>By filling out this form, you agree to our&nbsp;</span><a href="${S}/privacy/" target="_blank" rel="noopener">privacy policy</a><span>. This form is protected by reCAPTCHA and Google's&nbsp;<a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Privacy Policy</a>&nbsp;and&nbsp;<a href="https://policies.google.com/terms" target="_blank" rel="noopener">Terms of Service</a>&nbsp;apply.</span>`,
  submitLabel: 'Sign Up',
  // The clone never sends data anywhere; this message is shown after local validation.
  localSubmitMessage: 'Thanks! (Local demo — nothing was submitted.)',
  image: '/media/images/home-spot-404.webp',
  imageAlt: 'Cartoon showing the Sentry logo as a distressed character watching one person stuck in a smartphone and another diving headfirst into a retro computer—illustrating developers getting lost in debugging chaos.',
};

/* ------------------------------------------------------------------ final CTA */
export const finalCta = {
  heading: 'Fix It',
  body: 'Get started with the only application monitoring platform that empowers developers to fix application problems without compromising on velocity.',
  primary: { label: 'Try Sentry for Free', href: `${S}/signup/` },
  secondary: { label: 'Get a Demo', href: `${S}/demo/` },
};

/* ------------------------------------------------------------------ footer */
export const footer = {
  columns: [
    {
      heading: 'Company',
      links: [
        { label: 'About', href: `${S}/about/` },
        { label: 'Blog', href: 'https://blog.sentry.io/' },
        { label: 'Careers', href: `${S}/careers/` },
        { label: 'Contact Us', href: `${S}/contact/enterprise/` },
        { label: 'Trust', href: `${S}/trust/` },
      ],
    },
    {
      heading: 'Platform',
      links: [
        { label: 'Error Monitoring', href: `${S}/product/error-monitoring/` },
        { label: 'Logs', href: `${S}/product/logs/` },
        { label: 'Seer', href: `${S}/product/seer/` },
        { label: 'Session Replay', href: `${S}/product/session-replay/` },
        { label: 'Metrics', href: `${S}/product/metrics/` },
        { label: 'Tracing', href: `${S}/product/tracing/` },
        { label: 'Uptime Monitoring', href: `${S}/product/uptime-monitoring/` },
        { label: 'Profiling', href: `${S}/product/profiling/` },
        { label: 'Cron Monitoring', href: `${S}/product/cron-monitoring/` },
        { label: 'Integrations', href: `${S}/integrations/` },
      ],
    },
    {
      heading: 'Solutions',
      links: [
        { label: 'Web / Full Stack Development', href: `${S}/for/full-stack/` },
        { label: 'Mobile Crash Reporting', href: `${S}/solutions/mobile-developers/` },
        { label: 'Game Crash Reporting', href: `${S}/solutions/game-developers/` },
        { label: 'AI Observability', href: `${S}/solutions/ai-observability/` },
        { label: 'Application Performance Monitoring', href: `${S}/solutions/application-performance-monitoring/` },
        { label: 'Application Observability', href: `${S}/solutions/application-observability/` },
        { label: 'Real User Monitoring', href: `${S}/solutions/real-user-monitoring-rum/` },
        { label: 'Ecommerce', href: `${S}/solutions/ecommerce/` },
        { label: 'Enterprise', href: `${S}/for/enterprise/` },
        { label: 'Startups', href: `${S}/for/startups/` },
      ],
    },
    {
      heading: 'Get Help',
      links: [
        { label: 'Docs', href: 'https://docs.sentry.io/' },
        { label: 'Help Center', href: 'https://help.sentry.io/' },
        { label: 'Status', href: 'https://status.sentry.io/' },
        { label: 'Cookbook', href: `${S}/cookbook/` },
        { label: 'Dev Resources', href: 'https://develop.sentry.dev/getting-started/' },
      ],
    },
  ] as { heading: string; links: Link[] }[],
  legal: [
    { label: 'Terms', href: `${S}/terms/` },
    { label: 'Security & Compliance', href: `${S}/security/` },
    { label: 'Privacy', href: `${S}/privacy/` },
  ] as Link[],
  marks: [
    { svg: 'footerSentryMark' as SvgName, href: `${S}/`, ariaLabel: 'home' },
    { svg: 'openSourcePledge' as SvgName, href: 'https://opensourcepledge.com/members/sentry/', ariaLabel: 'Open Source Pledge', external: true },
  ],
  social: [
    { label: 'Twitter Menu Button', href: 'https://x.com/sentry/', icon: '/media/images/x-twitter.png' },
    { label: 'Github Social Menu Button', href: 'https://github.com/getsentry/', icon: '/media/images/github.png' },
    { label: 'LinkedIn Menu Button', href: 'https://www.linkedin.com/company/getsentry/', icon: '/media/images/linkedin.png' },
    { label: 'Discord Menu Button', href: 'https://discord.gg/sentry', icon: '/media/images/discord.png' },
  ],
  copyright: '© 2026 • Sentry is a registered Trademark of Functional Software, Inc.',
};
