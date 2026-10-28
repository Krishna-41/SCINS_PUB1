import {
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  type SelectHTMLAttributes,
  type ReactNode,
  forwardRef,
} from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const baseFieldClasses =
  'w-full rounded-lg border border-navy-200 bg-white px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-navy-300 focus:border-teal-400 focus:ring-2 focus:ring-teal-200 focus:outline-none transition-all disabled:bg-navy-50 disabled:text-navy-400';

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-navy-700">
            {label}
            {props.required && <span className="text-error-500 ml-0.5">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`${baseFieldClasses} ${error ? 'border-error-400 focus:border-error-400 focus:ring-error-200' : ''} ${className}`}
          {...props}
        />
        {error ? (
          <p className="text-xs text-error-600">{error}</p>
        ) : hint ? (
          <p className="text-xs text-navy-400">{hint}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = 'Input';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-navy-700">
            {label}
            {props.required && <span className="text-error-500 ml-0.5">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={`${baseFieldClasses} min-h-[120px] resize-y ${error ? 'border-error-400 focus:border-error-400 focus:ring-error-200' : ''} ${className}`}
          {...props}
        />
        {error ? (
          <p className="text-xs text-error-600">{error}</p>
        ) : hint ? (
          <p className="text-xs text-navy-400">{hint}</p>
        ) : null}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className = '', id, children, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-navy-700">
            {label}
            {props.required && <span className="text-error-500 ml-0.5">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={`${baseFieldClasses} ${error ? 'border-error-400 focus:border-error-400 focus:ring-error-200' : ''} ${className}`}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-xs text-error-600">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
