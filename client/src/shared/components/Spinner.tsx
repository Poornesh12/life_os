import React from 'react'

export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }
  return (
    <div
      className={`${sizes[size]} rounded-full border-2 border-slate-700 border-t-indigo-500 animate-spin`}
    />
  )
}

export const PageLoader: React.FC = () => (
  <div className="flex h-full items-center justify-center min-h-[60vh]">
    <Spinner size="lg" />
  </div>
)
