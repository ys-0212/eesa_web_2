import type { AnchorHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary-dark' | 'secondary-dark' | 'secondary-light' | 'default' | 'snackbar' | 'silent';

const variantClass: Record<ButtonVariant, string> = {
  'primary-dark': 'btn-primary-dark',
  'secondary-dark': 'btn-secondary-dark',
  'secondary-light': 'btn-secondary-light',
  default: 'btn-default',
  snackbar: 'btn-snackbar',
  silent: 'btn-silent',
};

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant: ButtonVariant;
  children: ReactNode;
  external?: boolean;
};

/** `btn-new` anchor in one of the reference button variants. */
export function ButtonLink({ variant, children, className = '', external, ...rest }: Props) {
  return (
    <a
      className={`btn-new ${variantClass[variant]} ${className}`}
      {...(external ? { target: '_blank', rel: 'noopener' } : {})}
      {...rest}
    >
      <span className="label">{children}</span>
    </a>
  );
}
