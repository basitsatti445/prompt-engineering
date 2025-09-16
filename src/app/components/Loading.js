export default function Loading({ size = 'md', text = 'Loading...' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-200 border-t-blue-600`}></div>
      {text && (
        <p className="text-gray-600 dark:text-gray-400 text-sm">{text}</p>
      )}
    </div>
  );
}

export function LoadingSpinner({ size = 'sm' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-200 border-t-blue-600`}></div>
  );
}

export function LoadingCard() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6 animate-pulse">
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
        <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-full"></div>
        <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-2/3"></div>
        <div className="flex space-x-2">
          <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded-full w-16"></div>
          <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded-full w-20"></div>
        </div>
      </div>
    </div>
  );
}

export function LoadingGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <LoadingCard key={index} />
      ))}
    </div>
  );
}
