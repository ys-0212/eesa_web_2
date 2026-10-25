import type { CSSProperties, ReactNode } from 'react';

type Props = {
  children: ReactNode;
  /** CSS `background` shorthand (incl. size) for the decorative layer; omit for a fade-only wrapper. */
  background?: string;
  blendMode?: CSSProperties['backgroundBlendMode'];
  fadeTop?: boolean;
  fadeBottom?: boolean;
  /** Height of each fade, e.g. "30%". */
  gradientHeight?: string;
  fadeColor?: string;
};

/** Section-group wrapper: absolutely positioned background art plus top/bottom colour fades. */
export function BackgroundLayer({ children, background, blendMode, fadeTop, fadeBottom, gradientHeight = '30%', fadeColor = '#181225' }: Props) {
  return (
    <div
      className="bg-wrapper"
      data-fade-top={fadeTop ? 'true' : 'false'}
      data-fade-bottom={fadeBottom ? 'true' : 'false'}
      style={{ '--gradient-height': gradientHeight, '--fade-color': fadeColor } as CSSProperties}
    >
      {background ? (
        <div className="bg-layer" aria-hidden="true" style={{ background, backgroundBlendMode: blendMode }} />
      ) : null}
      <div className="bg-content">{children}</div>
    </div>
  );
}
