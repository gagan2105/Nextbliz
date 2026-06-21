import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
          <div className="card max-w-lg w-full text-center">
            <h1 className="text-xl font-bold text-red-600 mb-2">Something went wrong</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{this.state.error.message}</p>
            <button
              className="btn-primary"
              onClick={() => {
                localStorage.removeItem('nxtbiz-auth');
                localStorage.removeItem('nxtbiz-theme');
                window.location.href = '/login';
              }}
            >
              Clear session & reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
