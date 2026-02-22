import { gsap } from 'gsap'

// Staggered fade+slide entry animation.
export function useStagger(
  selector: string,
  delay: number = 0.2,
  duration: number = 0.6,
  stagger: number = 0.15,
) {
  gsap.from(selector, {
    opacity: 0,
    y: 20,
    duration,
    delay,
    stagger,
    ease: 'power2.out',
  })
}
