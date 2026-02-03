import { Link, Route, Routes } from 'react-router-dom';
import PlaceholderPage from './pages/PlaceholderPage.jsx';
import { ROUTES, buildPath } from './routes.js';

const flowLinksByLabel = {
  UserHome: [
    { path: '/quick-signup', label: 'QuickSignUp' },
    { path: '/create-team', label: 'CreateTeam' },
    { path: '/team/:teamId', label: 'TeamHome' },
    { path: '/history', label: 'History' }
  ],
  QuickSignUp: [
    { path: '/create-team', label: 'CreateTeam' },
    { path: '/', label: 'UserHome' }
  ],
  CreateTeam: [
    { path: '/team/:teamId', label: 'TeamHome' },
    { path: '/', label: 'UserHome' }
  ],
  TeamHome: [
    { path: '/team/:teamId/distance', label: 'TopicSelection' },
    { path: '/history', label: 'History' },
    { path: '/', label: 'UserHome' }
  ],
  TopicSelection: [
    { path: '/game/:gameId/draw', label: 'DrawingScreen' },
    { path: '/team/:teamId', label: 'TeamHome' }
  ],
  DrawingScreen: [
    { path: '/game/:gameId/wait', label: 'WaitingScreen' },
    { path: '/team/:teamId/distance', label: 'TopicSelection' }
  ],
  WaitingScreen: [
    { path: '/challenge/:inviteCode', label: 'ChallengeConfirm' },
    { path: '/game/:gameId/answer', label: 'AnswerScreen' },
    { path: '/game/:gameId/result', label: 'ResultScreen' }
  ],
  ChallengeConfirm: [
    { path: '/game/:gameId/answer', label: 'AnswerScreen' },
    { path: '/', label: 'UserHome' }
  ],
  AnswerScreen: [
    { path: '/game/:gameId/result', label: 'ResultScreen' },
    { path: '/', label: 'UserHome' }
  ],
  ResultScreen: [
    { path: '/team/:teamId', label: 'TeamHome' },
    { path: '/history', label: 'History' }
  ],
  History: [
    { path: '/', label: 'UserHome' }
  ],
  AdminDashboard: [
    { path: '/admin/teams', label: 'AdminTeams' },
    { path: '/admin/games', label: 'AdminGames' },
    { path: '/admin/users', label: 'AdminUsers' },
    { path: '/admin/content', label: 'AdminContent' }
  ],
  AdminTeams: [
    { path: '/admin', label: 'AdminDashboard' }
  ],
  AdminGames: [
    { path: '/admin', label: 'AdminDashboard' }
  ],
  AdminUsers: [
    { path: '/admin', label: 'AdminDashboard' }
  ],
  AdminContent: [
    { path: '/admin', label: 'AdminDashboard' }
  ]
};

const toLink = (route) => ({
  href: buildPath(route.path),
  label: route.label
});

const getLinks = (label) =>
  (flowLinksByLabel[label] || []).map((link) => ({
    href: buildPath(link.path),
    label: link.label
  }));

function App() {
  return (
    <div className="app">
      <aside className="nav">
        <div className="nav-header">
          <p className="nav-title">Deviation</p>
          <p className="nav-subtitle">画面遷移の確認用</p>
        </div>
        <nav className="nav-list">
          {ROUTES.map((route) => (
            <Link key={route.path} to={buildPath(route.path)} className="nav-link">
              {route.label}
            </Link>
          ))}
        </nav>
        <div className="nav-footnote">
          <p>パラメータはサンプル値で埋めています。</p>
        </div>
      </aside>
      <main className="content">
        <Routes>
          {ROUTES.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                <PlaceholderPage
                  title={route.label}
                  description={route.description}
                  links={getLinks(route.label)}
                />
              }
            />
          ))}
          <Route
            path="*"
            element={
              <PlaceholderPage
                title="NotFound"
                description="存在しないルートです"
                links={ROUTES.slice(0, 6).map(toLink)}
              />
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
