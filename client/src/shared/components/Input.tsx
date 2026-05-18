import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  leftIcon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, className = '', id, ...rest }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-300">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={[
              'w-full rounded-xl border bg-surface-800 text-slate-100 placeholder-slate-500',
              'px-4 py-2.5 text-sm transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500',
              error ? 'border-red-500/60' : 'border-slate-700 hover:border-slate-600',
              leftIcon ? 'pl-10' : '',
              className,
            ].join(' ')}
            {...rest}
          />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    )
  },
)

Input.displayName = 'Input'
