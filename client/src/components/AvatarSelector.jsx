import { useState } from 'react';
import { motion } from 'framer-motion';

export const MALE_AVATARS = [
  { emoji: '👨🏻‍💻', label: 'Tech Pro (Light)' },
  { emoji: '👨🏽‍💻', label: 'Tech Pro (Warm)' },
  { emoji: '👨🏻‍💼', label: 'Business Executive (Light)' },
  { emoji: '👨🏽‍💼', label: 'Business Executive (Warm)' },
  { emoji: '🧑🏻‍💻', label: 'Developer (Light)' },
  { emoji: '👨‍💼', label: 'Manager' },
  { emoji: '👨‍🎓', label: 'Graduate' },
  { emoji: '👨‍🔬', label: 'Data Scientist' },
];

export const FEMALE_AVATARS = [
  { emoji: '👩🏻‍💻', label: 'Tech Pro (Light)' },
  { emoji: '👩🏽‍💻', label: 'Tech Pro (Warm)' },
  { emoji: '👩🏻‍💼', label: 'Business Executive (Light)' },
  { emoji: '👩🏽‍💼', label: 'Business Executive (Warm)' },
  { emoji: '🧑🏻‍💼', label: 'Engineering Lead' },
  { emoji: '👩‍💼', label: 'Manager' },
  { emoji: '👩‍🎓', label: 'Graduate' },
  { emoji: '👩🏻‍🔬', label: 'Research Scientist' },
];

/**
 * AvatarSelector
 * Renders an interactive male and female emoji avatar picker.
 *
 * @param {string} selectedAvatar - Currently selected emoji or avatar string
 * @param {Function} onSelect - Callback when an avatar is selected: (avatar) => void
 * @param {boolean} [isSaving=false] - Whether save API request is currently in progress
 */
export default function AvatarSelector({
  selectedAvatar = '',
  onSelect,
  isSaving = false,
}) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'male' | 'female'

  const handleSelect = (emoji) => {
    if (isSaving || selectedAvatar === emoji) return;
    onSelect?.(emoji);
  };

  return (
    <div className="w-full space-y-5">
      {/* Tab Filter Controls */}
      <div className="flex items-center gap-2">
        {[
          { id: 'all',    label: '✨ All Avatars' },
          { id: 'male',   label: '👨 Male Styles' },
          { id: 'female', label: '👩 Female Styles' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className="text-xs px-3.5 py-1.5 rounded-lg font-medium transition-all"
              style={{
                background: isActive ? 'var(--accent-bg)' : 'rgba(128,128,128,0.06)',
                color: isActive ? 'var(--accent)' : 'var(--muted)',
                border: `1px solid ${isActive ? 'var(--accent-border)' : 'var(--border)'}`,
                boxShadow: isActive ? '0 0 12px rgba(0,229,255,0.18)' : 'none',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Male Section */}
      {(activeTab === 'all' || activeTab === 'male') && (
        <div>
          <p className="text-xs font-semibold t-muted uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <span>👨</span> Male Avatars
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {MALE_AVATARS.map(({ emoji, label }) => {
              const isSelected = selectedAvatar === emoji;
              return (
                <AvatarOption
                  key={emoji}
                  emoji={emoji}
                  label={label}
                  isSelected={isSelected}
                  isSaving={isSaving && isSelected}
                  onClick={() => handleSelect(emoji)}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Female Section */}
      {(activeTab === 'all' || activeTab === 'female') && (
        <div>
          <p className="text-xs font-semibold t-muted uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <span>👩</span> Female Avatars
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {FEMALE_AVATARS.map(({ emoji, label }) => {
              const isSelected = selectedAvatar === emoji;
              return (
                <AvatarOption
                  key={emoji}
                  emoji={emoji}
                  label={label}
                  isSelected={isSelected}
                  isSaving={isSaving && isSelected}
                  onClick={() => handleSelect(emoji)}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function AvatarOption({ emoji, label, isSelected, isSaving, onClick }) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      aria-label={`Select ${label}`}
      title={label}
      className="relative rounded-2xl p-2.5 flex items-center justify-center transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
      style={{
        width: '100%',
        aspectRatio: '1 / 1',
        background: isSelected
          ? 'linear-gradient(135deg, rgba(0,229,255,0.18), rgba(41,121,255,0.12))'
          : 'rgba(128, 128, 128, 0.05)',
        border: isSelected
          ? '2px solid var(--accent)'
          : '1px solid var(--border)',
        boxShadow: isSelected
          ? '0 0 18px rgba(0, 229, 255, 0.35)'
          : 'none',
      }}
    >
      <span className="text-2xl sm:text-3xl select-none leading-none transform translate-y-[1px]">
        {emoji}
      </span>

      {/* Selected checkmark indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-black font-bold"
          style={{
            background: 'var(--accent)',
            boxShadow: '0 0 8px rgba(0,229,255,0.6)',
          }}
        >
          {isSaving ? (
            <span className="w-2.5 h-2.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            '✓'
          )}
        </motion.div>
      )}
    </motion.button>
  );
}
