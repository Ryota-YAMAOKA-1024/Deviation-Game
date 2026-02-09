import { Link, Route, Routes } from 'react-router-dom';
import PlaceholderPage from './pages/PlaceholderPage.jsx';
import RealtimeModePage from './pages/RealtimeModePage.jsx';
import QuickSignUpPage from './pages/QuickSignUpPage.jsx';
import ChallengeConfirmPage from './pages/ChallengeConfirmPage.jsx';
import UserHomePage from './pages/UserHomePage.jsx';
import DistanceModePage from './pages/DistanceModePage.jsx';
import { ROUTES, buildPath } from './routes.js';

const flowLinksByLabel = {
  UserHome: [
    { path: '/quick-signup', label: 'QuickSignUp' },
    { path: '/create-team', label: 'CreateTeam' },
    { path: '/team/:teamId', label: 'TeamHome' },
    { path: '/history', label: 'History' }
  ],
  QuickSignUp: [
    { path: '/create-team', label: 'CreateTeam' }
  ],
  CreateTeam: [
    { path: '/team/:teamId', label: 'TeamHome' }
  ],
  TeamHome: [
    { path: '/team/:teamId/distance', label: 'DistanceMode' },
    { path: '/team/:teamId/realtime', label: 'RealtimeMode' },
    { path: '/history', label: 'History' }
  ],
  RealtimeMode: [
    { path: '/team/:teamId', label: 'TeamHome' }
  ],
  DistanceMode: [
    { path: '/game/:gameId/draw', label: 'DrawingScreen' },
    { path: '/team/:teamId', label: 'TeamHome' }
  ],
  DrawingScreen: [
    { path: '/game/:gameId/wait', label: 'WaitingScreen' },
    { path: '/team/:teamId/distance', label: 'DistanceMode' }
  ],
  WaitingScreen: [
    { path: '/game/:gameId/result', label: 'ResultScreen' }
  ],
  ChallengeConfirm: [
    { path: '/game/:gameId/answer', label: 'AnswerScreen' }
  ],
  AnswerScreen: [
    { path: '/game/:gameId/result', label: 'ResultScreen' }
  ],
  ResultScreen: [
    { path: '/team/:teamId', label: 'TeamHome' },
    { path: '/history', label: 'History' }
  ],
  History: [],
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
  const renderRouteElement = (route) => {
    if (route.label === 'UserHome') {
      return <UserHomePage links={getLinks(route.label)} />;
    }

    if (route.label === 'QuickSignUp') {
      return <QuickSignUpPage />;
    }

    if (route.label === 'ChallengeConfirm') {
      return <ChallengeConfirmPage />;
    }

    if (route.label === 'RealtimeMode') {
      return <RealtimeModePage links={getLinks(route.label)} />;
    }

    if (route.label === 'DistanceMode') {
      return <DistanceModePage links={getLinks(route.label)} />;
    }

    return (
      <PlaceholderPage
        title={route.label}
        description={route.description}
        links={getLinks(route.label)}
      />
    );
  };

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
            <Route key={route.path} path={route.path} element={renderRouteElement(route)} />
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
