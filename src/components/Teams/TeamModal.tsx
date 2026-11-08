import React, { useState, useRef } from 'react';
import type { Team, Player } from '../../types';
import {
  X,
  Crown,
  Plus,
  Trash2,
  Users,
  Shield,
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { TeamLogo, isImageLogo } from '../Common/TeamLogo';
import { resizeImageFile } from '../../utils/imageUtils';

interface TeamModalProps {
  team?: Team | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (teamData: Omit<Team, 'id'>) => void;
}

const LOGO_PRESETS = ['👑', '⚡', '🔥', '💀', '🛡️', '🌘', '🐺', '👻', '🦅', '🎯', '⚔️', '🐲'];

export const TeamModal: React.FC<TeamModalProps> = ({
  team,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const isEditing = !!team;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(team?.name || '');
  const [tag, setTag] = useState(team?.tag || '');
  const [logo, setLogo] = useState(team?.logo || '🛡️');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [members, setMembers] = useState<Player[]>(
    team?.members || [
      { id: `p-${Date.now()}-1`, ign: 'Leader_IGN', isCaptain: true, role: 'IGL' },
      { id: `p-${Date.now()}-2`, ign: 'Sniper_IGN', isCaptain: false, role: 'Sniper' },
    ]
  );

  const handleAddPlayer = () => {
    const newPlayer: Player = {
      id: `p-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ign: `Player_${members.length + 1}`,
      isCaptain: members.length === 0,
      role: 'Fragger',
    };
    setMembers([...members, newPlayer]);
  };

  const handleUpdatePlayer = (index: number, updates: Partial<Player>) => {
    setMembers((prev) =>
      prev.map((p, i) => (i === index ? { ...p, ...updates } : p))
    );
  };

  const handleSetCaptain = (index: number) => {
    setMembers((prev) =>
      prev.map((p, i) => ({
        ...p,
        isCaptain: i === index,
      }))
    );
  };

  const handleRemovePlayer = (index: number) => {
    if (members.length <= 1) return;
    setMembers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsUploading(true);

    try {
      const dataUrl = await resizeImageFile(file, 160, 0.88);
      setLogo(dataUrl);
      setImageUrlInput('');
      setShowUrlInput(false);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to process image');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleApplyUrl = () => {
    if (!imageUrlInput.trim()) return;
    setUploadError(null);
    setLogo(imageUrlInput.trim());
    setShowUrlInput(false);
  };

  const handleRemoveCustomImage = () => {
    setLogo('🛡️');
    setImageUrlInput('');
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isSaved) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSaved(true);
      onSave({
        name: name.trim(),
        tag: tag.trim() || undefined,
        logo: logo.trim() || '🛡️',
        points: team?.points || 0,
        prize: team?.prize || '—',
        wins: team?.wins || 0,
        kills: team?.kills || 0,
        matchesPlayed: team?.matchesPlayed || 0,
        members,
      });

      setTimeout(() => {
        setIsSaved(false);
        onClose();
      }, 500);
    }, 250);
  };

  const isCustomImageActive = isImageLogo(logo);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#131722] border border-slate-700 rounded-xl p-6 shadow-2xl text-slate-100 my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">
              {isEditing ? `Edit Team — ${team.name}` : 'Register New Team'}
            </h3>
            <p className="text-xs text-slate-400">
              Configure team profile, custom logo image, members list, and assign the Captain.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Logo & Badge Section (Image is Optional) */}
          <div className="p-3.5 rounded-xl bg-[#0b0e14] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-rose-400" />
                Team Logo & Badge
              </label>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700">
                Image is Optional
              </span>
            </div>

            {/* Logo Preview & Quick Actions */}
            <div className="flex items-center gap-3.5 bg-[#121622] p-3 rounded-xl border border-slate-800/80">
              {/* Square Logo Box */}
              <div className="w-16 h-16 rounded-xl bg-slate-900 border-2 border-slate-700 flex items-center justify-center text-3xl shadow-inner flex-shrink-0 overflow-hidden relative group">
                <TeamLogo logo={logo} name={name || 'Team'} className="w-full h-full text-3xl" />
                {isUploading && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Status and Action Buttons */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  {isCustomImageActive ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Custom Image Active
                    </span>
                  ) : (
                    <span className="text-xs text-slate-300 font-medium">
                      Badge Icon Active: <span className="font-mono text-amber-400">{logo}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap text-xs">
                  {/* File Upload Trigger */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-2.5 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                  </button>

                  {/* URL Input Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Paste Link</span>
                  </button>

                  {/* Remove / Reset Image if custom image is active */}
                  {isCustomImageActive && (
                    <button
                      type="button"
                      onClick={handleRemoveCustomImage}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-700 font-medium flex items-center gap-1.5 transition-colors"
                      title="Remove image and reset to default badge"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Remove Image</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Optional Image URL Input Field */}
            {showUrlInput && (
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 space-y-2 animate-in fade-in duration-150">
                <label className="block text-[11px] font-semibold text-slate-400">
                  Image Direct URL (https://...):
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="flex-1 px-2.5 py-1.5 bg-[#0b0e14] border border-slate-700 rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-semibold"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}

            {uploadError && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Preset Badge Icons Picker */}
            <div>
              <div className="text-[11px] font-semibold text-slate-400 mb-1.5">
                Or choose an icon badge (if no custom image):
              </div>
              <div className="flex flex-wrap gap-2">
                {LOGO_PRESETS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => {
                      setLogo(icon);
                      setImageUrlInput('');
                      setUploadError(null);
                    }}
                    className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center border transition-all ${
                      logo === icon
                        ? 'bg-rose-500/20 border-rose-500 text-rose-400 scale-105 shadow'
                        : 'bg-[#121622] border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800'
                    }`}
                    title={`Select badge icon ${icon}`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Team Name and Tag Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Team Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. ZENITH ENTITY"
                required
                className="w-full px-3 py-2 bg-[#0b0e14] border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Team Tag
              </label>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="e.g. ZE"
                className="w-full px-3 py-2 bg-[#0b0e14] border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-rose-500 font-mono"
              />
            </div>
          </div>

          {/* Player Roster Section */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-rose-400" />
                Player Roster ({members.length})
              </label>
              <button
                type="button"
                onClick={handleAddPlayer}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Player
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {members.map((member, index) => (
                <div
                  key={member.id}
                  className="flex items-center gap-2 bg-[#0a0d13] p-2 rounded-lg border border-slate-800"
                >
                  <button
                    type="button"
                    title={member.isCaptain ? 'Captain' : 'Click to assign Captain'}
                    onClick={() => handleSetCaptain(index)}
                    className={`p-1.5 rounded transition-colors ${
                      member.isCaptain
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'text-slate-600 hover:text-slate-400'
                    }`}
                  >
                    <Crown className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    value={member.ign}
                    onChange={(e) => handleUpdatePlayer(index, { ign: e.target.value })}
                    placeholder="In-Game Name (IGN)"
                    required
                    className="flex-1 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white font-mono focus:outline-none focus:border-rose-500"
                  />

                  <input
                    type="text"
                    value={member.role || ''}
                    onChange={(e) => handleUpdatePlayer(index, { role: e.target.value })}
                    placeholder="Role (e.g. Sniper)"
                    className="w-28 px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-300 focus:outline-none focus:border-rose-500"
                  />

                  <button
                    type="button"
                    disabled={members.length <= 1}
                    onClick={() => handleRemovePlayer(index)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 disabled:opacity-20"
                    title="Remove player"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || isSaved}
              className="px-4 py-2 text-sm text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg active:scale-95 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isSaved}
              className={`px-5 py-2 text-sm font-semibold rounded-lg shadow-lg transition-all active:scale-95 flex items-center gap-2 ${
                isSaved
                  ? 'bg-emerald-600 text-white shadow-emerald-950/50 ring-2 ring-emerald-400'
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/40'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : isSaved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-200 stroke-[2.5]" />
                  <span>✓ Saved!</span>
                </>
              ) : (
                <span>{isEditing ? 'Save Changes' : 'Create Team'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
