
import { useState } from 'react';
import { 
  GitMerge, 
  Terminal, 
  Server, 
  Globe, 
  ShieldAlert, 
  Check, 
  Copy, 
  ArrowRightLeft, 
  Bug 
} from 'lucide-react';

export default function HiddenLinks({ data }) {
  const [showQuery, setShowQuery] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!data || !data.correlations) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(data.rawCypher);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '16px',
      padding: '2rem',
      boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)'
    }}>
      
      {/* View Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.75rem', fontWeight: '800', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <GitMerge size={24} color="#818CF8" />
          Cross-Campaign Correlation Analysis
        </h2>
        <p style={{ margin: 0, color: '#94a3b8' }}>
          Discovered <strong style={{ color: '#F87171' }}>{data.count}</strong> hidden links between distinct threat campaigns sharing infrastructure.
        </p>
      </div>

      {/* List of Found Correlations */}
      <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '2rem' }}>
        {data.correlations.map((corr, idx) => (
          <div key={idx} style={{ 
            background: 'rgba(30, 41, 59, 0.5)', 
            border: '1px solid rgba(255,255,255,0.05)', 
            borderRadius: '12px', 
            padding: '1.5rem' 
          }}>
            
            {/* Campaigns Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#818CF8' }}>{corr.campaignA}</div>
                <ArrowRightLeft size={20} color="#64748b" />
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#818CF8' }}>{corr.campaignB}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#F87171', fontSize: '0.875rem', fontWeight: '700', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem 1rem', borderRadius: '9999px' }}>
                <ShieldAlert size={16} /> Covert Link Detected
              </div>
            </div>

            {/* Shared Tech Details */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: '#030712', padding: '1.25rem', borderRadius: '8px', border: '1px solid #1f2937' }}>
              <div>
                <div style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Shared Infrastructure</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38BDF8', fontWeight: '700' }}>
                  {corr.sharedInfrastructure.type === 'IPAddress' ? <Server size={16} /> : <Globe size={16} />}
                  {corr.sharedInfrastructure.value}
                </div>
              </div>
              <div>
                <div style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Associated Malware Strains</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1' }}>
                  <Bug size={16} color="#F87171" />
                  {corr.malwareVariants.join(' & ')}
                </div>
              </div>
            </div>

            {/* Intelligence Insight */}
            <div style={{ marginTop: '1rem', color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.5', borderLeft: '3px solid #818CF8', paddingLeft: '1rem' }}>
              {corr.insight}
            </div>
            
          </div>
        ))}
      </div>

      {/* Technical Reviewer Terminal Section */}
      <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.5rem' }}>
        <button 
          onClick={() => setShowQuery(!showQuery)}
          style={{
            background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s'
          }}
        >
          <Terminal size={15} />
          {showQuery ? 'Hide Cypher Execution' : 'Inspect Raw Cypher Query'}
        </button>

        {showQuery && (
          <div style={{ marginTop: '1rem', background: '#030712', border: '1px solid #1f2937', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 1rem', background: '#111827', borderBottom: '1px solid #1f2937' }}>
              <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'monospace' }}>Variable-Depth Graph Traversal</span>
              <button onClick={handleCopy} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}>
                {copied ? <Check size={14} color="#34D399" /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre style={{ margin: 0, padding: '1.25rem', color: '#38BDF8', fontSize: '0.85rem', overflowX: 'auto', lineHeight: '1.5' }}>
              <code>{data.rawCypher}</code>
            </pre>
          </div>
        )}
      </div>

    </div>
  );
}