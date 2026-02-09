import { useState } from 'react';
import PageShell from '../components/PageShell.jsx';
import { getNickname, setNickname } from '../lib/session.js';

export default function UserHomePage({ links }) {
  const [nickname, setNicknameInput] = useState(getNickname());
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
    setError('');
    setSaved(true);
  };

  return (
    <PageShell title="UserHome" description="ユーザーのホーム">
      <div className="card">
        <p className="card-title">プロフィール</p>
        <p className="card-text">現在の名前: {getNickname() || '未設定'}</p>
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
