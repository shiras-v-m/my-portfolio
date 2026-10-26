'use client';

import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import './MouseFollowCharacter.css';

/**
 * One eye, described in the pixel space of the PNG you pass as `imageSrc`
 * (i.e. the same numbers you read from an image editor, matching the `width`
 * and `height` props).
 */
export interface EyeShape {
  /** Centre of the eye opening, in image pixels. */
  x: number;
  y: number;
  /** Size of the visible eye opening in image pixels. The pupil is clipped to this ellipse. */
  width: number;
  height: number;
  /** Tilt of the eye opening in degrees (negative = rising toward the right). Default 0. */
  rotate?: number;
  /** Per-eye overrides of the shared values below. */
  pupilSize?: number;
  maxMoveX?: number;
  maxMoveY?: number;
}

export interface MouseFollowEyesConfig {
  /** Eyes as seen by the viewer. */
  left: EyeShape;
  right: EyeShape;
  /** Pupil/iris diameter in image pixels. Default: ~the eye opening height. */
  pupilSize?: number;
  /** Max pupil travel from the eye centre in image pixels. Defaults: 60% of the free width / 20% of the height. */
  maxMoveX?: number;
  maxMoveY?: number;
  /** Eye follow speed per 60fps frame, 0–1 (independent of head tilt). Default 0.22. */
  smoothing?: number;
  /** Cursor distance (as a fraction of the character width) at which the pupil reaches max travel. Default 0.5. */
  reach?: number;
  /** Resting gaze, -1…1 on each axis (used before/after tracking, on touch and with reduced motion). Default {0,0}. */
  restLook?: { x: number; y: number };
  /** Any CSS colours. */
  irisColor?: string;
  pupilColor?: string;
  /** Small specular glint on the pupil. Default true. */
  highlight?: boolean;
  /** Draw eye outlines (red) and the pupil travel limit (cyan) so you can fine-tune coordinates. */
  debug?: boolean;
}

export interface MouseFollowCharacterProps {
  /** Path or URL of a transparent PNG (e.g. "/shiras-character-blank-eyes.png"). */
  imageSrc: string;
  /** Alt text. Leave empty (default) when the image is purely decorative. */
  alt?: string;
  /** Intrinsic image size in px. Required when `eyes` is used (eye coordinates are in this space). */
  width?: number;
  height?: number;
  /** Optional CSS-drawn pupils that follow the cursor. The image itself should have blank eye whites. */
  eyes?: MouseFollowEyesConfig;
  /** Maximum head tilt in degrees on each axis. Default 14. */
  maxTilt?: number;
  /** Maximum head parallax shift in px. Default 10. */
  maxShift?: number;
  /** CSS perspective distance in px. Default 900. */
  perspective?: number;
  /** Head follow speed per 60fps frame, 0–1 (higher = snappier). Default 0.12. */
  smoothing?: number;
  /**
   * Element whose pointer movement is tracked. Matched with `closest()` from the
   * character, so pass a selector for an ancestor (e.g. "#home").
   * Defaults to the nearest <section>, then the direct parent.
   */
  containerSelector?: string;
  /** Load eagerly (use for above-the-fold heroes). Default true. */
  priority?: boolean;
  /** Extra class names for the outer element — use this to position/size it. */
  className?: string;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const RAD = Math.PI / 180;
const round = (n: number, digits = 3) => Number(n.toFixed(digits));

interface ResolvedEye {
  x: number;
  y: number;
  w: number;
  h: number;
  rot: number; // degrees
  size: number;
  maxX: number;
  maxY: number;
}

function resolveEye(eye: EyeShape, cfg: MouseFollowEyesConfig): ResolvedEye {
  const size = eye.pupilSize ?? cfg.pupilSize ?? round(eye.height * 1.05, 2);
  return {
    x: eye.x,
    y: eye.y,
    w: eye.width,
    h: eye.height,
    rot: eye.rotate ?? 0,
    size,
    maxX: eye.maxMoveX ?? cfg.maxMoveX ?? Math.max(0, round(((eye.width - size) / 2) * 0.6, 2)),
    maxY: eye.maxMoveY ?? cfg.maxMoveY ?? round(eye.height * 0.2, 2),
  };
}

/**
 * Pupil placement for a gaze vector (vx, vy in -1…1, in screen space).
 * The eye opening may be rotated, so the screen-space offset is rotated back
 * into the eye's own frame. Units are `cqw` (1% of the character width), so it
 * scales with the rendered size.
 */
function pupilTransform(eye: ResolvedEye, vx: number, vy: number, imageWidth: number): string {
  const ox = vx * eye.maxX;
  const oy = vy * eye.maxY;
  const a = eye.rot * RAD;
  const lx = ox * Math.cos(a) + oy * Math.sin(a);
  const ly = -ox * Math.sin(a) + oy * Math.cos(a);
  const toCqw = (px: number) => ((px / imageWidth) * 100).toFixed(4);
  return `translate(-50%, -50%) translate(${toCqw(lx)}cqw, ${toCqw(ly)}cqw)`;
}

/**
 * A transparent character image that turns toward the cursor with a 3D tilt,
 * optionally with independent CSS pupils that follow the cursor.
 *
 * - Pointer position is written straight to the DOM from a requestAnimationFrame
 *   loop, so moving the mouse never triggers a React re-render.
 * - The loop sleeps as soon as the head and the eyes have settled.
 * - Tracking is off for touch / coarse pointers and when the user prefers
 *   reduced motion (the character is then simply shown at rest).
 */
export default function MouseFollowCharacter({
  imageSrc,
  alt = '',
  width,
  height,
  eyes,
  maxTilt = 14,
  maxShift = 10,
  perspective = 900,
  smoothing = 0.12,
  containerSelector,
  priority = true,
  className,
}: MouseFollowCharacterProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const pupilRefs = useRef<Array<HTMLSpanElement | null>>([]);

  const hasEyes = !!eyes && !!width && !!height;
  const eyesKey = hasEyes ? JSON.stringify(eyes) : '';
  const rest = eyes?.restLook ?? { x: 0, y: 0 };
  const resolvedEyes: ResolvedEye[] = hasEyes ? [resolveEye(eyes!.left, eyes!), resolveEye(eyes!.right, eyes!)] : [];

  useEffect(() => {
    const root = rootRef.current;
    const tilt = tiltRef.current;
    if (!root || !tilt) return;

    const container: HTMLElement | null =
      (containerSelector ? root.closest<HTMLElement>(containerSelector) : null) ??
      root.closest<HTMLElement>('section') ??
      root.parentElement;
    if (!container) return;

    // --- eyes (independent of the head tilt) -------------------------------
    const eyeCfg: MouseFollowEyesConfig | null = eyesKey ? JSON.parse(eyesKey) : null;
    const imgW = width ?? 1;
    const imgH = height ?? 1;
    const eyeList = eyeCfg ? [resolveEye(eyeCfg.left, eyeCfg), resolveEye(eyeCfg.right, eyeCfg)] : [];
    const restLook = eyeCfg?.restLook ?? { x: 0, y: 0 };
    const eyeSmoothing = eyeCfg?.smoothing ?? 0.22;
    const reachFraction = eyeCfg?.reach ?? 0.5;
    const eyeCur = eyeList.map(() => ({ x: restLook.x, y: restLook.y }));
    const eyeTarget = eyeList.map(() => ({ x: restLook.x, y: restLook.y }));

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

    // Normalised position (-1…1) — `cur` chases `target` every frame.
    const cur = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    const pointer = { x: 0, y: 0, active: false };
    let frame = 0;
    let lastTime = 0;
    let listening = false;

    const render = () => {
      const rx = (-cur.y * maxTilt).toFixed(2);
      const ry = (cur.x * maxTilt).toFixed(2);
      const tx = (cur.x * maxShift).toFixed(2);
      const ty = (cur.y * maxShift * 0.6).toFixed(2);
      tilt.style.transform = `perspective(${perspective}px) rotateX(${rx}deg) rotateY(${ry}deg) translate3d(${tx}px, ${ty}px, 0)`;
    };

    const renderEyes = () => {
      eyeList.forEach((eye, i) => {
        const el = pupilRefs.current[i];
        if (el) el.style.transform = pupilTransform(eye, eyeCur[i].x, eyeCur[i].y, imgW);
      });
    };

    const updateTarget = () => {
      if (!pointer.active) {
        target.x = 0;
        target.y = 0;
        eyeTarget.forEach((t) => {
          t.x = restLook.x;
          t.y = restLook.y;
        });
        return;
      }
      // The root itself is never transformed, so its rect is stable.
      const box = root.getBoundingClientRect();
      const area = container.getBoundingClientRect();
      const centerX = box.left + box.width / 2;
      const headY = box.top + box.height * 0.3; // aim for head height, not the belly
      target.x = clamp((pointer.x - centerX) / (area.width / 2 || 1), -1, 1);
      target.y = clamp((pointer.y - headY) / (area.height / 2 || 1), -1, 1);

      // Each eye aims from its own position.
      const reach = box.width * reachFraction || 1;
      eyeList.forEach((eye, i) => {
        const ex = box.left + (eye.x / imgW) * box.width;
        const ey = box.top + (eye.y / imgH) * box.height;
        const dx = pointer.x - ex;
        const dy = pointer.y - ey;
        const dist = Math.hypot(dx, dy);
        const strength = Math.min(1, dist / reach);
        eyeTarget[i].x = dist > 0.5 ? (dx / dist) * strength : 0;
        eyeTarget[i].y = dist > 0.5 ? (dy / dist) * strength : 0;
      });
    };

    const tick = (now: number) => {
      frame = 0;
      updateTarget();

      // Frame-rate independent easing.
      const dt = Math.min(now - lastTime, 50);
      lastTime = now;
      const k = 1 - Math.pow(1 - smoothing, dt / 16.667);
      cur.x += (target.x - cur.x) * k;
      cur.y += (target.y - cur.y) * k;

      let settled = Math.abs(target.x - cur.x) < 0.001 && Math.abs(target.y - cur.y) < 0.001;
      if (settled) {
        cur.x = target.x;
        cur.y = target.y;
      }
      render();

      if (eyeList.length) {
        const ek = 1 - Math.pow(1 - eyeSmoothing, dt / 16.667);
        eyeCur.forEach((c, i) => {
          c.x += (eyeTarget[i].x - c.x) * ek;
          c.y += (eyeTarget[i].y - c.y) * ek;
          if (Math.abs(eyeTarget[i].x - c.x) < 0.002 && Math.abs(eyeTarget[i].y - c.y) < 0.002) {
            c.x = eyeTarget[i].x;
            c.y = eyeTarget[i].y;
          } else {
            settled = false;
          }
        });
        renderEyes();
      }

      if (!settled) frame = requestAnimationFrame(tick);
    };

    const schedule = () => {
      if (frame) return;
      lastTime = performance.now();
      frame = requestAnimationFrame(tick);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
      schedule();
    };

    const onLeave = () => {
      pointer.active = false;
      schedule(); // eases back to the resting pose
    };

    // Keep the aim correct if the page scrolls while the mouse is still.
    const onScroll = () => {
      if (pointer.active) schedule();
    };

    const attach = () => {
      if (listening) return;
      listening = true;
      root.dataset.tracking = 'on';
      container.addEventListener('pointermove', onMove, { passive: true });
      container.addEventListener('pointerleave', onLeave);
      container.addEventListener('pointercancel', onLeave);
      window.addEventListener('blur', onLeave);
      window.addEventListener('scroll', onScroll, { passive: true });
    };

    const detach = () => {
      if (listening) {
        listening = false;
        container.removeEventListener('pointermove', onMove);
        container.removeEventListener('pointerleave', onLeave);
        container.removeEventListener('pointercancel', onLeave);
        window.removeEventListener('blur', onLeave);
        window.removeEventListener('scroll', onScroll);
      }
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      pointer.active = false;
      cur.x = cur.y = target.x = target.y = 0;
      tilt.style.transform = '';
      eyeCur.forEach((c, i) => {
        c.x = eyeTarget[i].x = restLook.x;
        c.y = eyeTarget[i].y = restLook.y;
      });
      renderEyes(); // pupils stay visible, at their resting gaze
      root.dataset.tracking = 'off';
    };

    // Re-evaluate if the user changes OS settings or switches input device.
    const sync = () => {
      if (!reducedMotion.matches && finePointer.matches) attach();
      else detach();
    };

    sync();
    reducedMotion.addEventListener('change', sync);
    finePointer.addEventListener('change', sync);

    return () => {
      reducedMotion.removeEventListener('change', sync);
      finePointer.removeEventListener('change', sync);
      detach();
    };
  }, [containerSelector, maxTilt, maxShift, perspective, smoothing, eyesKey, width, height]);

  if (eyes && !hasEyes && typeof console !== 'undefined') {
    console.warn('MouseFollowCharacter: pass `width` and `height` (the PNG pixel size) to use `eyes`.');
  }

  const toCqw = (px: number) => `${((px / (width ?? 1)) * 100).toFixed(4)}cqw`;

  return (
    <div
      ref={rootRef}
      className={className ? `mfc ${className}` : 'mfc'}
      data-tracking="off"
    >
      <div className="mfc__glow" aria-hidden="true" />
      <div ref={tiltRef} className="mfc__tilt">
        <div className="mfc__float">
          {/* Plain <img>: works with or without next/image optimisation. */}
          <img
            className="mfc__img"
            src={imageSrc}
            alt={alt}
            width={width}
            height={height}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            draggable={false}
          />
          {hasEyes && (
            <div
              className={eyes!.debug ? 'mfc__eyes mfc__eyes--debug' : 'mfc__eyes'}
              aria-hidden="true"
              style={
                {
                  ...(eyes!.irisColor ? { '--mfc-iris': eyes!.irisColor } : null),
                  ...(eyes!.pupilColor ? { '--mfc-pupil': eyes!.pupilColor } : null),
                } as CSSProperties
              }
            >
              {resolvedEyes.map((eye, i) => (
                <span
                  key={i}
                  className="mfc__eye"
                  style={{
                    left: `${((eye.x / width!) * 100).toFixed(4)}%`,
                    top: `${((eye.y / height!) * 100).toFixed(4)}%`,
                    width: toCqw(eye.w),
                    height: toCqw(eye.h),
                    transform: `translate(-50%, -50%) rotate(${eye.rot}deg)`,
                  }}
                >
                  <span className="mfc__eye-clip">
                    <span
                      ref={(el: HTMLSpanElement | null) => {
                        pupilRefs.current[i] = el;
                      }}
                      className={eyes!.highlight === false ? 'mfc__pupil mfc__pupil--plain' : 'mfc__pupil'}
                      style={{
                        width: toCqw(eye.size),
                        height: toCqw(eye.size),
                        transform: pupilTransform(eye, rest.x, rest.y, width!),
                      }}
                    />
                  </span>
                  {eyes!.debug && (
                    <span
                      className="mfc__eye-limit"
                      style={{ width: toCqw(eye.maxX * 2 + eye.size), height: toCqw(eye.maxY * 2 + eye.size) }}
                    />
                  )}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
