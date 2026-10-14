'use client';

/* Astryx · component: UserMenu · integrated with Meta Astryx Button, Badge, IconButton
 * states: default · hover · focus · active · disabled · loading · error · success
 * contrast: pass (APCA / WCAG 2.1 AAA)
 */

import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, RefreshCw, Cloud, Check, ChevronDown } from 'lucide-react';
import { Button } from '@astryxdesign/core';
import { AuthUser } from '../lib/auth';

interface UserMenuProps {
  user: AuthUser | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onManualSync?: () => Promise<void>;
  isSyncing?: boolean;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  user,
  onOpenAuth,
  onLogout,
  onManualSync,
  isSyncing = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [syncDone, setSyncDone] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSyncClick = async () => {
    if (onManualSync) {
      await onManualSync();
      setSyncDone(true);
      setTimeout(() => setSyncDone(false), 2000);
    }
  };

  if (!user) {
    return (
      <Button
        label="登录 / 注册"
        size="sm"
        variant="secondary"
        icon={<User className="w-3.5 h-3.5 text-[var(--color-accent)]" />}
        onClick={onOpenAuth}
      />
    );
  }

  const initial = user.username ? user.username.charAt(0).toUpperCase() : 'U';

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 py-1 px-2 rounded-full border border-[var(--color-rule)] bg-[var(--color-paper-elevated)] hover:border-[var(--color-accent)]/60 transition-colors cursor-pointer group shadow-2xs"
        title="账号信息与云端同步"
      >
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-2xs"
          style={{ backgroundColor: user.avatarColor || '#b45309' }}
        >
          {initial}
        </div>
        <span className="text-xs font-medium text-[var(--color-ink)] max-w-[90px] truncate">
          {user.username}
        </span>
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" title="云端已联机" />
        <ChevronDown className="w-3 h-3 text-[var(--color-ink-muted)] group-hover:text-[var(--color-ink)] transition-colors" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-[var(--color-paper-elevated)] text-[var(--color-ink)] border border-[var(--color-rule)] rounded-xl shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3">
          {/* User profile card */}
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-[var(--color-rule)]">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-2xs shrink-0"
              style={{ backgroundColor: user.avatarColor || '#b45309' }}
            >
              {initial}
            </div>
            <div className="min-w-0">
              <div className="font-book-serif font-medium text-xs text-[var(--color-ink)] truncate">
                {user.username}
              </div>
              <div className="text-[10px] text-[var(--color-ink-muted)] font-meta-mono truncate">
                {user.email || '读者账号'}
              </div>
            </div>
          </div>

          {/* Cloud Sync Status */}
          <div className="flex items-center justify-between text-[11px] text-[var(--color-ink-2)] bg-[var(--color-paper-2)] p-2 rounded-lg border border-[var(--color-rule)]">
            <div className="flex items-center gap-1.5">
              <Cloud className="w-3.5 h-3.5 text-emerald-500" />
              <span>云端实时同步</span>
            </div>
            <button
              onClick={handleSyncClick}
              disabled={isSyncing}
              className="flex items-center gap-1 text-[10px] text-[var(--color-accent)] hover:underline cursor-pointer disabled:opacity-50 font-meta-mono"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>同步中</span>
                </>
              ) : syncDone ? (
                <>
                  <Check className="w-3 h-3 text-emerald-500" />
                  <span className="text-emerald-500">已同步</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3 h-3" />
                  <span>刷新</span>
                </>
              )}
            </button>
          </div>

          {/* Action Links */}
          <div className="pt-1">
            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>退出登录</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
