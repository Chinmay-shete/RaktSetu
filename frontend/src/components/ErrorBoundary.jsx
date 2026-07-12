import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-screen" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          fontFamily: 'system-ui, sans-serif',
          background: '#fdfbfa',
          color: '#333',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#BE1F2E', fontSize: '2rem', marginBottom: '16px' }}>Something went wrong</h2>
          <p style={{ color: '#666', marginBottom: '24px', maxWidth: '400px' }}>
            There was an error loading this portal view. Please refresh the page or try again.
          </p>
          <button 
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
            style={{
              background: '#BE1F2E',
              color: '#fff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '30px',
              fontSize: '15px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(190, 31, 46, 0.15)',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#9e1a26'}
            onMouseOut={(e) => e.target.style.background = '#BE1F2E'}
          >
            Refresh Portal
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
export default ErrorBoundary;
