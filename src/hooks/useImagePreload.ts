import { useEffect, useMemo, useState } from 'react';

interface UseImagePreloadResult {
  /** Indicates whether all provided image URLs have finished loading at least once */
  isLoaded: boolean;
}

/**
 * Preloads image assets and injects runtime `<link rel="preload" as="image">` tags for faster fetch start.
 * Ensures duplicate preload links are avoided and resolves once every image finishes loading regardless of success.
 *
 * @param urls Collection of image URLs that should be preloaded
 * @returns {UseImagePreloadResult} Loading state once all images have either loaded or errored
 */
const useImagePreload = (urls: string[]): UseImagePreloadResult => {
  const [isLoaded, setIsLoaded] = useState(false);

  const uniqueUrls = useMemo(() => {
    const filtered = urls.filter(Boolean);
    return Array.from(new Set(filtered));
  }, [urls]);

  useEffect(() => {
    if (uniqueUrls.length === 0) {
      setIsLoaded(true);
      return undefined;
    }

    let isActive = true;
    setIsLoaded(false);

    const createdPreloadLinks: HTMLLinkElement[] = [];

    const ensurePreloadLink = (url: string) => {
      const absoluteUrl = new URL(url, window.location.href).href;
      const preloadLinks = document.querySelectorAll<HTMLLinkElement>('link[rel="preload"][as="image"]');

      const existing = Array.from(preloadLinks).find(link => link.href === absoluteUrl);

      if (!existing) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = url;
        link.dataset.generatedByPreloadHook = 'true';
        document.head.appendChild(link);
        createdPreloadLinks.push(link);
      }
    };

    uniqueUrls.forEach(ensurePreloadLink);

    const loadImage = (url: string) => new Promise<void>(resolve => {
      const image = new Image();
      image.onload = () => resolve();
      image.onerror = () => resolve();
      image.src = url;
    });

    Promise.all(uniqueUrls.map(loadImage)).then(() => {
      if (isActive) {
        setIsLoaded(true);
      }
    });

    return () => {
      isActive = false;
      createdPreloadLinks.forEach(link => {
        if (link.dataset.generatedByPreloadHook === 'true') {
          link.remove();
        }
      });
    };
  }, [uniqueUrls]);

  return { isLoaded };
};

export default useImagePreload;
