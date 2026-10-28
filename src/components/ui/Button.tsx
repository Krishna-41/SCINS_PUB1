import { type ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-teal-600 text-white hover:bg-teal-700 focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 shadow-sm',
  secondary:
    'bg-navy-800 text-white hover:bg-navy-900 focus:ring-2 focus:ring-navy-600 focus:ring-offset-2 shadow-sm',
  outline:
    'border border-navy-200 text-navy-700 hover:border-teal-400 hover:text-teal-600 bg-white focus:ring-2 focus:ring-teal-300',
  ghost:
    'text-navy-600 hover:bg-navy-50 hover:text-navy-900 focus:ring-2 focus:ring-navy-200',
  danger:
    'bg-error-500 text-white hover:bg-error-600 focus:ring-2 focus:ring-error-400 focus:ring-offset-2 shadow-sm',
};

const sizeClasses: Record<Size, string> = {
  sm: 'text-sm px-3 py-1.5 rounded-md gap-1.5',
  md: 'text-sm px-4 py-2.5 rounded-lg gap-2',
  lg: 'text-base px-6 py-3 rounded-lg gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
