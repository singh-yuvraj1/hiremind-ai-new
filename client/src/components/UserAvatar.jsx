import { useState } from 'react';

/**
 * UserAvatar
 * Renders a user's avatar with bulletproof fallbacks.
 * Handles both image URLs (e.g. Google profile photos) and Emoji avatars (👨🏻‍💻, 👩🏻‍💻, etc.).
 *
 * @param {Object|string} user - User object or avatar string
 * @param {string} [name] - Fallback name if user is a string
 * @param {string|number} [size='md'] - 'xs'|'sm'|'md'|'lg'|'xl'|'2xl' or pixel size
 * @param {string} [className=''] - Additional class names
 * @param {string} [borderColor] - Custom border color
 * @param {Function} [onClick] - Click handler
 */
export default function UserAvatar({
  user,
  name: directName,
  size = 'md',
  className = '',
  borderColor,
  onClick,
}) {
  const [imgError, setImgError] = useState(false);

  // Extract avatar and name
  const avatar = typeof user === 'string' ? user : user?.avatar || '';
  const name = typeof user === 'object' ? user?.name || '' : directName || 'User';

  // Size mapping
  const sizeMap = {
    xs:  { dim: 24, font: '0.75rem', emoji: '0.85rem' },
    sm:  { dim: 32, font: '0.875rem', emoji: '1.1rem' },
    md:  { dim: 40, font: '1rem', emoji: '1.35rem' },
    lg:  { dim: 56, font: '1.25rem', emoji: '1.75rem' },
    xl:  { dim: 80, font: '1.75rem', emoji: '2.5rem' },
    '2xl':{ dim: 96, font: '2.25rem', emoji: '3rem' },
  };

  const currentSize = typeof size === 'number'
    ? { dim: size, font: `${size * 0.4}px`, emoji: `${size * 0.55}px` }
    : sizeMap[size] || sizeMap.md;

  // Detect if avatar is an image URL
  const isImageUrl =
    typeof avatar === 'string' &&
    avatar.trim().length > 0 &&
    (avatar.startsWith('http://') ||
     avatar.startsWith('https://') ||
     avatar.startsWith('data:') ||
     avatar.startsWith('blob:') ||
     avatar.startsWith('/'));

  const isEmoji =
    typeof avatar === 'string' &&
    avatar.trim().length > 0 &&
    !isImageUrl;

  const initial = (name ? name.trim().charAt(0) : 'U').toUpperCase();

  const containerStyle = {
    width: currentSize.dim,
    height: currentSize.dim,
    minWidth: currentSize.dim,
    minHeight: currentSize.dim,
    borderRadius: '50%',
    border: borderColor ? `2px solid ${borderColor}` : '2px solid var(--border)',
    background: isEmoji ? 'rgba(0, 229, 255, 0.08)' : 'var(--accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    userSelect: 'none',
    flexShrink: 0,
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 0.2s ease',
  };

  if (isImageUrl && !imgError) {
    return (
      <div
        className={`user-avatar ${className}`}
        style={{ ...containerStyle, background: 'var(--surface)' }}
        onClick={onClick}
      >
        <img
          src={avatar}
          alt={name}
          onError={() => setImgError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      </div>
    );
  }

  if (isEmoji) {
    return (
      <div
        className={`user-avatar ${className}`}
        style={containerStyle}
        onClick={onClick}
        title={name}
      >
        <span
          style={{
            fontSize: currentSize.emoji,
            lineHeight: 1,
            display: 'inline-block',
            transform: 'translateY(1px)',
          }}
        >
          {avatar}
        </span>
      </div>
    );
  }

  // Fallback initial or icon
  return (
    <div
      className={`user-avatar ${className}`}
      style={{
        ...containerStyle,
        color: '#ffffff',
        fontWeight: 700,
        fontSize: currentSize.font,
      }}
      onClick={onClick}
      title={name}
    >
      {initial || '👤'}
    </div>
  );
}
