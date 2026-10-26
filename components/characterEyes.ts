import type { MouseFollowEyesConfig } from './MouseFollowCharacter';

/**
 * Eye alignment for /public/shiras-character-blank-eyes.png (640 × 1107 px).
 * All numbers are PIXELS IN THAT PNG — open it in any image editor, hover an
 * eye, and read the coordinates. "left"/"right" are as seen by the viewer.
 *
 * Fine-tuning tips:
 *   - Set `debug: true` to draw the eye opening (red) and pupil travel limit (cyan).
 *   - x / y         → nudge the eye centre.
 *   - width / height → size of the visible eye opening (the pupil is clipped to it).
 *   - rotate        → tilt of the eye opening in degrees.
 *   - pupilSize     → pupil diameter.
 *   - maxMoveX/Y    → how far the pupil may travel from the centre.
 */
export const shirasEyes: MouseFollowEyesConfig = {
  left: { x: 217.3, y: 183.4, width: 23.1, height: 9.4, rotate: -15.9 },
  right: { x: 287.6, y: 164.3, width: 26.4, height: 9.8, rotate: -8.7 },
  pupilSize: 10,
  maxMoveX: 4.5,
  maxMoveY: 1.2,
  smoothing: 0.22,
  reach: 0.5,
  restLook: { x: 0, y: 0 },
  irisColor: '#4a2d1a',
  pupilColor: '#050302',
  highlight: true,
  debug: false,
};
