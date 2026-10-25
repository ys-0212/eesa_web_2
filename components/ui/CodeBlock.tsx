'use client';

import { useRef, useState } from 'react';
import type { SnippetToken } from '@/src/snippets';
import { gettingStarted } from '@/src/content';
import { InlineSvg } from './InlineSvg';

const MESSAGE_MS = 2000;

/** Shiki-coloured code panel with a language header and copy button ("Copied!" for 2 s). */
export function CodeBlock({ lang, lines, tabbable }: { lang?: string; lines: SnippetToken[][]; tabbable: boolean }) {
  const [message, setMessage] = useState('');
  const preRef = useRef<HTMLPreElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const copy = async () => {
    const text = preRef.current?.textContent ?? '';
    try {
      await navigator.clipboard.writeText(text);
      setMessage(gettingStarted.copiedMessage);
    } catch {
      setMessage(gettingStarted.copyFailedMessage);
    }
    const focused = document.activeElement;
    setTimeout(() => {
      setMessage('');
      if (document.activeElement === focused) btnRef.current?.focus();
    }, MESSAGE_MS);
  };

  return (
    <div className="code-wrapper">
      <div className="code-header">
        <span className="code-language">{lang}</span>
        <span className="code-header-actions">
          <span className={`copied-message ${message ? 'visible' : ''}`} role="status">
            {message}
          </span>
          <button
            ref={btnRef}
            type="button"
            className="copy-button"
            aria-label={gettingStarted.copyLabel}
            onClick={copy}
            tabIndex={tabbable ? 0 : -1}
            style={message ? { opacity: 0, pointerEvents: 'none' } : undefined}
          >
            <InlineSvg name="copyIcon" className="contents" aria-hidden="true" />
          </button>
        </span>
      </div>
      <pre ref={preRef}>
        <code>
          {lines.map((line, i) => (
            <span key={i}>
              <span className="line">
                {line.map(([text, color], j) => (
                  <span key={j} style={color ? { color } : undefined}>
                    {text}
                  </span>
                ))}
              </span>
              {i < lines.length - 1 ? '\n' : null}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
