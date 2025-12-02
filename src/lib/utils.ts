/*
 * Zweck: Hilfsfunktionen für CSS-Klassenkombinationen.
 * Kurz: `cn` vereinigt `clsx` und `twMerge` für Tailwind-kompatible Klassen.
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Kombiniert Klassen (conditonal) und merge für Tailwind-Utilities
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
