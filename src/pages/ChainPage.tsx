import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { loadAllTraces, getTraceById, getChainForTrace } from '@/lib/data';
import type { ExplorerTrace } from '@/types/trace';
import { CausalChainFull } from '@/components/CausalChain';
import { ArrowLeft, GitBranch } from 'lucide-react';

export function ChainPage() {
  const { dataset, id } = useParams<{ dataset: string; id: string }>();
  const [trace, setTrace] = useState<ExplorerTrace | null>(null);
  const [chain, setChain] = useState<ExplorerTrace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dataset || !id) return;
    setLoading(true);
    loadAllTraces(dataset).then(() => {
      const t = getTraceById(id);
      if (t) {
        setTrace(t);
        setChain(getChainForTrace(id));
      }
    }).finally(() => setLoading(false));
  }, [dataset, id]);

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        Loading chain...
      </div>
    );
  }

  if (!trace) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Trace not found</p>
        <Link to={`/d/${dataset}`} style={{ color: 'var(--accent)', fontSize: 13 }}>
          Back to explorer
        </Link>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <div style={{
        maxWidth: 900,
        margin: '0 auto',
        padding: '24px 24px 60px',
      }}>
        {/* Breadcrumb */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 32,
        }}>
          <Link
            to={`/d/${dataset}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              color: 'var(--text-muted)',
            }}
          >
            <ArrowLeft size={14} />
            Back to explorer
          </Link>
        </div>

        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: 40,
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 16px',
            borderRadius: 20,
            background: 'var(--accent-dim)',
            border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
            marginBottom: 16,
          }}>
            <GitBranch size={14} style={{ color: 'var(--accent)' }} />
            <span style={{
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--accent)',
            }}>
              Causal Chain
            </span>
          </div>

          <h1 style={{
            fontSize: 24,
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            marginBottom: 8,
            lineHeight: 1.3,
            maxWidth: 600,
            margin: '0 auto 8px',
          }}>
            {trace.content}
          </h1>

          <p style={{
            fontSize: 14,
            color: 'var(--text-muted)',
          }}>
            {chain.length} connected traces spanning{' '}
            {chain.length > 0
              ? `${chain[0].year_numeric < 0 ? `${Math.abs(chain[0].year_numeric)} BC` : chain[0].year_numeric} to ${chain[chain.length - 1].year_numeric}`
              : 'unknown period'
            }
          </p>
        </div>

        {/* Chain visualization */}
        <CausalChainFull
          chain={chain}
          highlightId={trace.id}
          datasetId={dataset || 'wars'}
        />
      </div>
    </div>
  );
}
