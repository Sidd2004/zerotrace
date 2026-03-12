import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#060606] text-white p-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center mb-6 text-3xl">
            ⚠️
          </div>
          <h1 className="font-bold text-2xl mb-2">Something went wrong</h1>
          <p className="text-gray-400 text-sm mb-6 text-center max-w-md">
            An unexpected error occurred while rendering this page. Please try refreshing.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.href = '/';
            }}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Go Home
          </button>
          {import.meta.env.DEV && this.state.error && (
            <pre className="mt-6 p-4 bg-gray-900 rounded-xl text-red-400 text-xs max-w-2xl overflow-auto">
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
