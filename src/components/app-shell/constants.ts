import {
  SquaresFourIcon as SquaresFour,
  ChartBarIcon as ChartBar,
  BookmarkSimpleIcon as BookmarkSimple,
  NotepadIcon as Notepad,
  GearSixIcon as GearSix,
} from "@phosphor-icons/react";
import { EASE } from "@/lib/constants";
import type { NavItem } from "@/types";
import type { Translations } from "@/lib/i18n";

export { EASE };
export const DUR = "500ms";
export const spring = (extra = "") =>
  `${extra ? extra + " " : ""}${DUR} ${EASE}`.trim();

export const navigationItems: NavItem[] = [
  { icon: SquaresFour, label: "Dashboard", path: "/", i18nKey: "dashboard" },
  { icon: BookmarkSimple, label: "Bookmarks", path: "/bookmarks", i18nKey: "bookmarks" },
  { icon: ChartBar, label: "Progress", path: "/progress", i18nKey: "progress" },
  { icon: Notepad, label: "Notes", path: "/notes", i18nKey: "notes" },
];

export const appItems: NavItem[] = [
  { icon: GearSix, label: "Settings", path: "/settings", i18nKey: "settings" },
];

export function getRouteTitles(t: Translations): Record<string, string> {
  return {
    "/": t.dashboard,
    "/bookmarks": t.bookmarks,
    "/progress": t.progress,
    "/notes": t.notes,
    "/settings": t.settings,
    "/import": t.importCourse,
  };
}

export const routeTitles: Record<string, string> = {
  "/": "Dashboard",
  "/bookmarks": "Bookmarks",
  "/progress": "Progress",
  "/notes": "Notes",
  "/settings": "Settings",
  "/import": "Import Course",
};
