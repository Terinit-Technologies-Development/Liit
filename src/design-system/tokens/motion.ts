/**
 * Motion Tokens (Duration & Easing)
 * Reduced-motion aware primitives.
 */

export const motionTokens = {
  durations: {
    quick: 150,
    standard: 250,
    modal: 350,
    listEntrance: 400,
  },
  easing: {
    easeOut: [0.16, 1, 0.3, 1] as const,
    easeInOut: [0.4, 0, 0.2, 1] as const,
    springSoft: { damping: 15, stiffness: 120 },
    springBouncy: { damping: 10, stiffness: 180 },
  },
};
