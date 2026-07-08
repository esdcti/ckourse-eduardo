import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";

import type {
  Course,
  CourseDetail,
  Note,
  NoteWithCourse,
  FavoriteLesson,
  Subtitle,
  SaveCourseConfig,
  ParsedCourse,
  DashboardStats,
  ProgressData,
  LibraryStats,
  SearchResult,
} from "@/types";

let syncTimeout: ReturnType<typeof setTimeout> | null = null;
const syncListeners: Set<(syncing: boolean) => void> = new Set();
let hasPendingSync = false;

// Register close handler to flush pending syncs
try {
  getCurrentWindow().onCloseRequested(async (event) => {
    if (hasPendingSync) {
      event.preventDefault(); // Stop normal close
      if (syncTimeout) clearTimeout(syncTimeout);
      notifySync(true);
      try {
        await invoke("backup_database_to_drive");
      } catch (e) {
        console.log("Final sync failed", e);
      }
      await getCurrentWindow().destroy();
    }
  });
} catch (e) {
  console.log("Could not register window close listener", e);
}

export function onSyncStateChange(listener: (syncing: boolean) => void) {
  syncListeners.add(listener);
  return () => syncListeners.delete(listener);
}

function notifySync(state: boolean) {
  syncListeners.forEach(l => l(state));
}

export function triggerDebouncedSync() {
  hasPendingSync = true;
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }
  syncTimeout = setTimeout(async () => {
    try {
      notifySync(true);
      await invoke("backup_database_to_drive");
      hasPendingSync = false;
    } catch (e) {
      console.log("Auto-sync skipped or failed:", e);
    } finally {
      notifySync(false);
    }
  }, 15000);
}

export async function getCourses(): Promise<Course[]> {
  return invoke<Course[]>("get_courses");
}

export async function getCourse(courseId: number): Promise<Course | null> {
  return invoke<Course | null>("get_course", { courseId });
}

export async function getCourseDetail(
  courseId: number,
): Promise<CourseDetail | null> {
  return invoke<CourseDetail | null>("get_course_detail", { courseId });
}

export async function importCourse(
  parsed: ParsedCourse,
  config: SaveCourseConfig,
): Promise<number> {
  return invoke<number>("import_course", { parsed, config });
}

export async function updateCourse(
  courseId: number,
  title: string,
  author: string,
  accentColor: string,
  category: string,
): Promise<void> {
  return invoke("update_course", { courseId, title, author, accentColor, category });
}

export async function resetCourseProgress(courseId: number): Promise<void> {
  return invoke("reset_course_progress", { courseId });
}

export async function deleteCourse(courseId: number): Promise<void> {
  return invoke("delete_course", { courseId });
}

export async function toggleLessonCompleted(
  lessonId: number,
): Promise<boolean> {
  const res = await invoke<boolean>("toggle_lesson_completed", { lessonId });
  triggerDebouncedSync();
  return res;
}

export async function updateLessonDuration(
  lessonId: number,
  duration: number,
): Promise<void> {
  return invoke("update_lesson_duration", { lessonId, duration });
}

export async function saveLessonPosition(
  lessonId: number,
  position: number,
): Promise<void> {
  await invoke("save_lesson_position", { lessonId, position });
  triggerDebouncedSync();
}

export async function setLastWatched(
  courseId: number,
  lessonId: number,
): Promise<void> {
  await invoke("set_last_watched", { courseId, lessonId });
  triggerDebouncedSync();
}

export async function getAllNotes(): Promise<NoteWithCourse[]> {
  return invoke<NoteWithCourse[]>("get_all_notes");
}

export async function getCourseNotes(courseId: number): Promise<Note[]> {
  return invoke<Note[]>("get_course_notes", { courseId });
}

export async function addNote(
  courseId: number,
  lessonId: number,
  lessonTitle: string,
  content: string,
): Promise<Note> {
  const res = await invoke<Note>("add_note", { courseId, lessonId, lessonTitle, content });
  triggerDebouncedSync();
  return res;
}

export async function updateNote(
  noteId: number,
  content: string,
): Promise<void> {
  await invoke("update_note", { noteId, content });
  triggerDebouncedSync();
}

export async function deleteNote(noteId: number): Promise<void> {
  await invoke("delete_note", { noteId });
  triggerDebouncedSync();
}

export async function toggleBookmark(courseId: number): Promise<boolean> {
  const res = await invoke<boolean>("toggle_bookmark", { courseId });
  triggerDebouncedSync();
  return res;
}

export async function toggleFavorite(lessonId: number): Promise<boolean> {
  const res = await invoke<boolean>("toggle_favorite", { lessonId });
  triggerDebouncedSync();
  return res;
}

export async function getAllFavorites(): Promise<FavoriteLesson[]> {
  return invoke<FavoriteLesson[]>("get_all_favorites");
}

export async function getBookmarkedCourses(): Promise<Course[]> {
  return invoke<Course[]>("get_bookmarked_courses");
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return invoke<DashboardStats>("get_dashboard_stats");
}

export async function getProgressData(): Promise<ProgressData> {
  return invoke<ProgressData>("get_progress_data");
}

export async function getLessonSubtitles(
  lessonId: number,
): Promise<Subtitle[]> {
  return invoke<Subtitle[]>("get_lesson_subtitles", { lessonId });
}

export async function getSubtitleVtt(path: string): Promise<string> {
  return invoke<string>("get_subtitle_vtt", { path });
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const pairs = await invoke<[string, string][]>("get_all_settings");
  return Object.fromEntries(pairs);
}

export async function setSetting(key: string, value: string): Promise<void> {
  return invoke("set_setting", { key, value });
}

export async function getLibraryStats(): Promise<LibraryStats> {
  return invoke<LibraryStats>("get_library_stats");
}

export async function deleteAllData(): Promise<void> {
  return invoke("delete_all_data");
}

export async function getCustomCategories(): Promise<string[]> {
  return invoke<string[]>("get_custom_categories");
}

export async function addCustomCategory(name: string): Promise<void> {
  return invoke("add_custom_category", { name });
}

export async function deleteCustomCategory(name: string): Promise<void> {
  return invoke("delete_custom_category", { name });
}

export async function searchContent(query: string): Promise<SearchResult[]> {
  return invoke<SearchResult[]>("search_content", { query });
}

export interface PortableInfo {
  isPortable: boolean;
  dataDir: string;
  customDataDir: string | null;
}

export async function getPortableInfo(): Promise<PortableInfo> {
  return invoke<PortableInfo>("get_portable_info");
}

export async function exportDatabase(destination: string): Promise<string> {
  return invoke<string>("export_database", { destination });
}

export async function importDatabase(source: string): Promise<string> {
  return invoke<string>("import_database", { source });
}

export async function getCourseTags(courseId: number): Promise<string[]> {
  return invoke<string[]>("get_course_tags", { courseId });
}

export async function setCourseTags(courseId: number, tags: string[]): Promise<void> {
  return invoke("set_course_tags", { courseId, tags });
}

export async function getAllTags(): Promise<string[]> {
  return invoke<string[]>("get_all_tags");
}

export interface YtDlpStatus {
  available: boolean;
  version: string | null;
}

export async function checkYtdlp(): Promise<YtDlpStatus> {
  return invoke<YtDlpStatus>("check_ytdlp");
}

export async function downloadYoutubePlaylist(url: string, outputDir: string): Promise<string> {
  return invoke<string>("download_youtube_playlist", { url, outputDir });
}

export async function setCustomDataDir(path: string): Promise<string> {
  return invoke<string>("set_custom_data_dir", { path });
}

export async function getCourseSpeed(courseId: number): Promise<number | null> {
  const pairs = await getAllSettings();
  const val = pairs[`speed_course_${courseId}`];
  return val ? Number(val) : null;
}

export async function setCourseSpeed(courseId: number, speed: number): Promise<void> {
  return setSetting(`speed_course_${courseId}`, String(speed));
}

export function exportNotesAsMarkdown(notes: { lessonTitle: string; content: string; courseTitle: string; updatedAt: string }[]): string {
  const lines: string[] = ["# Notas\n"];
  let currentCourse = "";

  for (const note of notes) {
    if (note.courseTitle !== currentCourse) {
      currentCourse = note.courseTitle;
      lines.push(`\n## ${currentCourse}\n`);
    }

    lines.push(`### ${note.lessonTitle}\n`);

    // Convert HTML to markdown-ish plain text
    let text = note.content;
    text = text.replace(/<b>(.*?)<\/b>/gi, "**$1**");
    text = text.replace(/<strong>(.*?)<\/strong>/gi, "**$1**");
    text = text.replace(/<i>(.*?)<\/i>/gi, "*$1*");
    text = text.replace(/<em>(.*?)<\/em>/gi, "*$1*");
    text = text.replace(/<u>(.*?)<\/u>/gi, "$1");
    text = text.replace(/<s>(.*?)<\/s>/gi, "~~$1~~");
    text = text.replace(/<strike>(.*?)<\/strike>/gi, "~~$1~~");
    text = text.replace(/<del>(.*?)<\/del>/gi, "~~$1~~");
    // Convert timestamps to [MM:SS] format
    text = text.replace(/<span[^>]*class="note-timestamp"[^>]*data-timestamp="(\d+)"[^>]*>([^<]*)<\/span>/gi, "[$2]");
    // Strip remaining HTML
    text = text.replace(/<br\s*\/?>/gi, "\n");
    text = text.replace(/<\/p>/gi, "\n");
    text = text.replace(/<[^>]+>/g, "");
    text = text.replace(/&nbsp;/g, " ");
    text = text.replace(/&amp;/g, "&");
    text = text.replace(/&lt;/g, "<");
    text = text.replace(/&gt;/g, ">");

    lines.push(text.trim());
    lines.push(`\n> _${new Date(note.updatedAt).toLocaleDateString()}_\n`);
  }

  return lines.join("\n");
}
