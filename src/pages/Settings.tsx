import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { usePageVisible } from "@/hooks/usePageVisible";
import { useSettings } from "@/hooks/useSettings";
import {
  GearSixIcon as GearSix,
  PlayIcon as Play,
  DatabaseIcon as Database,
  FolderIcon as Folder,
  NotepadIcon as Notepad,
  BookmarkSimpleIcon as BookmarkSimple,
  HeartIcon as Heart,
  SpinnerGapIcon as SpinnerGap,
  StackIcon as Stack,
  MonitorPlayIcon as MonitorPlay,
  ArrowsClockwiseIcon as ArrowsClockwise,
  FastForwardIcon as FastForward,
  SpeakerHighIcon as SpeakerHigh,
  SkipForwardIcon as SkipForward,
  TrashIcon as Trash,
  WarningCircleIcon as WarningCircle,
  XIcon as X,
  GoogleDriveLogoIcon as GoogleDriveLogo,
  CloudIcon as Cloud,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { LibraryStats } from "@/types";
import { getLibraryStats, deleteAllData, getPortableInfo, setCustomDataDir } from "@/lib/store";
import { open } from "@tauri-apps/plugin-dialog";
import { EASE_OUT } from "@/lib/constants";
import { useUpdater } from "@/hooks/useUpdater";
import { getVersion } from "@tauri-apps/api/app";
import { invoke } from "@tauri-apps/api/core";
import { useI18n } from "@/lib/i18n";
import { LOCALES } from "@/lib/i18n";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200",
        checked ? "bg-primary" : "bg-border",
      )}
    >
      <span
        className={cn(
          "block size-4.5 rounded-full bg-background shadow-sm transition-transform duration-200",
          checked ? "translate-x-[22px]" : "translate-x-[2px]",
        )}
      />
    </button>
  );
}

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
}

function Select({ value, onChange, options }: SelectProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "appearance-none rounded-lg border border-border bg-secondary px-3 py-1.5",
          "font-sans text-sm text-foreground outline-none",
          "cursor-pointer transition-colors hover:border-muted-foreground/30",
          "pr-8",
        )}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

interface SectionCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  index: number;
}

function SectionCard({ title, icon, children, index }: SectionCardProps) {
  return (
    <div
      className="relative"
      style={{
        animation: `card-in 350ms ${EASE_OUT} ${index * 60}ms both`,
      }}
    >
      <div className="squircle-subtle absolute inset-0 bg-border/50" />
      <div className="squircle-subtle absolute inset-px bg-card" />
      <div className="relative p-5">
        <div className="mb-4 flex items-center gap-2">
          {icon}
          <h3 className="font-heading text-sm font-bold text-foreground">{title}</h3>
        </div>
        <div className="flex flex-col gap-0.5">{children}</div>
      </div>
    </div>
  );
}

interface SettingRowProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  children: React.ReactNode;
}

function SettingRow({ icon, label, description, children }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg px-2 py-3">
      <div className="flex items-center gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
          {icon}
        </div>
        <div>
          <div className="font-sans text-sm font-medium text-foreground">{label}</div>
          {description && (
            <div className="font-sans text-xs text-muted-foreground">{description}</div>
          )}
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

interface StatChipProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

function StatChip({ icon, label, value }: StatChipProps) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg bg-secondary/50 px-3 py-2.5">
      <div className="text-muted-foreground">{icon}</div>
      <div>
        <div className="font-mono text-sm font-bold text-foreground">{value}</div>
        <div className="font-sans text-[11px] text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

function DeleteConfirmDialog({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const t = useI18n();
  const [input, setInput] = useState("");
  const matches = input.toLowerCase().trim() === t.confirmPhrase;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div
        className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl"
        style={{ animation: `card-in 250ms ${EASE_OUT} both` }}
      >
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-4" />
        </button>

        <div className="mb-4 flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/15">
            <WarningCircle className="size-5 text-destructive" weight="bold" />
          </div>
          <div>
            <h3 className="font-heading text-base font-bold text-foreground">
              {t.deleteAllData}
            </h3>
            <p className="font-sans text-xs text-muted-foreground">
              {t.cannotBeUndone}
            </p>
          </div>
        </div>

        <p className="mb-4 font-sans text-sm text-muted-foreground">
          {t.permanentlyRemove}
        </p>

        <div className="mb-4">
          <label className="mb-1.5 block font-sans text-xs font-medium text-muted-foreground">
            {t.typeToConfirm} <span className="font-mono font-bold text-foreground">{t.confirmPhrase}</span> {t.cannotBeUndone.toLowerCase().includes("confirm") ? "" : ""}
          </label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.confirmPhrase}
            autoFocus
            className={cn(
              "w-full rounded-lg border bg-secondary px-3 py-2",
              "font-mono text-sm text-foreground placeholder:text-muted-foreground/40",
              "outline-none transition-colors",
              matches ? "border-destructive" : "border-border",
            )}
            onKeyDown={(e) => {
              if (e.key === "Enter" && matches) onConfirm();
              if (e.key === "Escape") onCancel();
            }}
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg px-4 py-2 font-sans text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            {t.cancel}
          </button>
          <button
            onClick={onConfirm}
            disabled={!matches}
            className={cn(
              "rounded-lg px-4 py-2 font-sans text-sm font-semibold transition-colors",
              matches
                ? "bg-destructive text-white hover:bg-destructive/90"
                : "cursor-not-allowed bg-secondary text-muted-foreground/40",
            )}
          >
            {t.deleteEverything}
          </button>
        </div>
      </div>
    </div>
  );
}

const SPEED_OPTIONS: SelectOption[] = [
  { value: "0.5", label: "0.5x" },
  { value: "0.75", label: "0.75x" },
  { value: "1", label: "1x" },
  { value: "1.25", label: "1.25x" },
  { value: "1.5", label: "1.5x" },
  { value: "1.75", label: "1.75x" },
  { value: "2", label: "2x" },
];

const SKIP_OPTIONS: SelectOption[] = [
  { value: "5", label: "5s" },
  { value: "10", label: "10s" },
  { value: "15", label: "15s" },
  { value: "30", label: "30s" },
];

interface SettingsProps {
  className?: string;
}

function DataDirPicker() {
  const t = useI18n();
  const [info, setInfo] = useState<{ isPortable: boolean; dataDir: string; customDataDir: string | null } | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    getPortableInfo().then(setInfo).catch(() => {});
  }, []);

  const handleChooseFolder = async () => {
    const selected = await open({
      directory: true,
      multiple: false,
      title: t.chooseFolderTitle,
    });
    if (selected) {
      try {
        const msg = await setCustomDataDir(selected as string);
        setMessage(msg);
        setInfo((prev) => prev ? { ...prev, customDataDir: selected as string } : prev);
      } catch (err) {
        setMessage(typeof err === "string" ? err : t.errorSetFolder);
      }
    }
  };

  const handleReset = async () => {
    try {
      const msg = await setCustomDataDir("");
      setMessage(msg);
      setInfo((prev) => prev ? { ...prev, customDataDir: null } : prev);
    } catch (err) {
      setMessage(typeof err === "string" ? err : t.errorResetFolder);
    }
  };

  if (!info) return null;

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between gap-3 rounded-lg bg-secondary/50 px-3 py-2.5">
        <div>
          <div className="font-sans text-xs font-medium text-foreground">
            {info.isPortable ? t.portableModeActive : t.databaseLocation}
          </div>
          {info.customDataDir && (
            <div className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
              {t.customDataDir} {info.customDataDir}
            </div>
          )}
        </div>
        {!info.isPortable && (
          <div className="flex gap-2">
            {info.customDataDir && (
              <button
                onClick={handleReset}
                className="shrink-0 rounded-lg border border-border bg-secondary px-3 py-1.5 font-sans text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {t.restoreDefault}
              </button>
            )}
            <button
              onClick={handleChooseFolder}
              className="shrink-0 rounded-lg border border-border bg-secondary px-3 py-1.5 font-sans text-xs font-medium text-foreground transition-colors hover:bg-secondary/70"
            >
              <span className="flex items-center gap-1.5">
                <Folder className="size-3.5" />
                {t.changeLocation}
              </span>
            </button>
          </div>
        )}
      </div>
      {message && (
        <div className="mt-2 rounded-lg bg-primary/10 px-3 py-2 font-sans text-xs text-primary">
          {message}
        </div>
      )}
    </div>
  );
}

function UpdatesSection({ index }: { index: number }) {
  const updater = useUpdater();
  const t = useI18n();
  const [appVersion, setAppVersion] = useState<string>("");

  useEffect(() => {
    getVersion().then(setAppVersion).catch(() => setAppVersion(""));
  }, []);

  const isChecking = updater.status === "checking";
  const isDownloading = updater.status === "downloading";
  const isReady = updater.status === "ready";
  const hasUpdate = updater.status === "available" || isDownloading || isReady;
  const percent = Math.round(updater.progress * 100);

  let buttonLabel = t.checkForUpdates;
  if (isChecking) buttonLabel = t.checking;
  else if (isReady) buttonLabel = t.restartToUpdate;
  else if (isDownloading) buttonLabel = `${t.downloading} ${percent}%`;
  else if (updater.status === "available") buttonLabel = `${t.installVersion} v${updater.version}`;

  const onClick = () => {
    if (hasUpdate) updater.install();
    else updater.check();
  };

  let description = appVersion ? `${t.currentVersion} v${appVersion}` : t.checkNewVersions;
  if (updater.status === "up-to-date") description = `${t.upToDate} (v${appVersion})`;
  else if (updater.status === "available") description = `${updater.version} ${t.updateAvailable}`;
  else if (updater.status === "error") description = updater.error ?? t.updateCheckFailed;

  return (
    <SectionCard
      title={t.updates}
      icon={<ArrowsClockwise className="size-4 text-info" weight="bold" />}
      index={index}
    >
      <SettingRow
        icon={<ArrowsClockwise className={cn("size-4", isChecking && "animate-spin")} />}
        label={t.appUpdates}
        description={description}
      >
        <button
          onClick={onClick}
          disabled={isChecking || isDownloading}
          className={cn(
            "shrink-0 rounded-lg px-4 py-2",
            "font-sans text-sm font-semibold transition-colors",
            hasUpdate
              ? "bg-primary text-primary-foreground hover:opacity-90"
              : "border border-border bg-secondary text-foreground hover:bg-secondary/70",
            (isChecking || isDownloading) && "cursor-not-allowed opacity-60",
          )}
        >
          {buttonLabel}
        </button>
      </SettingRow>
      {isDownloading && (
        <div className="px-2 pb-2">
          <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-primary transition-[width] duration-200"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      )}
      {updater.status === "available" && updater.notes && (
        <div className="mx-2 mb-2 max-h-32 overflow-y-auto rounded-lg bg-secondary/50 px-3 py-2 font-sans text-xs whitespace-pre-wrap text-muted-foreground">
          {updater.notes}
        </div>
      )}
    </SectionCard>
  );
}

export function Settings({ className }: SettingsProps) {
  const { settings, update, reload } = useSettings();
  const navigate = useNavigate();
  const [stats, setStats] = useState<LibraryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const t = useI18n();

  const loadStats = useCallback(() => {
    return getLibraryStats().then(setStats);
  }, []);

  useEffect(() => {
    loadStats().finally(() => setLoading(false));
  }, [loadStats]);

  usePageVisible("/settings", loadStats);

  const handleDeleteAll = useCallback(async () => {
    await deleteAllData();
    setShowDeleteDialog(false);
    navigate("/");
    window.location.reload();
  }, [navigate]);

  if (loading) {
    return (
      <div className={cn("flex h-full items-center justify-center", className)}>
        <SpinnerGap className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={cn("mx-auto max-w-3xl px-6 py-8", className)}>
      <div
        className="mb-8 flex items-center gap-3"
        style={{ animation: `card-in 350ms ${EASE_OUT} both` }}
      >
        <div className="squircle flex size-10 items-center justify-center bg-primary/15">
          <GearSix className="size-5 text-primary" weight="bold" />
        </div>
        <div>
          <h2 className="font-heading text-2xl font-bold text-foreground">{t.settings}</h2>
          <p className="font-sans text-sm text-muted-foreground">
            {t.configureExperience}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <SectionCard
          title={t.language}
          icon={<GearSix className="size-4 text-primary" weight="bold" />}
          index={0}
        >
          <SettingRow
            icon={<GearSix className="size-4" />}
            label={t.language}
            description={t.languageDesc}
          >
            <Select
              value={settings.locale}
              onChange={(v) => update("locale", v)}
              options={LOCALES.map((l) => ({ value: l.value, label: l.label }))}
            />
          </SettingRow>
        </SectionCard>

        <SectionCard
          title={t.playback}
          icon={<Play className="size-4 text-primary" weight="bold" />}
          index={1}
        >
          <SettingRow
            icon={<SkipForward className="size-4" />}
            label={t.autoplayNext}
            description={t.autoplayNextDesc}
          >
            <Toggle
              checked={settings.autoplay_next}
              onChange={(v) => update("autoplay_next", String(v))}
            />
          </SettingRow>
          <SettingRow
            icon={<ArrowsClockwise className="size-4" />}
            label={t.resumePosition}
            description={t.resumePositionDesc}
          >
            <Toggle
              checked={settings.resume_position}
              onChange={(v) => update("resume_position", String(v))}
            />
          </SettingRow>
          <SettingRow
            icon={<FastForward className="size-4" />}
            label={t.defaultSpeed}
          >
            <Select
              value={String(settings.default_speed)}
              onChange={(v) => update("default_speed", v)}
              options={SPEED_OPTIONS}
            />
          </SettingRow>
          <SettingRow
            icon={<SpeakerHigh className="size-4" />}
            label={t.defaultVolume}
          >
            <div className="flex items-center gap-2.5">
              <input
                type="range"
                min={0}
                max={100}
                value={settings.default_volume}
                onChange={(e) => update("default_volume", e.target.value)}
                className="h-1.5 w-24 cursor-pointer accent-primary"
              />
              <span className="w-8 font-mono text-xs text-muted-foreground">
                {settings.default_volume}%
              </span>
            </div>
          </SettingRow>
          <SettingRow
            icon={<MonitorPlay className="size-4" />}
            label={t.skipForwardBackward}
          >
            <Select
              value={String(settings.skip_forward_secs)}
              onChange={(v) => {
                update("skip_forward_secs", v);
                update("skip_backward_secs", v);
              }}
              options={SKIP_OPTIONS}
            />
          </SettingRow>
        </SectionCard>

        <SectionCard
          title={t.library}
          icon={<Database className="size-4 text-info" weight="bold" />}
          index={2}
        >
          {stats && (
            <div className="grid grid-cols-3 gap-2.5">
              <StatChip
                icon={<Stack className="size-3.5" />}
                label={t.courses}
                value={stats.totalCourses}
              />
              <StatChip
                icon={<MonitorPlay className="size-3.5" />}
                label={t.lessons}
                value={stats.totalLessons}
              />
              <StatChip
                icon={<Notepad className="size-3.5" />}
                label={t.notes}
                value={stats.totalNotes}
              />
              <StatChip
                icon={<BookmarkSimple className="size-3.5" />}
                label={t.bookmarks}
                value={stats.totalBookmarks}
              />
              <StatChip
                icon={<Heart className="size-3.5" />}
                label={t.favorites}
                value={stats.totalFavorites}
              />
              <StatChip
                icon={<Folder className="size-3.5" />}
                label={t.sections}
                value={stats.totalSections}
              />
            </div>
          )}
          <div className="mt-3 rounded-lg bg-secondary/50 px-3 py-2.5">
            <div className="font-sans text-xs text-muted-foreground">{t.databaseLocation}</div>
            <div className="mt-0.5 break-all font-mono text-xs text-foreground/70">
              {stats?.dbPath}
            </div>
          </div>
          <DataDirPicker />
          <div className="mt-3 flex flex-col sm:flex-row items-stretch gap-2">
            <button
              onClick={async () => {
                const { save } = await import("@tauri-apps/plugin-dialog");
                const dest = await save({ defaultPath: "ckourse-backup.db", filters: [{ name: "SQLite", extensions: ["db"] }] });
                if (dest) {
                  try {
                    const { exportDatabase } = await import("@/lib/store");
                    const msg = await exportDatabase(dest);
                    toast.success(msg);
                  } catch (err) {
                    toast.error(typeof err === "string" ? err : "Erro ao exportar");
                  }
                }
              }}
              className="flex-1 rounded-lg border border-border bg-secondary px-3 py-2 font-sans text-xs font-medium text-foreground transition-colors hover:bg-secondary/70"
            >
              Exportar banco
            </button>
            <button
              onClick={async () => {
                const { open: openFile } = await import("@tauri-apps/plugin-dialog");
                const source = await openFile({ filters: [{ name: "SQLite", extensions: ["db"] }] });
                if (source) {
                  try {
                    const { importDatabase } = await import("@/lib/store");
                    const msg = await importDatabase(source as string);
                    toast.success(msg);
                  } catch (err) {
                    toast.error(typeof err === "string" ? err : "Erro ao importar");
                  }
                }
              }}
              className="flex-1 rounded-lg border border-border bg-secondary px-3 py-2 font-sans text-xs font-medium text-foreground transition-colors hover:bg-secondary/70"
            >
              Importar banco
            </button>
          </div>
        </SectionCard>

        <SectionCard
          title="Integração Google Drive"
          icon={<GoogleDriveLogo className="size-4 text-blue-500" weight="bold" />}
          index={3}
        >
          <div className="px-3 py-2">
            <p className="mb-4 font-sans text-xs text-muted-foreground">
              Configure suas credenciais da API do Google Drive (Client ID e Client Secret) para permitir o streaming de cursos diretamente da nuvem sem ocupar espaço no seu dispositivo.
            </p>
            
            <SettingRow
              icon={<Cloud className="size-4" />}
              label="Client ID (Google Cloud)"
              description="ID do Cliente OAuth 2.0"
            >
              <input
                type="text"
                value={settings.gdrive_client_id || ""}
                onChange={(e) => update("gdrive_client_id", e.target.value)}
                placeholder="Ex: 873301581649-abc..."
                className="w-full max-w-[280px] rounded-lg border border-border bg-secondary px-3 py-1.5 font-mono text-xs text-foreground outline-none transition-colors placeholder:text-muted-foreground/40 hover:border-muted-foreground/30 focus:border-primary"
              />
            </SettingRow>

            <SettingRow
              icon={<Cloud className="size-4" />}
              label="Client Secret"
              description="Segredo do Cliente OAuth"
            >
              <input
                type="password"
                value={settings.gdrive_client_secret || ""}
                onChange={(e) => update("gdrive_client_secret", e.target.value)}
                placeholder="Ex: GOCSPX-wxGW..."
                className="w-full max-w-[280px] rounded-lg border border-border bg-secondary px-3 py-1.5 font-mono text-xs text-foreground outline-none transition-colors placeholder:text-muted-foreground/40 hover:border-muted-foreground/30 focus:border-primary"
              />
            </SettingRow>

            {/* Connection status indicator */}
            {settings.gdrive_access_token ? (
              <div className="mt-4 flex flex-col gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative flex size-3">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex size-3 rounded-full bg-emerald-500" />
                    </div>
                    <div>
                      <p className="font-sans text-sm font-medium text-emerald-400">Google Drive conectado</p>
                      <p className="font-sans text-xs text-muted-foreground">Pronto para importar cursos do Drive</p>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      await update("gdrive_access_token", "");
                      await update("gdrive_refresh_token", "");
                      toast.success("Conta do Google Drive desconectada");
                    }}
                    className="self-start sm:self-auto rounded-lg border border-border px-3 py-1.5 font-sans text-xs font-medium text-muted-foreground transition-colors hover:border-destructive/30 hover:text-destructive"
                  >
                    Desconectar
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 border-t border-emerald-500/10 pt-3">
                  <button
                    onClick={async () => {
                      toast.promise(invoke("backup_database_to_drive"), {
                        loading: "Enviando backup para a nuvem...",
                        success: (msg) => msg as string,
                        error: (err) => typeof err === "string" ? err : "Erro no backup"
                      });
                    }}
                    className="flex-1 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 font-sans text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20"
                  >
                    ☁️ Fazer Backup na Nuvem
                  </button>
                  <button
                    onClick={async () => {
                      toast.promise(invoke("restore_database_from_drive"), {
                        loading: "Baixando backup da nuvem...",
                        success: (msg) => msg as string,
                        error: (err) => typeof err === "string" ? err : "Erro ao restaurar"
                      });
                    }}
                    className="flex-1 rounded-lg border border-border bg-secondary/50 px-3 py-2 font-sans text-xs font-medium text-foreground transition-colors hover:bg-secondary"
                  >
                    🔄 Restaurar da Nuvem
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-flex size-2.5 rounded-full bg-muted-foreground/30" />
                  <span className="font-sans text-xs text-muted-foreground">Não conectado</span>
                </div>
                <button
                  onClick={async () => {
                    try {
                      const res = await invoke("start_google_drive_oauth");
                      toast.success(res as string);
                      // Reload settings to get the new tokens
                      await reload();
                    } catch (e) {
                      toast.error(e as string);
                    }
                  }}
                  disabled={!settings.gdrive_client_id || !settings.gdrive_client_secret}
                  className={cn(
                    "rounded-lg px-4 py-2 font-sans text-sm font-semibold transition-colors",
                    settings.gdrive_client_id && settings.gdrive_client_secret
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "cursor-not-allowed bg-secondary text-muted-foreground/40"
                  )}
                >
                  Conectar Conta do Google
                </button>
              </div>
            )}
          </div>
        </SectionCard>

        <UpdatesSection index={4} />

        <SectionCard
          title={t.dangerZone}
          icon={<WarningCircle className="size-4 text-destructive" weight="bold" />}
          index={5}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg px-2 py-3">
            <div className="flex items-center gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <Trash className="size-4" />
              </div>
              <div>
                <div className="font-sans text-sm font-medium text-foreground">
                  {t.deleteAllData}
                </div>
                <div className="font-sans text-xs text-muted-foreground">
                  {t.deleteAllDataDesc}
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className={cn(
                "shrink-0 rounded-lg border border-destructive/30 px-4 py-2",
                "font-sans text-sm font-semibold text-destructive",
                "transition-colors hover:bg-destructive/10",
              )}
            >
              {t.deleteAllData}
            </button>
          </div>
        </SectionCard>
      </div>

      {showDeleteDialog && (
        <DeleteConfirmDialog
          onConfirm={handleDeleteAll}
          onCancel={() => setShowDeleteDialog(false)}
        />
      )}
    </div>
  );
}
