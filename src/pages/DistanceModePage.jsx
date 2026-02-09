import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageShell from '../components/PageShell.jsx';
import { createTopicsRepo } from '../lib/repos/topicsRepo.js';
import { getNickname } from '../lib/session.js';
import { createStartDistanceGameUsecase } from '../lib/usecases/startDistanceGame.js';

const TOPIC_COUNT = 5;

export default function DistanceModePage({ links }) {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const topicsRepo = useMemo(() => createTopicsRepo(), []);
  const startDistanceGame = useMemo(
    () =>
      createStartDistanceGameUsecase({
        topicsRepo
      }),
    [topicsRepo]
  );

  const [topics, setTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [submittingTopicId, setSubmittingTopicId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadTopics = async () => {
      setLoadingTopics(true);
      setError('');

      const result = await topicsRepo.listActiveTopics(TOPIC_COUNT);
      if (!active) return;

      if (!result.ok) {
        setTopics([]);
        setError(result.message);
        setLoadingTopics(false);
        return;
      }

      setTopics(result.data);
      setLoadingTopics(false);
    };

    loadTopics();

    return () => {
      active = false;
    };
  }, [topicsRepo]);

  const handleSelectTopic = async (topic) => {
    if (!teamId) {
      setError('teamId が取得できません。');
      return;
    }

    setSubmittingTopicId(topic.id);
    setError('');

    const drawerUserId = getNickname() || 'guest-user';
    const result = await startDistanceGame.execute({
      teamId,
      drawerUserId,
      selectedTopic: topic
    });

    if (!result.ok) {
      setSubmittingTopicId('');
      setError(result.message);
      return;
    }

    navigate(`/game/${result.data.gameId}/draw`);
  };

  return (
    <PageShell title="DistanceMode" description="ディスタンスモード（お題選択）">
      <div className="card">
        <p className="card-title">お題を選択</p>
        <p className="card-text">5つのお題から1つ選ぶとゲームを作成して描画画面へ進みます。</p>
      </div>

      <div className="card">
        {loadingTopics ? <p className="card-text">お題を読み込み中...</p> : null}
        {!loadingTopics && topics.length === 0 ? (
          <p className="card-text">
            表示可能なお題がありません。`npm run seed:topics` を実行して topics を投入してください。
          </p>
        ) : null}
        {!loadingTopics && topics.length > 0 ? (
          <div className="topic-grid">
            {topics.map((topic) => (
              <button
                key={topic.id}
                type="button"
                className="topic-button"
                disabled={Boolean(submittingTopicId)}
                onClick={() => handleSelectTopic(topic)}
              >
                {submittingTopicId === topic.id ? '作成中...' : topic.text}
              </button>
            ))}
          </div>
        ) : null}
        {error ? <p className="form-error">{error}</p> : null}
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
