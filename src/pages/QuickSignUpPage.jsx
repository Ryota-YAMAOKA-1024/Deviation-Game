import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PageShell from '../components/PageShell.jsx';
import { getNickname, setNickname } from '../lib/session.js';

export default function QuickSignUpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const redirectTo = query.get('redirectTo') || '/';
  const existingNickname = getNickname();
  const [nickname, setNicknameInput] = useState(existingNickname);
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = nickname.trim();

    if (!trimmed) {
      setError('ニックネームを入力してください。');
      return;
    }

    setNickname(trimmed);
    navigate(redirectTo);
  };

  return (
    <PageShell title="QuickSignUp" description="簡易登録">
      <div className="card">
        <p className="card-title">ニックネーム登録</p>
        <p className="card-text">未登録時のみ入力します。登録後は元の画面に戻ります。</p>
      </div>

      <form className="card form-stack" onSubmit={handleSubmit}>
        <label className="form-label" htmlFor="nickname">
          ニックネーム
        </label>
        <input
          id="nickname"
          className="text-input"
          value={nickname}
          onChange={(event) => setNicknameInput(event.target.value)}
          placeholder="例: yamaoka"
          maxLength={20}
        />
        {error ? <p className="form-error">{error}</p> : null}
        <button type="submit" className="primary-button">
          登録して進む
        </button>
      </form>
    </PageShell>
  );
}
