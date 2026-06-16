import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { listen } from "@tauri-apps/api/event";
import { downloadYoutubePlaylist, checkYtdlp } from "@/lib/store";
import { parseCourseFolder } from "@/lib/courseParser";
import type { ParsedCourse } from "@/types";

export interface YtProgress {
  status: string;
  message: string;
  percent: number;
  videoTitle: string | null;
  videoIndex: number | null;
  totalVideos: number | null;
}

export interface YoutubeDownloadState {
  active: boolean;
  progress: YtProgress | null;
  error: string | null;
  parsedCourse: ParsedCourse | null;
  folderPath: string | null;
  start: (url: string, outputDir: string) => Promise<void>;
  dismiss: () => void;
}

const defaultState: YoutubeDownloadState = {
  active: false,
  progress: null,
  error: null,
  parsedCourse: null,
  folderPath: null,
  start: async () => {},
  dismiss: () => {},
};

export const YoutubeDownloadContext = createContext<YoutubeDownloadState>(defaultState);

export function useYoutubeDownload() {
  return useContext(YoutubeDownloadContext);
}

export function useYoutubeDownloadProvider(): YoutubeDownloadState {
  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState<YtProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [parsedCourse, setParsedCourse] = useState<ParsedCourse | null>(null);
  const [folderPath, setFolderPath] = useState<string | null>(null);
  const unlistenRef = useRef<(() => void) | null>(null);

  // Global event listener - active whenever download is running
  useEffect(() => {
    if (!active) return;

    let cancelled = false;
    const setup = async () => {
      const unlisten = await listen<YtProgress>("ytdlp-progress", (event) => {
        if (!cancelled) {
          setProgress(event.payload);
        }
      });
      unlistenRef.current = unlisten;
    };
    setup();

    return () => {
      cancelled = true;
      unlistenRef.current?.();
      unlistenRef.current = null;
    };
  }, [active]);

  const start = useCallback(async (url: string, outputDir: string) => {
    setActive(true);
    setProgress(null);
    setError(null);
    setParsedCourse(null);
    setFolderPath(null);

    try {
      const status = await checkYtdlp();
      if (!status.available) {
        setError("yt-dlp não encontrado. Instale e adicione ao PATH.");
        setActive(false);
        return;
      }

      const folder = await downloadYoutubePlaylist(url, outputDir);
      setFolderPath(folder);

      // Auto-parse and auto-import the course
      try {
        const parsed = await parseCourseFolder(folder);
        setParsedCourse(parsed);

        // Auto-import with defaults
        const { importCourse } = await import("@/lib/store");
        await importCourse(parsed, {
          title: parsed.title,
          author: "",
          accentColor: "#61DAFB",
          category: "other",
        });
      } catch {
        // Parse/import failed - user can import manually via the banner button
      }

      setProgress({
        status: "done",
        message: "Download concluído!",
        percent: 100,
        videoTitle: null,
        videoIndex: null,
        totalVideos: null,
      });
    } catch (err) {
      setError(typeof err === "string" ? err : "Erro ao baixar");
      setActive(false);
    }
  }, []);

  const dismiss = useCallback(() => {
    setActive(false);
    setProgress(null);
    setError(null);
    setParsedCourse(null);
    setFolderPath(null);
  }, []);

  return { active, progress, error, parsedCourse, folderPath, start, dismiss };
}
