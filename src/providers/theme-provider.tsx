"use client";

import {THEMES} from "@/configs";
import {ThemeProvider as NextThemesProvider} from "next-themes";

export function ThemeProvider({children}: {children: React.ReactNode}) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      themes={THEMES.map(theme => theme.id)}>
      {children}
    </NextThemesProvider>
  );
}
