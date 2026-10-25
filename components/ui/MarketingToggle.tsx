import { marketingToggle } from '@/src/content';
import { InlineSvg } from './InlineSvg';

/** Fixed "Marketing Mode: ON" switch. Like the reference it simply links to the no-marketing page. */
export function MarketingToggle() {
  return (
    <a href={marketingToggle.href} className="toggle-container" aria-label={marketingToggle.ariaLabel}>
      <span className="toggle-label">{marketingToggle.label}</span>
      <span className="toggle-wrapper">
        <InlineSvg name="botIcon" className="chat-bot-icon flex" aria-hidden="true" />
        <span className="toggle-track" aria-hidden="true">
          <span className="toggle-thumb" />
        </span>
      </span>
    </a>
  );
}
