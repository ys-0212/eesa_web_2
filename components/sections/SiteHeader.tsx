'use client';

import { useEffect, useState } from 'react';
import { header } from '@/src/content';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { InlineSvg } from '@/components/ui/InlineSvg';
import { MegaMenuPanel } from '@/components/ui/MegaMenuPanel';
import { MobileMenu } from '@/components/ui/MobileMenu';

/**
 * Sticky header. Desktop (≥1152px): click-to-toggle mega menus (one open at a time), closed by
 * Escape or an outside click. Below 1152px: MENU toggle expanding a nested accordion.
 */
export function SiteHeader() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Element | null;
      if (t && !t.closest('[data-menu-trigger]') && !t.closest('.mega-panel')) setOpenMenu(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpenMenu(null);
      setMobileOpen(false);
    };
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <header
      className={`site-header sticky top-0 z-50 transition-all duration-200 bg-rich-black ${mobileOpen ? 'nav-expanded' : ''}`}
      aria-label="Site navigation"
    >
      <div className="site-container">
        <nav aria-label="main" className="flex flex-row flex-wrap items-center justify-center w-full py-4 xl:flex-nowrap text-white leading-8">
          <a href={header.logo.href} aria-label={header.logo.ariaLabel} className="flex items-center shrink-0 mr-auto text-white">
            <InlineSvg name={header.logo.svg} className="contents" aria-hidden="true" />
          </a>

          <button
            type="button"
            className="btn-new btn-menu xl:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobileMenu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span className="label">{header.mobileToggleLabel}</span>
            <InlineSvg name="chevronRight" className="chevron" aria-hidden="true" />
          </button>

          <div id="mobileMenu" hidden={!mobileOpen} className="xl:!hidden w-full bg-rich-black">
            <MobileMenu tree={header.mobileTree} />
            <ul className="list-none p-0 m-0">
              {header.links.slice(0, 2).map((l) => (
                <li key={l.label} className="mb-4">
                  <a href={l.href} className="btn-new btn-silent w-full !justify-start !px-4">
                    <span className="label">{l.label}</span>
                  </a>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-2 mt-8 mb-6 px-4">
              <a href={header.links[2].href} className="btn-new btn-silent w-full">
                <span className="label">{header.links[2].label}</span>
              </a>
              <ButtonLink variant="secondary-dark" href={header.ctas.demo.href} className="w-full">
                {header.ctas.demo.label}
              </ButtonLink>
              <ButtonLink variant="primary-dark" href={header.ctas.start.href} className="w-full">
                {header.ctas.start.label}
              </ButtonLink>
            </div>
          </div>

          <ul className="hidden xl:flex xl:flex-row xl:items-center xl:flex-1 xl:justify-evenly xl:relative list-none p-0 m-0">
            {header.menus.map((m) => {
              const open = openMenu === m.key;
              return (
                <li key={m.key} className="flex-shrink-0 xl:flex xl:items-center">
                  <button
                    type="button"
                    data-menu-trigger={m.key}
                    aria-expanded={open}
                    aria-controls={`menu-${m.key}`}
                    onClick={() => setOpenMenu(open ? null : m.key)}
                    className="btn-new btn-silent"
                  >
                    <span className="label">{m.label}</span>
                    <InlineSvg name="chevronRight" className="chevron" aria-hidden="true" />
                  </button>
                </li>
              );
            })}
            {header.links.slice(0, 2).map((l) => (
              <li key={l.label} className="flex-shrink-0 xl:flex xl:items-center">
                <a href={l.href} className="btn-new btn-silent">
                  <span className="label">{l.label}</span>
                </a>
              </li>
            ))}
            {header.menus.map((m) => (
              <MegaMenuPanel key={m.key} id={`menu-${m.key}`} menuKey={m.key} columns={m.columns} featuredCard={'featuredCard' in m ? m.featuredCard : undefined} open={openMenu === m.key} />
            ))}
          </ul>

          <div className="hidden xl:flex xl:flex-row xl:items-center xl:shrink-0 xl:gap-2">
            <a href={header.links[2].href} className="btn-new btn-silent">
              <span className="label">{header.links[2].label}</span>
            </a>
            <ButtonLink variant="secondary-dark" href={header.ctas.demo.href}>
              {header.ctas.demo.label}
            </ButtonLink>
            <ButtonLink variant="primary-dark" href={header.ctas.start.href}>
              {header.ctas.start.label}
            </ButtonLink>
          </div>
        </nav>
      </div>
    </header>
  );
}
