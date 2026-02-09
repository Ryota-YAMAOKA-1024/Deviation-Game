import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import PageShell from '../components/PageShell.jsx';
import { getNickname } from '../lib/session.js';
import { createSubmitAnswerUsecase } from '../lib/usecases/submitAnswer.js';

const submitAnswerUsecase = createSubmitAnswerUsecase();

export default function AnswerScreenPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { gameId } = useParams();
  const nickname = getNickname();
  const isLoggedIn = Boolean(nickname);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const resultPath = useMemo(() => `/game/${gameId}/result`, [gameId]);

  useEffect(() => {
    if (isLoggedIn) return;
    const currentPath = `${location.pathname}${location.search}`;
    const redirectTo = encodeURIComponent(currentPath);
    navigate(`/quick-signup?redirectTo=${redirectTo}`, { replace: true });
  }, [isLoggedIn, location.pathname, location.search, navigate]);

  if (!isLoggedIn) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting || isSubmitted) return;

    setError('');
    setIsSubmitting(true);
    const result = await submitAnswerUsecase.execute({
      gameId,
      userId: nickname,
      answer
    });
    setIsSubmitting(false);

    if (!result.ok) {
      setError(`${result.message} (${result.errorCode})`);
      return;
    }

    setIsSubmitted(true);
    navigate(resultPath);
  };

  return (
    <PageShell title="AnswerScreen" description="回答画面">
      <div className="card">
        <p className="card-title">スケッチを見て回答してください</p>
        <p className="card-text">参加者: {nickname}</p>
        <div className="answer-preview">スケッチ表示エリア（Track B実装対象）</div>
      </div>

      <form className="card form-stack" onSubmit={handleSubmit}>
        <label className="form-label" htmlFor="answer-input">
          回答
        </label>
        <input
          id="answer-input"
          className="text-input"
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          placeholder="何が描かれているか入力"
          maxLength={40}
          disabled={isSubmitting || isSubmitted}
        />
        {error ? <p className="form-error">{error}</p> : null}
        <p className="answer-note">送信後は ResultScreen に遷移し、結果公開を待機します。</p>
        <button type="submit" className="primary-button" disabled={isSubmitting || isSubmitted}>
          {isSubmitting ? '送信中...' : '回答する'}
        </button>
      </form>
    </PageShell>
  );
}
