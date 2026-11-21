import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { Caveat } from "./components/Caveat";
import { SourceSheet } from "./components/SourceSheet";
import { StoryShell } from "./components/StoryShell";
import { useAutoplay } from "./hooks/useAutoplay";
import { CARDS, SITE } from "./story/config";
import { autoplayDelay } from "./story/motion";
import { useCardHash } from "./story/useCardHash";
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
  const [index, go] = useCardHash(CARDS);
  const card = CARDS[index];
  const last = CARDS.length - 1;
  const [playing, setPlaying] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  const delayMs = autoplayDelay(card.dataFile !== null);
  const next = useCallback(() => go(index + 1), [go, index]);

  useAutoplay({
    enabled: playing && !sheetOpen && !card.waitsForInput && index < last,
    delayMs,
    cardKey: card.id,
    onAdvance: next,
  });

  // Move focus to the new card heading so screen readers announce it.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
  }, [card.id]);

  // Manual navigation pauses autoplay, like the reference.
  const goManual = useCallback(
    (target: number) => {
      setPlaying(false);
      go(target);
    },
    [go],
  );

  const close = () => {
    setPlaying(false);
    go(0);
  };

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

      <main className="story" style={{ "--dur-autoplay": `${delayMs}ms` } as CSSProperties}>
        <StoryShell
          cards={CARDS}
          index={index}
          go={goManual}
          playing={playing && !card.waitsForInput}
          onTogglePlay={() => setPlaying((p) => !p)}
          onInfo={() => setSheetOpen(true)}
          onClose={close}
        >
          <article
            key={card.id}
            id={card.id}
            className="card"
            data-tone={card.tone}
            aria-labelledby={`${card.id}-title`}
          >
            {card.id === "intro" && <p className="caveat">{SITE.address}</p>}
            <h1 id={`${card.id}-title`} className="card-headline" ref={headingRef} tabIndex={-1}>
              {card.headline}
            </h1>
            <Caveat text={card.caveat} onSources={() => setSheetOpen(true)} />
          </article>
        </StoryShell>

        <SourceSheet
          open={sheetOpen}
          title={card.label}
          caveat={card.caveat}
          dataFile={card.dataFile}
          onClose={() => setSheetOpen(false)}
        />
      </main>
    </div>
  );
}

export default App;
