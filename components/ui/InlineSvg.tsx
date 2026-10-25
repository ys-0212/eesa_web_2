import type { ElementType, HTMLAttributes } from 'react';
import { svgs, type SvgName } from '@/src/svgs';

type Props = HTMLAttributes<HTMLElement> & {
  /** Named artwork from src/svgs.ts, or raw (trusted, local) SVG markup. */
  name?: SvgName;
  markup?: string;
  as?: ElementType;
};

/**
 * Renders original inline-SVG artwork as the direct child of a wrapper element, matching the
 * reference DOM shape so wrapper selectors such as `.logo-svg > svg` apply unchanged.
 */
export function InlineSvg({ name, markup, as: Tag = 'span', ...rest }: Props) {
  const html = markup ?? (name ? svgs[name] : '');
  return <Tag {...rest} dangerouslySetInnerHTML={{ __html: html }} />;
}
