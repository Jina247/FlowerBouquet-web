import { useCallback, useEffect, useRef, useState } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import { MainBouquetVideo } from "./Bouquet";

// Frame where the flowers have finished blooming (matches masterProgress in the bouquet)
const BLOOM_DONE_FRAME = 230;

// The letter: edit the text here
const LETTER = {
  greeting: "Gửi Mẹ,",
  paragraphs: [
    "Những bông hoa tặng mẹ nhân dịp 20/10.",
    "Cảm ơn mẹ.",
    "Wherever you are when you read this, I hope it makes you smile.",
  ],
  closing: "With love,",
  signature: "Su",
};

function App() {
  const playerRef = useRef<PlayerRef>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [bloomed, setBloomed] = useState(false);
  const [letterOpen, setLetterOpen] = useState(false);

  const openLetter = useCallback(() => setLetterOpen(true), []);
  const closeLetter = useCallback(() => setLetterOpen(false), []);

  // Show the "tap the tag" hint once the bouquet has bloomed
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    const onFrame = (e: { detail: { frame: number } }) => {
      if (e.detail.frame >= BLOOM_DONE_FRAME) setBloomed(true);
    };
    player.addEventListener("frameupdate", onFrame);
    return () => player.removeEventListener("frameupdate", onFrame);
  }, []);

  // Escape closes the letter; focus the close button when it opens
  useEffect(() => {
    if (!letterOpen) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLetter();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [letterOpen, closeLetter]);

  const replay = () => {
    setBloomed(false);
    playerRef.current?.seekTo(0);
    playerRef.current?.play();
  };

  return (
    <main className="stage">
      <div className="bouquet">
        <Player
          ref={playerRef}
          component={MainBouquetVideo}
          inputProps={{ onTagClick: openLetter, embedded: true }}
          durationInFrames={300}
          fps={30}
          compositionWidth={1080}
          compositionHeight={1080}
          style={{ width: "100%", height: "100%" }}
          autoPlay
          loop={false}
          moveToBeginningWhenEnded={false}
          controls={false}
          clickToPlay={false}
          doubleClickToFullscreen={false}
          spaceKeyToPlayOrPause={false}
          acknowledgeRemotionLicense
        />
      </div>

      <div className={`hint ${bloomed ? "is-visible" : ""}`} aria-live="polite">
        <p>Chạm vào tag trái tim để xem 1 bất ngờ</p>
        <button type="button" className="replay" onClick={replay} tabIndex={bloomed ? 0 : -1}>
          Trở lại để ngắm hoa 
        </button>
      </div>

      {letterOpen && (
        <div className="overlay" onClick={closeLetter}>
          <article
            className="letter"
            role="dialog"
            aria-modal="true"
            aria-labelledby="letter-greeting"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="tape" aria-hidden="true" />
            <button ref={closeRef} type="button" className="close" onClick={closeLetter} aria-label="Close letter">
              ×
            </button>
            <h1 id="letter-greeting">{LETTER.greeting}</h1>
            {LETTER.paragraphs.map((text, i) => (
              <p key={i}>{text}</p>
            ))}
            <p className="closing">{LETTER.closing}</p>
            <p className="signature">{LETTER.signature}</p>
          </article>
        </div>
      )}
    </main>
  );
}

export default App;
