import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../components/PageShell.jsx';
import { clearNickname, getNickname, setNickname } from '../lib/session.js';

export default function UserHomePage({ links }) {
  const navigate = useNavigate();
  const initialNickname = getNickname();
  const [nickname, setNicknameInput] = useState(initialNickname);
  const [currentNickname, setCurrentNickname] = useState(initialNickname);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = nickname.trim();

    if (!trimmed) {
      setError('名前を入力してください。');
      setSaved(false);
      return;
    }

    setNickname(trimmed);
    setCurrentNickname(trimmed);
    setError('');
    setSaved(true);
  };

  const handleLogout = () => {
    clearNickname();
    setNicknameInput('');
    setCurrentNickname('');
    setError('');
    setSaved(false);
    navigate('/quick-signup?redirectTo=%2F');
  };

  return (
    <PageShell title="UserHome" description="ユーザーのホーム">
      <div className="card">
        <p className="card-title">プロフィール</p>
        <p className="card-text">現在の名前: {currentNickname || '未設定'}</p>
      </div>

      <form className="card form-stack" onSubmit={handleSubmit}>
        <label className="form-label" htmlFor="userhome-nickname">
          名前を変更
        </label>
        <input
          id="userhome-nickname"
          className="text-input"
          value={nickname}
          onChange={(event) => {
            setNicknameInput(event.target.value);
            if (saved) setSaved(false);
          }}
          placeholder="例: yamaoka"
          maxLength={20}
        />
        {error ? <p className="form-error">{error}</p> : null}
        {saved ? <p className="form-success">保存しました。</p> : null}
        <button type="submit" className="primary-button">
          保存
        </button>
        <button type="button" className="secondary-button" onClick={handleLogout}>
          ログアウト
        </button>
      </form>

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
