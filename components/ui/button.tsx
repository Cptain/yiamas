import { Button as ButtonPrimitive } from '@base-ui/react/button'

import { cn } from '@/lib/utils'

type Variant = 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link'
type Size = 'default' | 'xs' | 'sm' | 'lg' | 'xl' | '2xl' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg'

const VARIANT_CLASS: Record<Variant, string> = {
  default: 'btn--primary',
  outline: 'btn--outline',
  secondary: 'btn--secondary',
  ghost: 'btn--ghost',
  destructive: 'btn--destructive',
  link: 'btn--link',
}

const SIZE_CLASS: Record<Size, string> = {
  default: 'btn--md',
  xs: 'btn--xs',
  sm: 'btn--sm',
  lg: 'btn--lg',
  xl: 'btn--xl',
  '2xl': 'btn--2xl',
  icon: 'btn--icon',
  'icon-xs': 'btn--icon-xs',
  'icon-sm': 'btn--icon-sm',
  'icon-lg': 'btn--icon-lg',
}

type ButtonProps = Omit<ButtonPrimitive.Props, 'className'> & {
  variant?: Variant
  size?: Size
  className?: string
}

function Button({ className, variant = 'default', size = 'default', ...props }: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn('btn', VARIANT_CLASS[variant], SIZE_CLASS[size], className)}
      {...props}
    />
  )
}

export { Button }
