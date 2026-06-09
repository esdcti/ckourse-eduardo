import { createContext, useContext } from "react";

export type Locale = "en" | "pt-BR";

export const LOCALES: { value: Locale; label: string }[] = [
  { value: "en", label: "English" },
  { value: "pt-BR", label: "Português (BR)" },
];

// Translation keys organized by section
export interface Translations {
  // Common
  courses: string;
  course: string;
  lessons: string;
  lesson: string;
  notes: string;
  bookmarks: string;
  favorites: string;
  settings: string;
  progress: string;
  search: string;
  cancel: string;
  save: string;
  delete: string;
  back: string;
  import: string;
  loading: string;
  
  // Dashboard
  yourLibrary: string;
  searchCourses: string;
  filters: string;
  importCourse: string;
  noCoursesMatch: string;
  clearAllFilters: string;
  recentlyWatched: string;
  progressSort: string;
  titleAZ: string;
  allStatus: string;
  inProgress: string;
  completed: string;
  notStarted: string;
  bookmarked: string;
  failedToLoad: string;
  tryAgain: string;

  // Dashboard Stats
  currentStreak: string;
  days: string;
  day: string;
  lessonsCompleted: string;
  totalWatchTime: string;
  hours: string;
  minutes: string;

  // Empty Library
  emptyLibraryTitle: string;
  emptyLibraryDescription: string;
  importYourFirst: string;

  // Import
  selectCourseFolder: string;
  browseFolder: string;
  dropFolderHere: string;
  orBrowse: string;
  configureCourse: string;
  courseTitle: string;
  author: string;
  category: string;
  accentColor: string;
  importingCourse: string;
  settingUpLibrary: string;
  parseError: string;
  sections: string;
  structure: string;

  // Course Detail
  resources: string;
  curriculum: string;
  addNote: string;
  editNote: string;
  deleteNote: string;
  noteContent: string;
  noNotes: string;
  markCompleted: string;
  markIncomplete: string;
  openFolder: string;
  editCourse: string;
  resetProgress: string;
  deleteCourse: string;
  confirmDelete: string;
  confirmReset: string;
  courseCompleted: string;
  congratulations: string;

  // Settings
  configureExperience: string;
  playback: string;
  autoplayNext: string;
  autoplayNextDesc: string;
  resumePosition: string;
  resumePositionDesc: string;
  defaultSpeed: string;
  defaultVolume: string;
  skipForwardBackward: string;
  library: string;
  databaseLocation: string;
  updates: string;
  checkForUpdates: string;
  currentVersion: string;
  upToDate: string;
  updateAvailable: string;
  downloading: string;
  restartToUpdate: string;
  dangerZone: string;
  deleteAllData: string;
  deleteAllDataDesc: string;
  deleteEverything: string;
  typeToConfirm: string;
  cannotBeUndone: string;
  permanentlyRemove: string;
  appUpdates: string;

  // Progress page
  progressOverview: string;
  completionRate: string;
  totalCourses: string;
  totalLessons: string;

  // Notes page
  allNotes: string;
  noNotesYet: string;
  
  // Bookmarks page  
  bookmarkedCourses: string;
  noBookmarks: string;

  // Portable
  portableMode: string;
  portableModeActive: string;

  // Categories
  frontend: string;
  backend: string;
  devops: string;
  database: string;
  design: string;
  other: string;

  // Sidebar
  dashboard: string;

  // Language
  language: string;
  languageDesc: string;
}

const en: Translations = {
  courses: "Courses",
  course: "course",
  lessons: "Lessons",
  lesson: "lesson",
  notes: "Notes",
  bookmarks: "Bookmarks",
  favorites: "Favorites",
  settings: "Settings",
  progress: "Progress",
  search: "Search",
  cancel: "Cancel",
  save: "Save",
  delete: "Delete",
  back: "Back",
  import: "Import",
  loading: "Loading...",

  yourLibrary: "Your Library",
  searchCourses: "Search courses...",
  filters: "Filters",
  importCourse: "Import Course",
  noCoursesMatch: "No courses match your filters.",
  clearAllFilters: "Clear all filters",
  recentlyWatched: "Recently Watched",
  progressSort: "Progress",
  titleAZ: "Title A-Z",
  allStatus: "All Status",
  inProgress: "In Progress",
  completed: "Completed",
  notStarted: "Not Started",
  bookmarked: "Bookmarked",
  failedToLoad: "Failed to load your library.",
  tryAgain: "Try again",

  currentStreak: "Current Streak",
  days: "days",
  day: "day",
  lessonsCompleted: "Lessons Completed",
  totalWatchTime: "Total Watch Time",
  hours: "h",
  minutes: "min",

  emptyLibraryTitle: "Your library is empty",
  emptyLibraryDescription: "Import your first course to get started. Just point Ckourse at any folder with video lessons.",
  importYourFirst: "Import your first course",

  selectCourseFolder: "Select Course Folder",
  browseFolder: "Browse",
  dropFolderHere: "Drop course folder here",
  orBrowse: "or browse to select",
  configureCourse: "Configure Course",
  courseTitle: "Course title",
  author: "Author",
  category: "Category",
  accentColor: "Accent color",
  importingCourse: "Importing course...",
  settingUpLibrary: "Setting up your library",
  parseError: "Failed to parse course folder",
  sections: "Sections",
  structure: "Structure",

  resources: "Resources",
  curriculum: "Curriculum",
  addNote: "Add note",
  editNote: "Edit note",
  deleteNote: "Delete note",
  noteContent: "Write your note...",
  noNotes: "No notes for this lesson.",
  markCompleted: "Mark as completed",
  markIncomplete: "Mark as incomplete",
  openFolder: "Open folder",
  editCourse: "Edit course",
  resetProgress: "Reset progress",
  deleteCourse: "Delete course",
  confirmDelete: "Are you sure you want to delete this course?",
  confirmReset: "Are you sure you want to reset all progress?",
  courseCompleted: "Course Completed!",
  congratulations: "Congratulations! You've completed the entire course.",

  configureExperience: "Configure your learning experience",
  playback: "Playback",
  autoplayNext: "Autoplay next lesson",
  autoplayNextDesc: "Automatically play the next lesson when one finishes",
  resumePosition: "Resume from last position",
  resumePositionDesc: "Continue videos from where you left off",
  defaultSpeed: "Default playback speed",
  defaultVolume: "Default volume",
  skipForwardBackward: "Skip forward / backward",
  library: "Library",
  databaseLocation: "Database location",
  updates: "Updates",
  checkForUpdates: "Check for updates",
  currentVersion: "Current version",
  upToDate: "You're on the latest version",
  updateAvailable: "is available",
  downloading: "Downloading",
  restartToUpdate: "Restart to update",
  dangerZone: "Danger Zone",
  deleteAllData: "Delete all data",
  deleteAllDataDesc: "Permanently remove all courses, progress, notes, and settings",
  deleteEverything: "Delete everything",
  typeToConfirm: "Type",
  cannotBeUndone: "This action cannot be undone",
  permanentlyRemove: "This will permanently delete all your courses, progress, notes, bookmarks, favorites, and settings. Your original course files on disk will not be affected.",
  appUpdates: "App updates",

  progressOverview: "Progress Overview",
  completionRate: "Completion Rate",
  totalCourses: "Total Courses",
  totalLessons: "Total Lessons",

  allNotes: "All Notes",
  noNotesYet: "No notes yet. Add notes while watching your courses.",

  bookmarkedCourses: "Bookmarked Courses",
  noBookmarks: "No bookmarked courses yet.",

  portableMode: "Portable Mode",
  portableModeActive: "Running in portable mode — data stored next to the app",

  frontend: "Frontend",
  backend: "Backend",
  devops: "DevOps",
  database: "Database",
  design: "Design",
  other: "Other",

  dashboard: "Dashboard",

  language: "Language",
  languageDesc: "Choose your preferred language",
};

const ptBR: Translations = {
  courses: "Cursos",
  course: "curso",
  lessons: "Aulas",
  lesson: "aula",
  notes: "Notas",
  bookmarks: "Favoritos",
  favorites: "Favoritos",
  settings: "Configurações",
  progress: "Progresso",
  search: "Buscar",
  cancel: "Cancelar",
  save: "Salvar",
  delete: "Excluir",
  back: "Voltar",
  import: "Importar",
  loading: "Carregando...",

  yourLibrary: "Sua Biblioteca",
  searchCourses: "Buscar cursos...",
  filters: "Filtros",
  importCourse: "Importar Curso",
  noCoursesMatch: "Nenhum curso corresponde aos filtros.",
  clearAllFilters: "Limpar filtros",
  recentlyWatched: "Assistidos Recentemente",
  progressSort: "Progresso",
  titleAZ: "Título A-Z",
  allStatus: "Todos",
  inProgress: "Em Progresso",
  completed: "Concluído",
  notStarted: "Não Iniciado",
  bookmarked: "Marcados",
  failedToLoad: "Falha ao carregar sua biblioteca.",
  tryAgain: "Tentar novamente",

  currentStreak: "Sequência Atual",
  days: "dias",
  day: "dia",
  lessonsCompleted: "Aulas Concluídas",
  totalWatchTime: "Tempo Total",
  hours: "h",
  minutes: "min",

  emptyLibraryTitle: "Sua biblioteca está vazia",
  emptyLibraryDescription: "Importe seu primeiro curso para começar. Basta apontar o Ckourse para qualquer pasta com videoaulas.",
  importYourFirst: "Importar primeiro curso",

  selectCourseFolder: "Selecionar Pasta do Curso",
  browseFolder: "Procurar",
  dropFolderHere: "Solte a pasta do curso aqui",
  orBrowse: "ou procure para selecionar",
  configureCourse: "Configurar Curso",
  courseTitle: "Título do curso",
  author: "Autor",
  category: "Categoria",
  accentColor: "Cor de destaque",
  importingCourse: "Importando curso...",
  settingUpLibrary: "Configurando sua biblioteca",
  parseError: "Falha ao analisar pasta do curso",
  sections: "Seções",
  structure: "Estrutura",

  resources: "Recursos",
  curriculum: "Currículo",
  addNote: "Adicionar nota",
  editNote: "Editar nota",
  deleteNote: "Excluir nota",
  noteContent: "Escreva sua nota...",
  noNotes: "Nenhuma nota para esta aula.",
  markCompleted: "Marcar como concluída",
  markIncomplete: "Marcar como não concluída",
  openFolder: "Abrir pasta",
  editCourse: "Editar curso",
  resetProgress: "Resetar progresso",
  deleteCourse: "Excluir curso",
  confirmDelete: "Tem certeza que deseja excluir este curso?",
  confirmReset: "Tem certeza que deseja resetar todo o progresso?",
  courseCompleted: "Curso Concluído!",
  congratulations: "Parabéns! Você concluiu o curso inteiro.",

  configureExperience: "Configure sua experiência de aprendizado",
  playback: "Reprodução",
  autoplayNext: "Reproduzir próxima aula automaticamente",
  autoplayNextDesc: "Reproduz automaticamente a próxima aula quando uma termina",
  resumePosition: "Retomar de onde parou",
  resumePositionDesc: "Continua os vídeos de onde você parou",
  defaultSpeed: "Velocidade padrão",
  defaultVolume: "Volume padrão",
  skipForwardBackward: "Avançar / retroceder",
  library: "Biblioteca",
  databaseLocation: "Localização do banco de dados",
  updates: "Atualizações",
  checkForUpdates: "Verificar atualizações",
  currentVersion: "Versão atual",
  upToDate: "Você está na versão mais recente",
  updateAvailable: "disponível",
  downloading: "Baixando",
  restartToUpdate: "Reiniciar para atualizar",
  dangerZone: "Zona de Perigo",
  deleteAllData: "Excluir todos os dados",
  deleteAllDataDesc: "Remove permanentemente todos os cursos, progresso, notas e configurações",
  deleteEverything: "Excluir tudo",
  typeToConfirm: "Digite",
  cannotBeUndone: "Esta ação não pode ser desfeita",
  permanentlyRemove: "Isso excluirá permanentemente todos os seus cursos, progresso, notas, marcadores, favoritos e configurações. Seus arquivos originais de curso no disco não serão afetados.",
  appUpdates: "Atualizações do app",

  progressOverview: "Visão Geral do Progresso",
  completionRate: "Taxa de Conclusão",
  totalCourses: "Total de Cursos",
  totalLessons: "Total de Aulas",

  allNotes: "Todas as Notas",
  noNotesYet: "Nenhuma nota ainda. Adicione notas enquanto assiste seus cursos.",

  bookmarkedCourses: "Cursos Marcados",
  noBookmarks: "Nenhum curso marcado ainda.",

  portableMode: "Modo Portátil",
  portableModeActive: "Rodando em modo portátil — dados salvos junto ao app",

  frontend: "Frontend",
  backend: "Backend",
  devops: "DevOps",
  database: "Banco de Dados",
  design: "Design",
  other: "Outros",

  dashboard: "Painel",

  language: "Idioma",
  languageDesc: "Escolha seu idioma preferido",
};

const translations: Record<Locale, Translations> = {
  en,
  "pt-BR": ptBR,
};

export function getTranslations(locale: Locale): Translations {
  return translations[locale] ?? en;
}

export const I18nContext = createContext<Translations>(en);

export function useI18n(): Translations {
  return useContext(I18nContext);
}
