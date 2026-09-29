import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App runtime error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, color: '#ff4b16', background: '#080909', minHeight: '100vh', fontFamily: 'sans-serif' }}>
          <h2>Ошибка при загрузке интерфейса</h2>
          <pre style={{ background: '#171b1f', padding: 12, borderRadius: 8, color: '#f4f4f4', fontSize: 13, overflowX: 'auto' }}>
            {this.state.error?.toString() || 'Неизвестная ошибка'}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: 12, padding: '8px 16px', background: '#16f0c2', color: '#000', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' }}
          >
            Перезагрузить страницу
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
} else {
  console.error('Root element #root not found in document!');
}

