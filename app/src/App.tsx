import { useEffect, useMemo } from "react";
import { CHAPTERS, SITE } from "./story/config";
import { useChapterHash } from "./story/useChapterHash";
import "./styles/tokens.css";
import "./App.css";

const LESCC_HOME = "https://lesculturalcenter.org/";

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7zm11.25 1.25a1 1 0 1 1 0 2 1 1 0 0 1 0-2zM12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
    </svg>
  );
}

function App() {
  const ids = useMemo(() => CHAPTERS.map((chapter) => chapter.id), []);
  const [index, go] = useChapterHash(ids);
  const chapter = CHAPTERS[index];
  const last = CHAPTERS.length - 1;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") go(index + 1);
      if (event.key === "ArrowLeft") go(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, go]);

  return (
    <div className="page">
      <header className="site-header">
        <div className="site-header-inner">
          <a className="logo-link-mobile" href={LESCC_HOME}>
            <img src="/brand/logo.png" alt="LESCC logo" />
          </a>

          <div className="header-brand">
            <a className="wordmark" href={LESCC_HOME}>
              {SITE.name}
            </a>
            <nav className="header-nav" aria-label="LESCC">
              <a href={`${LESCC_HOME}#the-building`}>About</a>
              <a href={`${LESCC_HOME}#who-we-are`}>Who We Are</a>
              <a href={`${LESCC_HOME}press`}>Press</a>
            </nav>
          </div>

          <a className="logo-link" href={LESCC_HOME}>
            <img src="/brand/logo.png" alt="LESCC logo" />
          </a>

          <div className="header-actions">
            <a
              className="icon-btn"
              href="https://www.instagram.com/lesculturalcenter/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <InstagramIcon />
            </a>
            <a className="btn btn-ghost" href={`${LESCC_HOME}#get-involved`}>
              Get in touch
            </a>
            <a
              className="btn btn-primary"
              href="https://givebutter.com/LESculturalcenter"
              target="_blank"
              rel="noopener noreferrer"
            >
              Donate
            </a>
          </div>

          <div className="header-actions-mobile">
            <a
              className="btn btn-primary"
              href="https://givebutter.com/LESculturalcenter"
              target="_blank"
              rel="noopener noreferrer"
            >
              Donate
            </a>
          </div>
        </div>
      </header>

      <main className="story">
        <header className="story-header">
          <p className="eyebrow">The story</p>
          <h1 className="story-title">Two futures for one corner</h1>
          <p className="address">{SITE.address}</p>
        </header>

        <nav className="progress" aria-label="Chapters">
          {CHAPTERS.map((item, i) => (
            <button
              key={item.id}
              type="button"
              className={i <= index ? "progress-segment is-on" : "progress-segment"}
              aria-label={`Go to ${item.title}`}
              aria-current={i === index ? "step" : undefined}
              onClick={() => go(i)}
            />
          ))}
        </nav>

        <article
          key={chapter.id}
          id={chapter.id}
          className="card"
          aria-labelledby={`${chapter.id}-title`}
        >
          <p className="chapter-index">
            {String(index + 1).padStart(2, "0")} / {String(CHAPTERS.length).padStart(2, "0")}
          </p>
          <h2 id={`${chapter.id}-title`}>{chapter.title}</h2>
          <p className="headline">{chapter.headline}</p>
          <p className="caveat">{chapter.caveat}</p>
        </article>

        <div className="controls">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => go(index - 1)}
            disabled={index === 0}
          >
            Previous
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => go(index + 1)}
            disabled={index === last}
          >
            Next
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;
