export function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;
  }
  return null;
}

export function detectSlideType(url: string): 'canva-embed' | 'canva-short' | 'canva-view' | 'pdf' | 'other' {
  if (!url) return 'other';
  if (url.includes('canva.link')) return 'canva-short';
  if (url.includes('canva.com') && url.includes('/embed')) return 'canva-embed';
  if (url.includes('canva.com') && url.includes('/view')) return 'canva-view';
  if (url.toLowerCase().endsWith('.pdf') || url.includes('.pdf?')) return 'pdf';
  return 'other';
}

export function getSlideEmbedUrl(url: string): { embedUrl: string | null; warning: string | null } {
  if (!url) return { embedUrl: null, warning: null };
  const slideType = detectSlideType(url);
  if (slideType === 'canva-embed') return { embedUrl: url, warning: null };
  if (slideType === 'canva-view') {
    const embedUrl = url.includes('?') ? `${url}&embed` : `${url}?embed`;
    return { embedUrl, warning: null };
  }
  if (slideType === 'canva-short') {
    return { embedUrl: null, warning: 'This is a short link. Please use the embed URL from Canva (Share → Embed → Copy embed code)' };
  }
  if (slideType === 'pdf') {
    return { embedUrl: url, warning: null };
  }
  return { embedUrl: null, warning: null };
}
