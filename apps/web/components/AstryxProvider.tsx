'use client';

import React from 'react';
import { Theme } from '@astryxdesign/core';
import { themes, defaultThemeSlug } from '../astryx-themes';

export function AstryxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Theme theme={themes[defaultThemeSlug]} mode="system">
      {children}
    </Theme>
  );
}
