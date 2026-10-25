'use client';

import { useId, useState } from 'react';
import type { MenuLink, MobileNode } from '@/src/content';
import { InlineSvg } from './InlineSvg';
import { MenuLinkItem } from './MenuLinkItem';

const isNode = (n: MobileNode | MenuLink): n is MobileNode => 'children' in n;

function Collapsible({ node, depth }: { node: MobileNode; depth: number }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const links = node.children.filter((c): c is MenuLink => !isNode(c));
  const onlyLinks = links.length === node.children.length;

  return (
    <div className="mb-2 last:mb-0">
      <button
        type="button"
        id={`trigger-${id}`}
        aria-expanded={open}
        aria-controls={`content-${id}`}
        onClick={() => setOpen((v) => !v)}
        className="btn-new btn-silent w-full !justify-start text-left !px-4"
      >
        {/* Nested .label mirrors the reference markup (affects glyph position inside the 1em box). */}
        <span className="label">
          <span className="label font-medium text-sm leading-[18px] uppercase font-sans">{node.label}</span>
        </span>
        <InlineSvg name="chevronRight" className="chevron !ml-auto !mr-0" aria-hidden="true" />
      </button>
      <div id={`content-${id}`} hidden={!open} className="pl-4">
        {onlyLinks ? (
          <ul className="linklist-dark list-none p-0 m-0 grid gap-2 mt-2">
            {links.map((l) => (
              <MenuLinkItem key={l.label + l.href} link={l} tone="dark" />
            ))}
          </ul>
        ) : (
          <div className="mt-2">
            {node.children.map((c) =>
              isNode(c) ? (
                <Collapsible key={c.label} node={c} depth={depth + 1} />
              ) : (
                <ul key={c.label + c.href} className="linklist-dark list-none p-0 m-0 mb-2">
                  <MenuLinkItem link={c} tone="dark" />
                </ul>
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/** Nested accordion used below the xl breakpoint. */
export function MobileMenu({ tree }: { tree: MobileNode[] }) {
  return (
    <div className="mt-4">
      {tree.map((n) => (
        <div key={n.label} className="mb-4">
          <Collapsible node={n} depth={0} />
        </div>
      ))}
    </div>
  );
}
