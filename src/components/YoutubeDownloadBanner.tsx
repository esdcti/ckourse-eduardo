import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useYoutubeDownload } from "@/hooks/useYoutubeDownload";
import { EASE_OUT } from "@/lib/constants";

export function YoutubeDownloadBanner() {
  const { active, progress, error, parsedCourse, folderPath, dismiss } = useYoutubeDownload();
  const navigate = useNavigate();

  if (!active) return null;

  const isDone = progress?.status === "done";
  const isError = !!error;
  const percent = progress?.percent ?? 0;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center px-6"
      style={{ animation: `card-in 300ms ${EASE_OUT} both` }}
    >
      <div className="pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-xl border border-border bg-card/95 p-3 pl-4 shadow-lg backdrop-blur">
        {/* Icon / spinner */}
        <div className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          isError ? "bg-destructive/15 text-destructive" : isDone ? "bg-primary/15 text-primary" : "bg-primary/15 text-primary",
        )}>
          {isError ? (
            <span className="text-sm">✕</span>
          ) : isDone ? (
            <span className="text-sm">✓</span>
          ) : (
            <div className="size-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <p className="font-sans text-sm font-semibold text-foreground">
              {isError ? "Erro no download" : isDone ? "Download concluído!" : "Baixando do YouTube"}
            </p>
            {progress?.videoIndex && progress?.totalVideos && !isDone && (
              <span className="shrink-0 font-mono text-xs text-muted-foreground">
                {progress.videoIndex}/{progress.totalVideos}
              </span>
            )}
          </div>

          {progress?.videoTitle && !isDone && (
            <p className="truncate font-sans text-xs text-muted-foreground">
              {progress.videoTitle}
            </p>
          )}

          {isError && (
            <p className="truncate font-sans text-xs text-destructive">{error}</p>
          )}

          {!isDone && !isError && (
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-300"
                style={{ width: `${Math.min(percent, 100)}%` }}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        {isDone && parsedCourse && (
          <button
            onClick={() => {
              navigate("/import", { state: { parsedCourse, folderPath } });
              dismiss();
            }}
            className="shrink-0 rounded-lg bg-primary px-3 py-2 font-sans text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Importar
          </button>
        )}

        {(isDone || isError) && (
          <button
            onClick={dismiss}
            className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
