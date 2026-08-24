// frontend/src/components/SimpleView.jsx
import { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Terminal, 
  Layers, 
  ArrowRight, 
  Check, 
  Copy, 
  Radio, 
  Server, 
  Bug, 
  Globe 
} from 'lucide-react';

export default function SimpleView({ data }) {
  const [showQuery, setShowQuery] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!data) return null;

  const isCritical = data.riskLevel === 'Critical';
  const isHigh = data.riskLevel === 'High';

  const riskBadgeStyle = isCritical
    ? { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)', text: '#F87171', glow: '0 0 16px rgba(239, 68, 68, 0.25)' }
    : isHigh
    ? { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)', text: '#FBBF24', glow: '0 0 16px rgba(245, 158, 11, 0.25)' }
    : { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)', text: '#34D399', glow: '0 0 16px rgba(16, 185, 129, 0.25)' };

  const handleCopy = () => {
    navigator.clipboard.writeText(data.rawCypher);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to render icon by entity format
  const getEntityIcon = (item) => {
    if (item.includes('.')) {
      return item.match(/\d+\.\d+\.\d+\.\d+/) ? <Server size={14} color="#38BDF8" /> : <Globe size={14} color="#34D399" />;
    }
    return <Bug size={14} color="#F87171" />;
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
      
      {/* Indicator Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', fontWeight: '700' }}>
            Target Indicator
          </span>
          <h2 style={{ margin: '0.25rem 0 0 0', fontSize: '1.75rem', fontWeight: '800', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Radio size={22} color="#38BDF8" />
            {data.indicator}
          </h2>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          borderRadius: '9999px',
          backgroundColor: riskBadgeStyle.bg,
          border: `1px solid ${riskBadgeStyle.border}`,
          boxShadow: riskBadgeStyle.glow,
          color: riskBadgeStyle.text,
          fontWeight: '700',
          fontSize: '0.875rem'
        }}>
          {isCritical || isHigh ? <ShieldAlert size={18} /> : <ShieldCheck size={18} />}
          {data.riskLevel} Risk Severity
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.5rem' }}>Associated Campaigns</div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#818CF8' }}>
            {data.summary.associatedCampaigns.length ? data.summary.associatedCampaigns.join(', ') : 'None Detected'}
          </div>
        </div>

        <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.5rem' }}>Active Malware Strains</div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#F87171' }}>
            {data.summary.associatedMalware.length ? data.summary.associatedMalware.join(', ') : 'None'}
          </div>
        </div>

        <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.5rem' }}>Infrastructure Breadth</div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#38BDF8' }}>
            {data.summary.totalConnectedEntities} Linked Entities
          </div>
        </div>
      </div>

      {/* Analyst Actionable Takeaway Box */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))',
        border: '1px solid rgba(56, 189, 248, 0.2)',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38BDF8', fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
          <Layers size={18} />
          Analyst Intelligence Takeaway
        </div>
        <p style={{ margin: 0, color: '#cbd5e1', lineHeight: '1.6', fontSize: '0.975rem' }}>
          {data.takeaway}
        </p>
      </div>

      {/* Minimal Visual Trail */}
      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
          Discovery Connection Trail
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
          {data.visualTrail.map((item, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                background: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '0.5rem 0.9rem',
                borderRadius: '8px',
                color: '#f1f5f9',
                fontSize: '0.875rem',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
              }}>
                {getEntityIcon(item)}
                {item}
              </div>
              {index < data.visualTrail.length - 1 && (
                <ArrowRight size={16} color="#64748b" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Technical Reviewer Terminal Section */}
      <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.5rem' }}>
        <button 
          onClick={() => setShowQuery(!showQuery)}
          style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#94a3b8',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s'
          }}
        >
          <Terminal size={15} />
          {showQuery ? 'Hide Cypher Execution' : 'Inspect Raw Cypher Query'}
        </button>

        {showQuery && (
          <div style={{
            marginTop: '1rem',
            background: '#030712',
            border: '1px solid #1f2937',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 1rem', background: '#111827', borderBottom: '1px solid #1f2937' }}>
              <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'monospace' }}>openCypher (Bolt)</span>
              <button 
                onClick={handleCopy}
                style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}
              >
                {copied ? <Check size={14} color="#34D399" /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy'}
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