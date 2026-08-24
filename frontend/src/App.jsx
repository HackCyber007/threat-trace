// frontend/src/App.jsx
import { useState } from 'react';
import { getIndicatorSummary, getIndicatorGraph, getHiddenLinks } from './services/api';
import SimpleView from './components/SimpleView';
import DeveloperView from './components/DeveloperView';
import HiddenLinks from './components/HiddenLinks';
import { Shield, Search, Terminal, Network, GitMerge, AlertCircle, Loader2 } from 'lucide-react';

function App() {
  const [view, setView] = useState('simple');
  const [indicator, setIndicator] = useState('103.45.67.89');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!indicator.trim()) return;

    setLoading(true);
    setError(null);
    setData(null);

    try {
      let result;
      if (view === 'simple') {
        result = await getIndicatorSummary(indicator);
      } else if (view === 'developer') {
        result = await getIndicatorGraph(indicator);
      } else {
        result = await getHiddenLinks();
      }
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      
      {/* App Header */}
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #38BDF8, #818CF8)', padding: '0.5rem', borderRadius: '10px', display: 'flex' }}>
              <Shield size={24} color="#080c14" />
            </div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#f8fafc' }}>
              Threat Trace
            </h1>
          </div>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>
            Multi-Hop Graph Intelligence & IOC Correlation
          </p>
        </div>

        {/* View Switcher Tabs */}
        <nav style={{ display: 'flex', background: 'rgba(30, 41, 59, 0.6)', padding: '0.35rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
          {[
            { id: 'simple', label: 'Simple View', icon: <Shield size={16} /> },
            { id: 'developer', label: 'Developer Canvas', icon: <Network size={16} /> },
            { id: 'hidden-links', label: 'Cross-Campaign Links', icon: <GitMerge size={16} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setView(tab.id); setData(null); setError(null); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.1rem',
                border: 'none',
                background: view === tab.id ? 'linear-gradient(135deg, #38BDF8, #6366F1)' : 'transparent',
                color: view === tab.id ? '#080c14' : '#94a3b8',
                fontWeight: view === tab.id ? '700' : '500',
                cursor: 'pointer',
                borderRadius: '8px',
                transition: 'all 0.2s',
                fontSize: '0.875rem'
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <main>
        {/* Search Input Bar */}
        {view !== 'hidden-links' ? (
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', marginBottom: '2.5rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={20} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={indicator}
                onChange={(e) => setIndicator(e.target.value)}
                placeholder="Search IP (103.45.67.89), Domain (update-service-sys.com), or Hash..."
                style={{
                  width: '100%',
                  padding: '1rem 1rem 1rem 3rem',
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  color: '#f8fafc',
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                padding: '0 2rem',
                background: 'linear-gradient(135deg, #38BDF8, #818CF8)',
                color: '#080c14',
                fontWeight: '700',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
            >
              Investigate
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <button
              onClick={() => handleSearch()}
              style={{
                padding: '1rem 2rem',
                background: 'linear-gradient(135deg, #38BDF8, #818CF8)',
                color: '#080c14',
                fontWeight: '700',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '1rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
            >
              <GitMerge size={20} />
              Detect Hidden Infrastructure Links
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
            <Loader2 size={36} color="#38BDF8" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }} />
            <div>Traversing multi-hop graph paths in CognoDB...</div>
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#F87171',
            padding: '1.25rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Render Active View */}
        {data && !loading && !error && (
          <div>
            {view === 'simple' && <SimpleView data={data} />}
            {view === 'developer' && <DeveloperView data={data} />}
            {view === 'hidden-links' && <HiddenLinks data={data} />}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;