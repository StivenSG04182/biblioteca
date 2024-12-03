export const getYouTubeVideoId = (url: string | null): string | null => {
  if (!url) return null;
  
  try {
    const urlObj = new URL(url);
    let videoId = null;

    if (urlObj.hostname.includes('youtube.com')) {
      videoId = urlObj.searchParams.get('v');
    } else if (urlObj.hostname.includes('youtu.be')) {
      videoId = urlObj.pathname.slice(1);
    }

    // Validate video ID format
    if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return videoId;
    }
    return null;
  } catch (error) {
    console.error('Error al analizar URL de YouTube:', error);
    return null;
  }
};

export const validateYouTubeUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    const isYouTubeDomain = urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be');
    
    if (!isYouTubeDomain) return false;

    // For youtube.com, ensure it has a valid video ID
    if (urlObj.hostname.includes('youtube.com')) {
      const videoId = urlObj.searchParams.get('v');
      return !!videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId);
    }
    
    // For youtu.be, ensure the pathname is a valid video ID
    if (urlObj.hostname.includes('youtu.be')) {
      const videoId = urlObj.pathname.slice(1);
      return !!videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId);
    }

    return false;
  } catch {
    return false;
  }
};