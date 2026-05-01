import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f8faff] flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="text-5xl mb-4">⚠️</div>
            <h1 className="text-[20px] font-bold text-[#0f172a] mb-2">Something went wrong</h1>
            <p className="text-[13px] text-[#64748b] mb-5 leading-relaxed">
              An unexpected error occurred. Please refresh the page.
            </p>
            <div className="flex gap-2.5 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="bg-[#1558c0] text-white px-5 py-2.5 rounded-lg text-[13px] font-bold hover:bg-[#1248a8] transition-colors"
              >
                Refresh page
              </button>
              <button
                onClick={() => { this.setState({ hasError: false }); window.location.href = '/' }}
                className="border border-[#e2e8f0] bg-white text-[#64748b] px-5 py-2.5 rounded-lg text-[13px] font-semibold hover:bg-gray-50"
              >
                Go home
              </button>
            </div>
            {import.meta.env.DEV && (
              <pre className="mt-5 text-left text-[11px] bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 overflow-auto max-h-40">
                {this.state.error?.toString()}
              </pre>
            )}
          </div>
        </div>
      )
    }
    return this.props.children
  }
}