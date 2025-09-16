'use client';

export default function Error({ 
  title = 'Something went wrong', 
  message = 'An unexpected error occurred. Please try again.', 
  onRetry = null,
  showRetry = true 
}) {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {message}
        </p>
        {showRetry && onRetry && (
          <button
            onClick={onRetry}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

export function ErrorBoundary({ error, resetErrorBoundary }) {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Something went wrong
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          An unexpected error occurred. Please try refreshing the page.
        </p>
        <button
          onClick={resetErrorBoundary}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

export function NotFound({ 
  title = 'Page not found', 
  message = 'The page you are looking for does not exist.',
  showBackButton = true 
}) {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 6.291A7.962 7.962 0 0012 5c-2.34 0-4.29 1.009-5.824 2.709" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {message}
        </p>
        {showBackButton && (
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Go Back
          </button>
        )}
      </div>
    </div>
  );
}
