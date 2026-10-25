import { site } from '@/src/content';

export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[60] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-white focus:text-rich-black focus:font-medium"
    >
      {site.skipLink}
    </a>
  );
}
