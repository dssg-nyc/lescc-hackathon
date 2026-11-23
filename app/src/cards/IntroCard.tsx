import { useState } from "react";
import { SITE } from "../story/config";

const BG = "/img/population-image1.webp";

export function IntroCard({ onStart }: { onStart: () => void }) {
  const [hasImage, setHasImage] = useState(true);
  return (
    <>
      {hasImage && (
        <img
          className="intro-bg"
          src={BG}
          alt=""
          width={1200}
          height={1600}
          fetchPriority="high"
          onError={() => setHasImage(false)}
        />
      )}
      <p className="card-eyebrow">{SITE.address}</p>
      <button type="button" className="btn btn-on-dark" onClick={onStart}>
        Start <span aria-hidden="true">→</span>
      </button>
    </>
  );
}
