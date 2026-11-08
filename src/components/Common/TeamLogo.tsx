import React, { useState } from 'react';

/**
 * Checks whether the logo string is an image URL, base64 data URI, or blob.
 */
export const isImageLogo = (logo?: string | null): boolean => {
  if (!logo || typeof logo !== 'string') return false;
  const trimmed = logo.trim();
  return (
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('/') ||
    /\.(png|jpe?g|svg|webp|gif|bmp)(\?.*)?$/i.test(trimmed)
  );
};

interface TeamLogoProps {
  logo?: string | null;
  name?: string;
  className?: string;
  fallback?: string;
  imgClassName?: string;
}

export const TeamLogo: React.FC<TeamLogoProps> = ({
  logo,
  name,
  className = '',
  fallback = '🛡️',
  imgClassName = '',
}) => {
  const [hasError, setHasError] = useState(false);

  // If logo is an image and hasn't errored out
  if (isImageLogo(logo) && !hasError) {
    return (
      <img
        src={logo!.trim()}
        alt={name ? `${name} logo` : 'Team logo'}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover select-none pointer-events-none ${imgClassName}`}
        loading="lazy"
      />
    );
  }

  // Otherwise, render text/emoji
  const displayEmoji = (!logo || logo.trim() === '' || hasError) ? fallback : logo;

  return (
    <span
      className={`inline-flex items-center justify-center select-none leading-none ${className}`}
      aria-label={name ? `${name} logo` : 'Team logo'}
    >
      {displayEmoji}
    </span>
  );
};

