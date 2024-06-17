"use client";

import * as React from "react";
import { NextUIProvider } from "@nextui-org/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProviderProps } from "next-themes/dist/types";
import { Toaster } from "sonner";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();

  return (
    <NextUIProvider
      className="w-full h-full overflow-hidden flex flex-col justify-center items-center"
      navigate={router.push}
    >
      <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
      <Toaster richColors position="top-center" />
    </NextUIProvider>
  );
}
