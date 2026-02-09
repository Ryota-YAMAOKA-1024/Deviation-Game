import { useParams } from 'react-router-dom';
import PageShell from '../components/PageShell.jsx';

export default function PlaceholderPage({ title, description, links }) {
  const params = useParams();
  const hasParams = Object.keys(params).length > 0;
  const isDistanceMode = title === 'DistanceMode';
  const isDrawingScreen = title === 'DrawingScreen';
  const isWaitingScreen = title === 'WaitingScreen';

  return (
    <PageShell title={title} description={description}>
      {hasParams ? (
        <div className="param-box">
          <p className="param-title">Params</p>
          <pre>{JSON.stringify(params, null, 2)}</pre>
        </div>
      ) : null}
      <div className="card">
        <p className="card-title">未実装の部品</p>
        <p className="card-text">
          この画面は構成確認用のプレースホルダです。後で機能ブロックを接続します。
          {isDistanceMode
            ? ' なお、DistanceMode 画面は機能としては Topic Selection（お題選択）画面です。'
            : ''}
          {isDrawingScreen
            ? ' DrawingScreen は画面を開いた時点で90秒カウントを開始し、90秒経過時は WaitingScreen へ自動遷移します。'
            : ''}
          {isWaitingScreen
            ? ' WaitingScreen では招待共有用URLをコピーできる機能を提供します。なお、共有するURLは ChallengeConfirm（/challenge/:inviteCode）へのリンクです。'
            : ''}
        </p>
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
