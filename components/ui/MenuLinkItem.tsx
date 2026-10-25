/* eslint-disable @next/next/no-img-element */
import type { MenuLink } from '@/src/content';

/** One uppercase menu/footer link row (`li.pb-1` + optional NEW pill, icon, nested bullet). */
export function MenuLinkItem({ link, tone }: { link: MenuLink; tone: 'light' | 'dark' }) {
  return (
    <li className={`pb-1 ${link.nested ? 'nested-item' : 'pl-6 xl:pl-0'}`}>
      <a
        href={link.href}
        className={`no-underline font-medium text-sm leading-[18px] uppercase whitespace-nowrap flex items-center gap-x-1.5 w-full min-h-[18px] py-0.5 hover:underline xl:w-max ${tone === 'light' ? 'text-dk-blurple' : 'text-white'}`}
      >
        {link.icon ? <img src={link.icon} alt="" aria-hidden="true" className="w-4 h-4" width={16} height={16} /> : null}
        {link.label}
        {link.pill ? <span className="new-pill">{link.pill}</span> : null}
      </a>
    </li>
  );
}
