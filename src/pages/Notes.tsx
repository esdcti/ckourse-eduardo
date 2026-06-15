import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { usePageVisible } from "@/hooks/usePageVisible";
import {
  NotepadIcon as Notepad,
  SpinnerGapIcon as SpinnerGap,
  PencilSimpleIcon as PencilSimple,
  TrashIcon as Trash,
  FunnelIcon as Funnel,
  ClockIcon as Clock,
  MagnifyingGlassIcon as MagnifyingGlass,
  CaretRightIcon as CaretRight,
  SortAscendingIcon as SortAscending,
  SortDescendingIcon as SortDescending,
  ExportIcon as Export,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { SquircleSearch } from "@/components/ui/SquircleSearch";
import type { NoteWithCourse } from "@/types";
import { getAllNotes, updateNote, deleteNote, exportNotesAsMarkdown } from "@/lib/store";
import { NoteEditor } from "@/components/course-detail/NoteEditor";
import { EASE_OUT, SNAPPY } from "@/lib/constants";
import { useI18n } from "@/lib/i18n";

type SortField = "updated" | "created" | "course";
type SortDir = "desc" | "asc";

interface NotesProps {
  className?: string;
}

export function Notes({ className }: NotesProps) {
  const [notes, setNotes] = useState<NoteWithCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState<number | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [sortField, setSortField] = useState<SortField>("updated");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const t = useI18n();

  const reload = useCallback(() => {
    return getAllNotes().then(setNotes);
  }, []);

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, [reload]);

  usePageVisible("/notes", reload);

  const courses = useMemo(() => {
    const map = new Map<number, { id: number; title: string; accentColor: string; count: number }>();
    for (const n of notes) {
      const existing = map.get(n.courseId);
      if (existing) {
        existing.count++;
      } else {
        map.set(n.courseId, {
          id: n.courseId,
          title: n.courseTitle,
          accentColor: n.accentColor,
          count: 1,
        });
      }
    }
    return Array.from(map.values());
  }, [notes]);

  const filtered = useMemo(() => {
    let result = notes;

    if (courseFilter !== null) {
      result = result.filter((n) => n.courseId === courseFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (n) =>
          stripHtml(n.content).toLowerCase().includes(q) ||
          n.lessonTitle.toLowerCase().includes(q) ||
          n.courseTitle.toLowerCase().includes(q),
      );
    }

    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortField === "updated") {
        cmp = a.updatedAt.localeCompare(b.updatedAt);
      } else if (sortField === "created") {
        cmp = a.createdAt.localeCompare(b.createdAt);
      } else {
        cmp = a.courseTitle.localeCompare(b.courseTitle) || a.updatedAt.localeCompare(b.updatedAt);
      }
      return sortDir === "desc" ? -cmp : cmp;
    });

    return result;
  }, [notes, courseFilter, search, sortField, sortDir]);

  const handleEdit = useCallback(
    async (noteId: number, content: string) => {
      await updateNote(noteId, content);
      setEditingNoteId(null);
      await reload();
    },
    [reload],
  );

  const handleDelete = useCallback(
    async (noteId: number) => {
      await deleteNote(noteId);
      setEditingNoteId(null);
      await reload();
    },
    [reload],
  );

  const toggleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDir((d) => (d === "desc" ? "asc" : "desc"));
      } else {
        setSortField(field);
        setSortDir("desc");
      }
    },
    [sortField],
  );

  const sortLabels: Record<SortField, string> = useMemo(() => ({
    updated: t.modified,
    created: t.created,
    course: t.course,
  }), [t]);

  if (loading) {
    return (
      <div className={cn("mx-auto flex max-w-6xl items-center justify-center py-32", className)}>
        <SpinnerGap className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className={cn("mx-auto max-w-6xl", className)}>
        <div
          className="flex flex-col items-center justify-center gap-3 py-32 text-center"
          style={{ animation: `card-in 350ms ${EASE_OUT} both` }}
        >
          <div className="flex size-12 items-center justify-center rounded-xl bg-secondary">
            <Notepad className="size-6 text-muted-foreground" />
          </div>
          <h2 className="font-heading text-lg font-bold text-foreground">
            {t.notes}
          </h2>
          <p className="max-w-xs font-sans text-sm text-muted-foreground">
            {t.startTakingNotes}
          </p>
        </div>
      </div>
    );
  }

  const SortIcon = sortDir === "desc" ? SortDescending : SortAscending;

  return (
    <div className={cn("mx-auto max-w-6xl", className)}>
      <div
        className="mb-6"
        style={{ animation: `card-in 350ms ${EASE_OUT} both` }}
      >
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="font-heading text-2xl font-bold text-foreground">
              {t.notes}
            </h2>
            <p className="mt-1 font-sans text-sm text-muted-foreground">
              {notes.length} {notes.length === 1 ? t.noteAcrossCourse : t.notesAcrossCourses} {courses.length} {courses.length === 1 ? t.course : t.courses.toLowerCase()}
            </p>
          </div>
          <button
            onClick={() => {
              const md = exportNotesAsMarkdown(notes);
              const blob = new Blob([md], { type: "text/markdown" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "ckourse-notes.md";
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 font-sans text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Export className="size-3.5" />
            Markdown
          </button>
        </div>
      </div>

      <div
        className="mb-4 flex items-center gap-3"
        style={{ animation: `card-in 350ms ${EASE_OUT} 40ms both` }}
      >
        <SquircleSearch
          value={search}
          onChange={setSearch}
          placeholder={t.searchNotes}
          className="flex-1"
        />
        <div className="flex items-center gap-1">
          {(["updated", "created", "course"] as SortField[]).map((field) => (
            <button
              key={field}
              onClick={() => toggleSort(field)}
              className={cn(
                "flex items-center gap-1 rounded-md px-2 py-1.5 font-sans text-xs font-medium transition-colors",
                sortField === field
                  ? "border border-border bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {sortLabels[field]}
              {sortField === field && <SortIcon className="size-3" />}
            </button>
          ))}
        </div>
      </div>

      {courses.length > 1 && (
        <div
          className="mb-4 flex flex-wrap items-center gap-1.5"
          style={{ animation: `card-in 350ms ${EASE_OUT} 80ms both` }}
        >
          <Funnel className="mr-0.5 size-3.5 text-muted-foreground/50" />
          <button
            onClick={() => setCourseFilter(null)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-2.5 py-1 font-sans text-xs font-medium transition-colors",
              courseFilter === null
                ? "border border-border bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.all}
            <span className="font-mono text-[9px] text-muted-foreground/60">
              {notes.length}
            </span>
          </button>
          {courses.map((course) => (
            <button
              key={course.id}
              onClick={() => setCourseFilter(courseFilter === course.id ? null : course.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-2.5 py-1 font-sans text-xs font-medium transition-colors",
                courseFilter === course.id
                  ? "border border-border bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <div
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: course.accentColor }}
              />
              <span className="max-w-32 truncate">{course.title}</span>
              <span className="font-mono text-[9px] text-muted-foreground/60">
                {course.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center gap-2 py-20 text-center"
          style={{ animation: `card-in 350ms ${EASE_OUT} both` }}
        >
          <MagnifyingGlass className="size-8 text-muted-foreground/40" />
          <p className="font-sans text-sm font-medium text-muted-foreground">{t.noMatchingNotes}</p>
          <p className="font-sans text-xs text-muted-foreground/60">
            {t.tryDifferentSearch}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((note, index) => (
            <div
              key={note.id}
              style={{
                animation: `card-in 350ms ${EASE_OUT} ${100 + index * 30}ms both`,
              }}
            >
              {editingNoteId === note.id ? (
                <NoteEditor
                  videoTime={0}
                  initialContent={note.content}
                  onSubmit={(content) => handleEdit(note.id, content)}
                  onCancel={() => setEditingNoteId(null)}
                />
              ) : (
                <NoteItem
                  note={note}
                  onStartEdit={() => setEditingNoteId(note.id)}
                  onDelete={() => handleDelete(note.id)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NoteItem({
  note,
  onStartEdit,
  onDelete,
}: {
  note: NoteWithCourse;
  onStartEdit: () => void;
  onDelete: () => void;
}) {
  const t = useI18n();
  const updated = new Date(note.updatedAt);
  const formatted = updated.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      className="group rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:bg-secondary/50"
      style={{ transitionTimingFunction: SNAPPY }}
    >
      <div className="flex items-start gap-3">
        <div
          className="mt-1.5 size-2 shrink-0 rounded-full"
          style={{ backgroundColor: note.accentColor }}
        />

        <div className="min-w-0 flex-1">
          <div
            className="note-content font-sans text-sm leading-relaxed text-foreground/90"
            dangerouslySetInnerHTML={{ __html: note.content }}
          />

          <div className="mt-2 flex items-center gap-1.5">
            <Link
              to={`/course/${note.courseId}?lesson=${note.lessonId}&from=/notes`}
              className="flex items-center gap-1 font-sans text-[11px] text-muted-foreground transition-colors hover:text-foreground"
            >
              <span className="max-w-40 truncate">{note.courseTitle}</span>
              <CaretRight className="size-2.5 text-muted-foreground/40" />
              <span className="max-w-40 truncate">{note.lessonTitle}</span>
            </Link>
            <span className="text-muted-foreground/30">·</span>
            <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground/50">
              <Clock className="size-2.5" />
              {formatted}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <Link
            to={`/course/${note.courseId}?lesson=${note.lessonId}&from=/notes`}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            title={t.goToLesson}
          >
            <CaretRight className="size-3.5" />
          </Link>
          <button
            onClick={onStartEdit}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            title={t.editNote}
          >
            <PencilSimple className="size-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
            title={t.deleteNote}
          >
            <Trash className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function stripHtml(html: string): string {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent ?? "";
}
