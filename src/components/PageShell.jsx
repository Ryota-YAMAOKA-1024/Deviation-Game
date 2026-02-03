import { Link } from 'react-router-dom';

export default function PageShell({ title, description, children }) {
  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="page-eyebrow">Placeholder</p>
          <h1>{title}</h1>
          {description ? <p className="page-description">{description}</p> : null}
        </div>
        <Link className="home-link" to="/">
          Home
        </Link>
      </header>
      <div className="page-body">{children}</div>
    </section>
  );
}
