import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#262624] text-white p-4">
          <div className="max-w-md w-full bg-[#1a1a1a] rounded-lg p-6 text-center">
            <div className="text-6xl mb-4">😵</div>
            <h1 className="text-xl font-bold mb-2">Oops! Something went wrong</h1>
            <p className="text-[#C2C0B6] mb-4">
              The app encountered an unexpected error. Please refresh the page or check your environment configuration.
            </p>
            
            {import.meta.env.DEV && this.state.error && (
              <details className="text-left text-sm text-gray-500 mt-4">
                <summary className="cursor-pointer mb-2">Error Details (Development)</summary>
                <pre className="bg-[#2a2a2a] p-2 rounded text-xs overflow-auto">
                  {this.state.error && this.state.error.toString()}
                  <br />
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-[#56a69f] text-[#1F1E1D] px-4 py-2 rounded font-medium hover:bg-[#4A8F88] transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
