export const easeOutExpo: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const easeSoft: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

export const transitions = {
  slow: { duration: 1.4, ease: easeOutExpo },
  medium: { duration: 0.85, ease: easeSoft },
  fast: { duration: 0.45, ease: easeSoft }
};

export const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: transitions.medium },
  exit: { opacity: 0, y: -16, transition: transitions.fast }
};

export const softScale = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition: transitions.slow },
  exit: { opacity: 0, scale: 0.98, transition: transitions.fast }
};
