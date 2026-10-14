"use client";

import { useEffect, useRef, useState } from "react";
import AdSenseAd from "../AdSenseAd";
import { Heart, Sparkles, ArrowLeft, Copy, Check, WandSparkles, Music2, VolumeX, PartyPopper, Stars, MessageCircle, ExternalLink } from "lucide-react";
import styles from "./proposal.module.css";

export default function ProposalPage() {
  const [fromName, setFromName] = useState("");
  const [toName, setToName] = useState("");
  const [proposalMessage, setProposalMessage] = useState("You make ordinary days feel a little more magical. Would you make me the happiest person and say yes?");
  const [themeChoice, setThemeChoice] = useState("rose");
  const [photoUrl, setPhotoUrl] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [proposalTheme, setProposalTheme] = useState("rose");
  const [proposalPhoto, setProposalPhoto] = useState("");
  const [sender, setSender] = useState("");
  const [recipient, setRecipient] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const audioContext = useRef<AudioContext | null>(null);
  const musicTimer = useRef<number | null>(null);
  const [noPosition, setNoPosition] = useState({ left: 285, top: 20 });
  const playArea = useRef<HTMLDivElement>(null);
  const lastDodgeAt = useRef(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const from = params.get("from")?.trim() || "Someone special";
    const to = params.get("to")?.trim() || "you";
    const theme = params.get("theme") || "rose";
    const message = params.get("message") || "";
    const photo = params.get("photo") || "";
    if (params.has("from") || params.has("to")) {
      setSender(from);
      setRecipient(to);
      setProposalTheme(["rose", "lavender", "sunset", "midnight"].includes(theme) ? theme : "rose");
      setCustomMessage(message);
      setProposalPhoto(isSafeImageUrl(photo) ? photo : "");
    }
  }, []);

  useEffect(() => {
    if (sender || recipient) dodgeNo();
  }, [sender, recipient]);

  function createLink(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const cleanFrom = fromName.trim().replace(/\s+/g, " ");
    const cleanTo = toName.trim().replace(/\s+/g, " ");
    if (!cleanFrom || !cleanTo) return;
    // Always generate the canonical proposal URL, even if the generator was opened
    // from a previously personalized proposal URL.
    const url = new URL("/propose/", window.location.origin);
    const params = new URLSearchParams({ from: cleanFrom, to: cleanTo, theme: themeChoice });
    if (proposalMessage.trim()) params.set("message", proposalMessage.trim());
    if (photoUrl.trim() && isSafeImageUrl(photoUrl.trim())) params.set("photo", photoUrl.trim());
    url.search = params.toString();
    setShareUrl(url.toString());
    setCopied(false);
  }

  function shareOnWhatsApp() {
    if (!shareUrl) return;
    const text = `I made a little something for you, ${toName.trim()} 💗 Open it here: ${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }

  function isSafeImageUrl(value: string) {
    try { const url = new URL(value); return url.protocol === "https:" || url.protocol === "http:"; } catch { return false; }
  }

  const themeClass = proposalTheme === "lavender" ? styles.themeLavender : proposalTheme === "sunset" ? styles.themeSunset : proposalTheme === "midnight" ? styles.themeMidnight : styles.themeRose;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
    } catch {
      const field = document.querySelector<HTMLInputElement>(`#share-link`);
      field?.select();
    }
  }

  function toggleMusic() {
    if (musicOn) {
      if (musicTimer.current !== null) window.clearInterval(musicTimer.current);
      musicTimer.current = null;
      audioContext.current?.close();
      audioContext.current = null;
      setMusicOn(false);
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const context = new AudioContextClass();
      audioContext.current = context;
      const notes = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880, 698.46];
      let index = 0;
      const playNote = () => {
        if (context.state === "closed") return;
        const now = context.currentTime;
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = notes[index % notes.length];
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.025, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(now);
        oscillator.stop(now + 0.9);
        index += 1;
      };
      void context.resume();
      playNote();
      musicTimer.current = window.setInterval(playNote, 760);
      setMusicOn(true);
    } catch {
      setMusicOn(false);
    }
  }

  useEffect(() => () => {
    if (musicTimer.current !== null) window.clearInterval(musicTimer.current);
    if (audioContext.current && audioContext.current.state !== "closed") void audioContext.current.close();
  }, []);

  function dodgeNo(pointer?: { x: number; y: number }, force = false) {
    const area = playArea.current;
    if (!area) return;

    // Pointer movement is lightly throttled, but an actual touch always triggers a jump.
    const now = Date.now();
    if (!force && now - lastDodgeAt.current < 90) return;
    lastDodgeAt.current = now;

    const noButton = area.querySelector<HTMLButtonElement>(`button[aria-hidden="true"]`);
    const yesButton = area.querySelector<HTMLButtonElement>(`.${styles.yesButton}`);
    const noWidth = noButton?.offsetWidth ?? 100;
    const noHeight = noButton?.offsetHeight ?? 46;
    const yesWidth = yesButton?.offsetWidth ?? 170;
    const padding = 2;
    const maxX = Math.max(padding, area.clientWidth - noWidth - padding);
    const yesLeft = (area.clientWidth - yesWidth) / 2;
    const yesRight = yesLeft + yesWidth;
    const gap = 16;

    // Keep No on the exact same horizontal row as Yes. Only use safe zones
    // to the left or right of Yes, never above, below, or overlapping it.
    const leftZone = { left: padding, top: 20 };
    const rightZone = { left: maxX, top: 20 };
    const leftIsSafe = leftZone.left + noWidth + gap <= yesLeft;
    const rightIsSafe = rightZone.left >= yesRight + gap;
    const options = [
      ...(leftIsSafe ? [leftZone] : []),
      ...(rightIsSafe ? [rightZone] : []),
    ];

    // If the card is too narrow for either side, use the safe side with the
    // greatest separation. The arena CSS keeps both controls vertically aligned.
    const safeOptions = options.length ? options : [
      { left: Math.max(padding, Math.min(maxX, yesLeft - noWidth - gap)), top: 20 },
      { left: Math.max(padding, Math.min(maxX, yesRight + gap)), top: 20 },
    ];
    const pointerX = pointer?.x ?? noPosition.left + noWidth / 2;
    const current = noPosition;
    const next = safeOptions
      .filter(candidate => Math.abs(candidate.left - current.left) > 24)
      .sort((a, b) => {
        const aDistance = Math.abs(a.left - current.left) + Math.abs(a.left + noWidth / 2 - pointerX);
        const bDistance = Math.abs(b.left - current.left) + Math.abs(b.left + noWidth / 2 - pointerX);
        return bDistance - aDistance;
      })[0] ?? safeOptions.reduce((best, candidate) =>
        Math.abs(candidate.left - current.left) > Math.abs(best.left - current.left) ? candidate : best
      , safeOptions[0]);

    setNoPosition({ left: next.left, top: 20 });
  }

  const hasProposal = Boolean(sender || recipient);

  return (
    <main className={`${styles.page} ${themeClass}`}>
      <div className={styles.ambient} aria-hidden="true" />
      <div className={styles.floatingHearts} aria-hidden="true">
        <span>♥</span><span>♡</span><span>♥</span><span>♡</span><span>♥</span><span>♡</span><span>♥</span><span>♡</span>
      </div>
      <header className={styles.topbar}>
        <a href="/" className={styles.brand}><span className={styles.brandMark}>S</span><span>shiras.dev</span></a>
        <div className={styles.topActions}>
          {hasProposal && <button type="button" className={`${styles.musicToggle} ${musicOn ? styles.musicActive : ""}`} onClick={toggleMusic} aria-pressed={musicOn} aria-label={musicOn ? "Turn music off" : "Play gentle music"}>
            {musicOn ? <Music2 size={15} /> : <VolumeX size={15} />} <span>{musicOn ? "Music on" : "Add music"}</span>
          </button>}
          <a href="/" className={styles.back}><ArrowLeft size={15} /> Back to portfolio</a>
        </div>
      </header>

      <section className={styles.shell}>
        <div className={styles.eyebrow}><Sparkles size={15} /> A LITTLE SOMETHING SPECIAL</div>
        {!hasProposal ? (
          <>
            <h1>Make the question <span>unforgettable.</span></h1>
            <p className={styles.intro}>Create a cute, shareable proposal page. Add your names, generate a private link, and send it to someone special.</p>
            <form className={styles.form} onSubmit={createLink}>
              <label>Your name<input value={fromName} onChange={e => setFromName(e.target.value)} placeholder="e.g. Alex" maxLength={50} required /></label>
              <label>Their name<input value={toName} onChange={e => setToName(e.target.value)} placeholder="e.g. Jamie" maxLength={50} required /></label>
              <label>Choose a theme<select value={themeChoice} onChange={e => setThemeChoice(e.target.value)}><option value="rose">Rose romance</option><option value="lavender">Lavender dream</option><option value="sunset">Sunset glow</option><option value="midnight">Midnight elegance</option></select></label>
              <label>Your proposal message<textarea value={proposalMessage} onChange={e => setProposalMessage(e.target.value)} maxLength={300} rows={3} placeholder="Write something from your heart..." /></label>
              <label>Photo URL (optional)<input type="url" value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} placeholder="https://example.com/our-photo.jpg" /></label>
              <p className={styles.fieldHint}>Use a publicly accessible image URL (https://). The photo will appear on the shared page.</p>
              <button className={styles.primary} type="submit"><Heart size={17} fill="currentColor" /> Create my proposal link</button>
            </form>
            {shareUrl && <div className={`${styles.shareBox} ${styles.shareReady}`} aria-live="polite">
              <div className={styles.readyHeading}><span className={styles.readyIcon}><Check size={17}/></span><div><p>Your proposal link is ready!</p><small>One little link. One big question. 💌</small></div></div>
              <div className={styles.copyRow}><input id="share-link" aria-label="Your personalized proposal link" readOnly value={shareUrl} onFocus={e => e.currentTarget.select()} /><button onClick={copyLink} type="button" className={styles.copyButton}>{copied ? <Check size={16}/> : <Copy size={16}/>} {copied ? "Copied" : "Copy link"}</button></div>
              <div className={styles.shareActions}><button type="button" onClick={shareOnWhatsApp} className={styles.whatsappButton}><MessageCircle size={16}/> Send with WhatsApp</button><a href={shareUrl} target="_blank" rel="noreferrer" className={styles.previewButton}><ExternalLink size={15}/> Preview page</a></div>
              <small className={styles.shareDisclaimer}>Anyone with this link can view the names you entered. You don’t need an account.</small>
            </div>}
            <div className={styles.previewNote}><WandSparkles size={16} /> The page is hosted at <strong>shiras.dev/propose/</strong> — no account needed.</div>
            <div style={{ width: '100%', maxWidth: 680, margin: '28px auto 0' }}>
              <AdSenseAd slot="3028574231" />
            </div>
          </>
        ) : (
          <>
            {!answered ? <div className={`${styles.proposalCard} ${styles.reveal}`}>
              <div className={styles.heartBurst} aria-hidden="true"><span>♥</span><span>♥</span><span>♥</span><span>♥</span><span>♥</span></div>
              <div className={styles.bigHeart}><Heart size={38} fill="currentColor" strokeWidth={1.5}/><span className={styles.heartHalo} /></div>
              <p className={styles.littleLabel}><Stars size={13} /> A message just for you</p>
              <p className={styles.toLine}>Hey {recipient},</p>
              <h1 className={styles.question}>Will you be <span>mine?</span></h1>
              {proposalPhoto && <img className={styles.proposalPhoto} src={proposalPhoto} alt={`A photo shared by ${sender}`} referrerPolicy="no-referrer" onError={e => { e.currentTarget.style.display = "none"; }} />}
              <p className={styles.message}>{customMessage || `You make ordinary days feel a little more magical. So, ${recipient}, would you make me the happiest person and say yes?`}</p>
              <p className={styles.fromLine}>With all my heart, <strong>{sender}</strong></p>
              <div
                className={styles.buttonArena}
                ref={playArea}
                onPointerMove={e => {
                  const rect = playArea.current?.getBoundingClientRect();
                  if (!rect) return;
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  if (Math.hypot(x - noPosition.left - 50, y - noPosition.top - 24) < 115) {
                    dodgeNo({ x, y });
                  }
                }}
                onPointerDown={e => {
                  const rect = playArea.current?.getBoundingClientRect();
                  if (!rect) return;
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  if (Math.hypot(x - noPosition.left - 50, y - noPosition.top - 24) < 145) {
                    e.preventDefault();
                    dodgeNo({ x, y }, true);
                  }
                }}
              >
                <button className={styles.yesButton} onClick={() => setAnswered(true)}><Heart size={17} fill="currentColor"/> Yes, absolutely!</button>
                <button className={styles.noButton} style={{ left: `${noPosition.left}px`, top: `${noPosition.top}px` }} tabIndex={-1} aria-hidden="true">No 🙈</button>
              </div>
              <p className={styles.tinyNote}>P.S. That little “No” is feeling shy today. 💗</p>
            </div> : <div className={`${styles.yesCard} ${styles.reveal}`}><div className={styles.celebrationGlow} aria-hidden="true"/><div className={styles.celebrationRays} aria-hidden="true"/><div className={styles.confettiShower} aria-hidden="true">{Array.from({length:30},(_,i)=><span key={i}>{['✦','♥','✧','●','◆'][i%5]}</span>)}</div><div className={styles.yesBadge}><Sparkles size={14}/> A MOMENT TO REMEMBER</div><div className={styles.bigHeart}><Heart size={48} fill="currentColor"/><span className={styles.heartHalo} /></div><p className={styles.littleLabel}><PartyPopper size={14} /> THE BEST ANSWER EVER</p><p className={styles.toLine}>{recipient}, you just made {sender}’s day!</p><h1>It’s a <span>YES!</span></h1><p className={styles.message}>{customMessage || `Now go give ${sender} the biggest smile. This is the beginning of something lovely.`}</p>{proposalPhoto && <img className={styles.celebrationPhoto} src={proposalPhoto} alt={`A special photo for ${sender} and ${recipient}`} referrerPolicy="no-referrer" onError={e => { e.currentTarget.style.display = "none"; }} />}<div className={styles.celebrationPromise}><span>♡</span><p>Here’s to more little moments, big smiles, and memories you’ll keep forever.</p><span>♡</span></div><div className={styles.confetti} aria-hidden="true"><span>✦</span><span>♥</span><span>✧</span><span>♥</span><span>✦</span><span>✧</span><span>♥</span></div><p className={styles.loveNote}>A little yes. A very big memory. ✨</p><a className={styles.celebrationShare} href={`https://wa.me/?text=${encodeURIComponent(`A little moment to remember 💖 ${sender} asked ${recipient}, and the answer was YES!`)}`} target="_blank" rel="noreferrer"><MessageCircle size={15}/> Share the happy moment</a></div>}
            <div className={styles.createAnother}><a href="/propose/">Make your own proposal page <ArrowLeft size={14}/></a><small>Made with love on shiras.dev</small></div>
          </>
        )}
      </section>
      <footer className={styles.footer}>A playful little corner of <a href="/">Shiras VM’s portfolio</a> <span>·</span> made with <Heart size={12} fill="currentColor" /></footer>
    </main>
  );
}
