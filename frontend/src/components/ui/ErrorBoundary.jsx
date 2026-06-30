import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an uncaught exception:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#fbf9f6] text-[#1b1c1a] flex items-center justify-center p-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          <div className="noise-filter" />
          <div className="max-w-md w-full bg-white border border-[#EDE7E1] rounded-2xl shadow-lg p-8 text-center relative overflow-hidden">
            <div className="mx-auto bg-red-50 p-4 rounded-full text-[#BE1F2E] w-16 h-16 flex items-center justify-center border border-[#BE1F2E]/10 mb-6">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h2 className="font-serif text-[28px] italic leading-none mb-3 text-[#1A1210]">
              Application Error
            </h2>
            <p className="text-sm text-[#5A5A5A] leading-relaxed mb-6">
              A runtime exception has occurred. Please reload the console to reset your secure session state.
            </p>
            {this.state.error && (
              <pre className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EDE7E1] text-[11px] text-[#7A5F5F] text-left overflow-x-auto font-mono mb-6 max-h-32">
                {this.state.error.toString()}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              className="w-full btn-primary flex items-center justify-center gap-2"
              style={{ minHeight: 48 }}
            >
              <RotateCcw className="h-4 w-4" />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
