import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import PageShell from '../components/PageShell.jsx';
import { SAMPLE_IDS } from '../routes.js';
import { getNickname } from '../lib/session.js';

export default function ChallengeConfirmPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { inviteCode } = useParams();
  const nickname = getNickname();
  const isLoggedIn = Boolean(nickname);

  useEffect(() => {
    if (isLoggedIn) return;
    const currentPath = `${location.pathname}${location.search}`;
    const redirectTo = encodeURIComponent(currentPath);
    navigate(`/quick-signup?redirectTo=${redirectTo}`, { replace: true });
  }, [isLoggedIn, location.pathname, location.search, navigate]);

  if (!isLoggedIn) return null;

  const handleOpen = () => {
    navigate(`/game/${SAMPLE_IDS.gameId}/answer`);
  };

  return (
    <PageShell title="ChallengeConfirm" description="招待受け取り確認">
      <div className="card">
        <p className="card-title">招待を受け取りました</p>
        <p className="card-text">{nickname} さん、招待コード {inviteCode} の出題を開きますか？</p>
        <p className="card-text">開くと回答タイマーが始まる想定です。</p>
      </div>
      <div className="card action-row">
        <button type="button" className="primary-button" onClick={handleOpen}>
          開く
        </button>
      </div>
    </PageShell>
  );
}
