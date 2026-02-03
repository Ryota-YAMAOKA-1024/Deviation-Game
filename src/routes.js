export const SAMPLE_IDS = {
  teamId: 'team-001',
  gameId: 'game-001',
  inviteCode: 'invite-abc123'
};

export const ROUTES = [
  { path: '/', label: 'UserHome', description: 'ユーザーのホーム' },
  { path: '/quick-signup', label: 'QuickSignUp', description: '簡易登録' },
  { path: '/create-team', label: 'CreateTeam', description: '新しいチーム作成' },
  { path: '/team/:teamId', label: 'TeamHome', description: 'チームのホーム' },
  {
    path: '/team/:teamId/distance',
    label: 'TopicSelection',
    description: 'ディスタンスモードのお題選択'
  },
  { path: '/game/:gameId/draw', label: 'DrawingScreen', description: '描画画面' },
  { path: '/game/:gameId/wait', label: 'WaitingScreen', description: '回答待機' },
  {
    path: '/challenge/:inviteCode',
    label: 'ChallengeConfirm',
    description: '招待受け取り確認'
  },
  { path: '/game/:gameId/answer', label: 'AnswerScreen', description: '回答画面' },
  { path: '/game/:gameId/result', label: 'ResultScreen', description: '結果画面' },
  { path: '/history', label: 'History', description: '完了済みゲーム履歴' },
  { path: '/admin', label: 'AdminDashboard', description: '管理ダッシュボード' },
  { path: '/admin/teams', label: 'AdminTeams', description: 'チーム管理' },
  { path: '/admin/games', label: 'AdminGames', description: 'ゲーム管理' },
  { path: '/admin/users', label: 'AdminUsers', description: 'ユーザー管理' },
  { path: '/admin/content', label: 'AdminContent', description: 'コンテンツ管理' }
];

export const buildPath = (path, params = SAMPLE_IDS) =>
  path
    .replace(':teamId', params.teamId)
    .replace(':gameId', params.gameId)
    .replace(':inviteCode', params.inviteCode);
