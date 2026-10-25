import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const config = [
  ...nextVitals,
  ...nextTs,
  {
    ignores: ['.next/**', 'node_modules/**', 'analysis/**', '.rea-browser/**', 'playwright-report/**', 'test-results/**', 'next-env.d.ts'],
  },
  {
    // Recon / comparison tooling runs in Node, not in the app bundle.
    files: ['scripts/**/*.mjs'],
    rules: { 'no-console': 'off' },
  },
];

export default config;
