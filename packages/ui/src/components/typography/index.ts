import {
  Typography,
  type TypographyProps,
  type TypographyVariant,
  type TypographyWeight,
} from './typography';

export { Typography };
export type { TypographyProps, TypographyVariant, TypographyWeight };

// Variant 컴포넌트들
export const H1 = (props: Omit<TypographyProps, 'variant'>) =>
  Typography({ variant: 'h1', ...props });
export const H2 = (props: Omit<TypographyProps, 'variant'>) =>
  Typography({ variant: 'h2', ...props });
export const H3 = (props: Omit<TypographyProps, 'variant'>) =>
  Typography({ variant: 'h3', ...props });
export const H4 = (props: Omit<TypographyProps, 'variant'>) =>
  Typography({ variant: 'h4', ...props });
export const H5 = (props: Omit<TypographyProps, 'variant'>) =>
  Typography({ variant: 'h5', ...props });
export const H6 = (props: Omit<TypographyProps, 'variant'>) =>
  Typography({ variant: 'h6', ...props });
export const Subtitle1 = (props: Omit<TypographyProps, 'variant'>) =>
  Typography({ variant: 'subtitle1', ...props });
export const Subtitle2 = (props: Omit<TypographyProps, 'variant'>) =>
  Typography({ variant: 'subtitle2', ...props });
export const Body1 = (props: Omit<TypographyProps, 'variant'>) =>
  Typography({ variant: 'body1', ...props });
export const Body2 = (props: Omit<TypographyProps, 'variant'>) =>
  Typography({ variant: 'body2', ...props });
export const Caption = (props: Omit<TypographyProps, 'variant'>) =>
  Typography({ variant: 'caption', ...props });
export const Overline = (props: Omit<TypographyProps, 'variant'>) =>
  Typography({ variant: 'overline', ...props });
