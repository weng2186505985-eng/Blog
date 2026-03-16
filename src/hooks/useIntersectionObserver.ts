import { useEffect } from 'react';

export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' },
  triggerOnce: boolean = true
) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        element.classList.add('in-view');
        if (triggerOnce) observer.unobserve(element);
      } else if (!triggerOnce) {
        element.classList.remove('in-view');
      }
    }, options);

    observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [ref, options, triggerOnce]);
}
