/* eslint-disable @next/next/no-img-element */
import type { MenuColumn } from '@/src/content';
import { ButtonLink } from './ButtonLink';
import { MenuLinkItem } from './MenuLinkItem';

type FeaturedCard = { image: string; alt: string; title: string; body: string; cta: { label: string; href: string } };

type Props = {
  id: string;
  menuKey: string;
  columns: MenuColumn[];
  featuredCard?: FeaturedCard;
  open: boolean;
};

// Column widths measured from the reference panels at 1440px (analysis/measurements/panel-styles.json).
const layouts: Record<string, { width: number; columns: string }> = {
  platform: { width: 545, columns: '166px 213px 166px' },
  solutions: { width: 336, columns: '336px' },
  resources: { width: 768, columns: '192px 192px 384px' },
};

function Column({ column }: { column: MenuColumn }) {
  return (
    <div className="xl:mb-2">
      {column.heading ? <h3 className="text-base leading-6 mb-4 font-semibold text-gray-800">{column.heading}</h3> : null}
      <ul className="list-none p-0 m-0 grid gap-y-5">
        {column.links.map((l) => (
          <MenuLinkItem key={l.label + l.href} link={l} tone="light" />
        ))}
      </ul>
    </div>
  );
}

/** Desktop (≥1152px) dropdown panel; positioned against the nav list like the reference. */
export function MegaMenuPanel({ id, menuKey, columns, featuredCard, open }: Props) {
  const layout = layouts[menuKey] ?? { width: 336, columns: '1fr' };
  // Resources stacks Support + "Hang out with us" in its second column.
  const groups: MenuColumn[][] = menuKey === 'resources' ? [[columns[0]], columns.slice(1)] : columns.map((c) => [c]);

  return (
    <div
      id={id}
      className={`mega-panel absolute top-12 left-0 bg-white shadow-lg rounded-xl overflow-hidden z-[9999] leading-8 ${open ? 'block' : 'hidden'}`}
      style={{ width: layout.width }}
    >
      <div className="grid h-full" style={{ gridTemplateColumns: layout.columns }}>
        {groups.map((group, i) => (
          <div key={i} className={`p-6 self-stretch ${group[0].featured ? 'bg-featured-light' : ''}`}>
            {group.map((c, j) => (
              <div key={j} className={j > 0 ? 'mt-1' : ''}>
                <Column column={c} />
              </div>
            ))}
          </div>
        ))}
        {featuredCard ? (
          <div className="p-6 self-stretch bg-featured-light flex flex-col">
            <img src={featuredCard.image} alt={featuredCard.alt} width={336} height={142} className="w-full h-auto rounded-md" />
            <h3 className="mt-4 mb-4 text-xl leading-[25px] font-semibold text-gray-900">{featuredCard.title}</h3>
            <p className="mt-3 mb-4 text-sm leading-5 text-gray-700">{featuredCard.body}</p>
            <div className="mt-auto pt-6">
              <ButtonLink variant="secondary-light" href={featuredCard.cta.href}>
                {featuredCard.cta.label}
              </ButtonLink>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
