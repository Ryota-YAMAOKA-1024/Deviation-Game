import { useParams } from 'react-router-dom';
import PageShell from '../components/PageShell.jsx';

export default function RealtimeModePage({ links }) {
  const { teamId } = useParams();

  return (
    <PageShell title="RealtimeMode" description="リアルタイムモード">
      <div className="card">
        <p className="card-title">現在開発中</p>
        <p className="card-text">
          リアルタイムモードは今回の実装範囲外です。遷移導線のみ確認できる状態にしています。
        </p>
      </div>

      <div className="param-box">
        <p className="param-title">Team</p>
        <pre>{JSON.stringify({ teamId }, null, 2)}</pre>
      </div>

      {links?.length ? (
        <div className="card">
          <p className="card-title">次の遷移</p>
          <div className="link-grid">
            {links.map((link) => (
              <a key={link.href} className="link-chip" href={link.href}>
                {link.label}
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}
