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
  edit: string;
  all: string;
  confirm: string;

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
  bookmark: string;
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
  thisWeek: string;
  left: string;

  // Levels
  levelBeginner: string;
  levelExplorer: string;
  levelAchiever: string;
  levelMaster: string;

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
  changeFolder: string;
  backToLibrary: string;
  selectFolderDesc: string;
  reviewStructureDesc: string;
  scanningFolder: string;
  detectingContent: string;
  dragDropFolder: string;
  orClickBrowse: string;
  supportedFormats: string;
  lowConfidence: string;
  mediumConfidence: string;
  courseDetails: string;
  instructorName: string;
  descriptionFromReadme: string;
  courseResources: string;
  courseStructure: string;
  lessonsWillBeImported: string;
  section: string;
  customCategory: string;
  categoryName: string;

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
  markComplete: string;
  openFolder: string;
  editCourse: string;
  resetProgress: string;
  deleteCourse: string;
  confirmDelete: string;
  confirmReset: string;
  courseCompleted: string;
  congratulations: string;
  invalidCourse: string;
  courseNotFound: string;
  hideCurriculum: string;
  showCurriculum: string;
  byAuthor: string;
  switchLesson: string;
  timestampFromLesson: string;
  switchAndSave: string;
  goToLesson: string;
  noLessonSelected: string;
  lessonComplete: string;
  replay: string;
  nextLesson: string;
  addANote: string;
  noNotesCapture: string;
  backToCourse: string;
  updateCourseDesc: string;
  manage: string;
  resetProgressDesc: string;
  confirmResetBtn: string;
  deleteCourseDesc: string;
  deleteWarning: string;
  yesDelete: string;
  saving: string;
  saveChanges: string;
  unsavedChanges: string;
  courseComplete: string;
  congratsFinish: string;

  // Video subtitle settings
  subtitleSmall: string;
  subtitleMedium: string;
  subtitleLarge: string;
  subtitleXL: string;
  subtitleWhite: string;
  subtitleYellow: string;
  subtitleCyan: string;
  subtitleLime: string;
  subtitleBgNone: string;
  subtitlePosLow: string;
  subtitlePosDefault: string;
  subtitlePosMid: string;
  subtitlePosHigh: string;

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
  checking: string;
  installVersion: string;
  checkNewVersions: string;
  updateCheckFailed: string;
  confirmPhrase: string;
  customDataDir: string;
  restoreDefault: string;
  changeLocation: string;
  chooseFolderTitle: string;
  errorSetFolder: string;
  errorResetFolder: string;
  updateReady: string;
  restartToFinish: string;
  versionReadyInstall: string;
  install: string;
  restart: string;

  // Progress page
  progressOverview: string;
  completionRate: string;
  totalCourses: string;
  totalLessons: string;
  progressDescription: string;
  level: string;
  lessonsToNextLevel: string;
  highestRank: string;
  longestStreak: string;
  overallProgress: string;
  activity: string;
  categories: string;
  overview: string;
  courseProgress: string;
  completionByCourse: string;
  lastSixMonths: string;
  activeDays: string;
  activeDay: string;
  coursesCompleted: string;
  inProgressCourses: string;
  notesWritten: string;
  noCoursesYet: string;
  more: string;

  // Notes page
  allNotes: string;
  noNotesYet: string;
  startTakingNotes: string;
  searchNotes: string;
  notesAcrossCourses: string;
  noteAcrossCourse: string;
  noMatchingNotes: string;
  tryDifferentSearch: string;
  modified: string;
  created: string;

  // Bookmarks page
  bookmarkedCourses: string;
  noBookmarks: string;
  bookmarkCourseDesc: string;
  noFavorites: string;
  favoriteDesc: string;
  bookmarkFromLibrary: string;
  favoriteFromCurriculum: string;

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

  // Course Card
  startCourse: string;
  reviewCourse: string;
  continue_: string;
  unknownAuthor: string;
  never: string;
  today: string;
  yesterday: string;
  daysAgo: string;
  weeksAgo: string;

  // Language
  language: string;
  languageDesc: string;

  // Toasts
  couldntUpdateLesson: string;
  couldntUpdateFavorite: string;
  couldntSaveNote: string;
  couldntUpdateNote: string;
  couldntDeleteNote: string;
  couldntOpenResource: string;
  tryAgainMoment: string;
  contentStillInEditor: string;
  changesNotSaved: string;
  fileMayBeMoved: string;

  // NoteEditor
  currentTime: string;
  goToTime: string;
  bold: string;
  italic: string;
  underline: string;
  strikethrough: string;
  typeAtToTag: string;
  writeANote: string;

  // VideoPlayer tooltips
  tooltipBack: string;
  tooltipForward: string;
  tooltipNextLesson: string;
  tooltipSpeed: string;
  tooltipSubtitles: string;
  tooltipPiP: string;

  // AppShell
  navigation: string;
  app: string;
  anotherLesson: string;
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
  edit: "Edit",
  all: "All",
  confirm: "Confirm",

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
  bookmark: "Bookmark",
  failedToLoad: "Failed to load your library.",
  tryAgain: "Try again",

  currentStreak: "Current Streak",
  days: "days",
  day: "day",
  lessonsCompleted: "Lessons Completed",
  totalWatchTime: "Total Watch Time",
  hours: "h",
  minutes: "min",
  thisWeek: "This week",
  left: "left",

  levelBeginner: "Beginner",
  levelExplorer: "Explorer",
  levelAchiever: "Achiever",
  levelMaster: "Master",

  emptyLibraryTitle: "Your library is empty",
  emptyLibraryDescription: "Import your first course to get started. Just point Ckourse at any folder with video lessons.",
  importYourFirst: "Import your first course",

  selectCourseFolder: "Select Course Folder",
  browseFolder: "Browse Folder",
  dropFolderHere: "Drop folder here",
  orBrowse: "or browse to select",
  configureCourse: "Configure Course",
  courseTitle: "Course title",
  author: "Author",
  category: "Category",
  accentColor: "Accent Color",
  importingCourse: "Importing course...",
  settingUpLibrary: "Setting up your library",
  parseError: "Failed to parse course folder",
  sections: "Sections",
  structure: "Structure",
  changeFolder: "Change folder",
  backToLibrary: "Back to library",
  selectFolderDesc: "Select a folder containing your course videos to get started.",
  reviewStructureDesc: "Review the detected structure and configure your course details.",
  scanningFolder: "Scanning folder...",
  detectingContent: "Detecting videos, subtitles, and resources",
  dragDropFolder: "Drag & drop a course folder",
  orClickBrowse: "or click to browse your files",
  supportedFormats: "Supports .mp4, .mkv, .avi, .mov and other video formats",
  lowConfidence: "Low confidence parse — review carefully",
  mediumConfidence: "Some structure was inferred",
  courseDetails: "Course Details",
  instructorName: "Instructor name",
  descriptionFromReadme: "Description (from README)",
  courseResources: "Course Resources",
  courseStructure: "Course Structure",
  lessonsWillBeImported: "lessons will be imported",
  section: "section",
  customCategory: "+ Custom",
  categoryName: "Category name",

  resources: "Resources",
  curriculum: "Curriculum",
  addNote: "Add note",
  editNote: "Edit note",
  deleteNote: "Delete note",
  noteContent: "Write your note...",
  noNotes: "No notes for this lesson.",
  markCompleted: "Mark as completed",
  markIncomplete: "Mark as incomplete",
  markComplete: "Mark complete",
  openFolder: "Open folder",
  editCourse: "Edit course",
  resetProgress: "Reset progress",
  deleteCourse: "Delete course",
  confirmDelete: "Are you sure you want to delete this course?",
  confirmReset: "Are you sure you want to reset all progress?",
  courseCompleted: "Course Completed!",
  congratulations: "Congratulations! You've completed the entire course.",
  invalidCourse: "Invalid course.",
  courseNotFound: "Course not found.",
  hideCurriculum: "Hide",
  showCurriculum: "Show Curriculum",
  byAuthor: "by",
  switchLesson: "Switch lesson?",
  timestampFromLesson: "This timestamp is from",
  switchAndSave: "Switching will save your current position.",
  goToLesson: "Go to lesson",
  noLessonSelected: "No lesson selected",
  lessonComplete: "Lesson Complete",
  replay: "Replay",
  nextLesson: "Next Lesson",
  addANote: "Add a note...",
  noNotesCapture: "No notes yet. Start capturing your thoughts.",
  backToCourse: "Back to Course",
  updateCourseDesc: "Update course details or manage progress and data.",
  manage: "Manage",
  resetProgressDesc: "Mark all lessons as incomplete and clear watch history.",
  confirmResetBtn: "Confirm Reset",
  deleteCourseDesc: "Remove this course from your library. Your files on disk won't be affected.",
  deleteWarning: "This will delete all notes and progress. This cannot be undone.",
  yesDelete: "Yes, Delete",
  saving: "Saving...",
  saveChanges: "Save Changes",
  unsavedChanges: "Unsaved changes",
  courseComplete: "Course Complete!",
  congratsFinish: "Congratulations on finishing the course",

  subtitleSmall: "Small",
  subtitleMedium: "Medium",
  subtitleLarge: "Large",
  subtitleXL: "XL",
  subtitleWhite: "White",
  subtitleYellow: "Yellow",
  subtitleCyan: "Cyan",
  subtitleLime: "Lime",
  subtitleBgNone: "None",
  subtitlePosLow: "Low",
  subtitlePosDefault: "Default",
  subtitlePosMid: "Mid",
  subtitlePosHigh: "High",

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
  checking: "Checking…",
  installVersion: "Install",
  checkNewVersions: "Check for new versions",
  updateCheckFailed: "Update check failed",
  confirmPhrase: "delete all",
  customDataDir: "Custom:",
  restoreDefault: "Restore default",
  changeLocation: "Change location",
  chooseFolderTitle: "Choose folder for database",
  errorSetFolder: "Error setting folder",
  errorResetFolder: "Error resetting folder",
  updateReady: "Update ready",
  restartToFinish: "Restart to finish installing",
  versionReadyInstall: "is ready to install",
  install: "Install",
  restart: "Restart",

  progressOverview: "Progress Overview",
  completionRate: "Completion Rate",
  totalCourses: "Total Courses",
  totalLessons: "Total Lessons",
  progressDescription: "Your learning journey at a glance",
  level: "Level",
  lessonsToNextLevel: "more lessons to",
  highestRank: "Highest rank achieved",
  longestStreak: "Longest streak",
  overallProgress: "Overall progress",
  activity: "Activity",
  categories: "Categories",
  overview: "Overview",
  courseProgress: "Course Progress",
  completionByCourse: "Completion by Course",
  lastSixMonths: "Last 6 months",
  activeDays: "active days",
  activeDay: "active day",
  coursesCompleted: "Courses completed",
  inProgressCourses: "In progress",
  notesWritten: "Notes written",
  noCoursesYet: "No courses yet.",
  more: "more",

  allNotes: "All Notes",
  noNotesYet: "No notes yet. Add notes while watching your courses.",
  startTakingNotes: "Start taking notes while watching your courses. Use @ to tag timestamps.",
  searchNotes: "Search notes...",
  notesAcrossCourses: "notes across",
  noteAcrossCourse: "note across",
  noMatchingNotes: "No matching notes",
  tryDifferentSearch: "Try a different search or filter.",
  modified: "Modified",
  created: "Created",

  bookmarkedCourses: "Bookmarked Courses",
  noBookmarks: "No bookmarked courses yet.",
  bookmarkCourseDesc: "Bookmark courses and favorite videos to find them quickly here.",
  noFavorites: "No favorite videos",
  favoriteDesc: "Favorite a video from the curriculum sidebar.",
  bookmarkFromLibrary: "Bookmark a course from your library or course detail page.",
  favoriteFromCurriculum: "Favorite a video from the curriculum sidebar.",

  portableMode: "Portable Mode",
  portableModeActive: "Running in portable mode — data stored next to the app",

  frontend: "Frontend",
  backend: "Backend",
  devops: "DevOps",
  database: "Database",
  design: "Design",
  other: "Other",

  dashboard: "Dashboard",

  startCourse: "Start Course",
  reviewCourse: "Review Course",
  continue_: "Continue",
  unknownAuthor: "Unknown author",
  never: "Never",
  today: "Today",
  yesterday: "Yesterday",
  daysAgo: "d ago",
  weeksAgo: "w ago",

  language: "Language",
  languageDesc: "Choose your preferred language",

  couldntUpdateLesson: "Couldn't update lesson",
  couldntUpdateFavorite: "Couldn't update favorite",
  couldntSaveNote: "Couldn't save note",
  couldntUpdateNote: "Couldn't update note",
  couldntDeleteNote: "Couldn't delete note",
  couldntOpenResource: "Couldn't open resource",
  tryAgainMoment: "Try again in a moment.",
  contentStillInEditor: "Your content is still in the editor.",
  changesNotSaved: "Your changes weren't saved.",
  fileMayBeMoved: "The file may have been moved or deleted.",

  currentTime: "Current time",
  goToTime: "Go to time",
  bold: "Bold",
  italic: "Italic",
  underline: "Underline",
  strikethrough: "Strikethrough",
  typeAtToTag: "Type @ to tag time",
  writeANote: "Write a note...",

  tooltipBack: "Back 10s (J)",
  tooltipForward: "Forward 10s (L)",
  tooltipNextLesson: "Next lesson",
  tooltipSpeed: "Playback speed",
  tooltipSubtitles: "Subtitles (C)",
  tooltipPiP: "Picture-in-Picture (P)",

  navigation: "Navigation",
  app: "App",
  anotherLesson: "another lesson",
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
  edit: "Editar",
  all: "Todos",
  confirm: "Confirmar",

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
  bookmark: "Marcar",
  failedToLoad: "Falha ao carregar sua biblioteca.",
  tryAgain: "Tentar novamente",

  currentStreak: "Sequência Atual",
  days: "dias",
  day: "dia",
  lessonsCompleted: "Aulas Concluídas",
  totalWatchTime: "Tempo Total",
  hours: "h",
  minutes: "min",
  thisWeek: "Esta semana",
  left: "restantes",

  levelBeginner: "Iniciante",
  levelExplorer: "Explorador",
  levelAchiever: "Conquistador",
  levelMaster: "Mestre",

  emptyLibraryTitle: "Sua biblioteca está vazia",
  emptyLibraryDescription: "Importe seu primeiro curso para começar. Basta apontar o Ckourse para qualquer pasta com videoaulas.",
  importYourFirst: "Importar primeiro curso",

  selectCourseFolder: "Selecionar Pasta do Curso",
  browseFolder: "Procurar Pasta",
  dropFolderHere: "Solte a pasta aqui",
  orBrowse: "ou procure para selecionar",
  configureCourse: "Configurar Curso",
  courseTitle: "Título do curso",
  author: "Autor",
  category: "Categoria",
  accentColor: "Cor de Destaque",
  importingCourse: "Importando curso...",
  settingUpLibrary: "Configurando sua biblioteca",
  parseError: "Falha ao analisar pasta do curso",
  sections: "Seções",
  structure: "Estrutura",
  changeFolder: "Trocar pasta",
  backToLibrary: "Voltar à biblioteca",
  selectFolderDesc: "Selecione uma pasta com os vídeos do curso para começar.",
  reviewStructureDesc: "Revise a estrutura detectada e configure os detalhes do curso.",
  scanningFolder: "Analisando pasta...",
  detectingContent: "Detectando vídeos, legendas e recursos",
  dragDropFolder: "Arraste e solte uma pasta de curso",
  orClickBrowse: "ou clique para procurar seus arquivos",
  supportedFormats: "Suporta .mp4, .mkv, .avi, .mov e outros formatos de vídeo",
  lowConfidence: "Análise com baixa confiança — revise com cuidado",
  mediumConfidence: "Parte da estrutura foi inferida",
  courseDetails: "Detalhes do Curso",
  instructorName: "Nome do instrutor",
  descriptionFromReadme: "Descrição (do README)",
  courseResources: "Recursos do Curso",
  courseStructure: "Estrutura do Curso",
  lessonsWillBeImported: "aulas serão importadas",
  section: "seção",
  customCategory: "+ Personalizar",
  categoryName: "Nome da categoria",

  resources: "Recursos",
  curriculum: "Currículo",
  addNote: "Adicionar nota",
  editNote: "Editar nota",
  deleteNote: "Excluir nota",
  noteContent: "Escreva sua nota...",
  noNotes: "Nenhuma nota para esta aula.",
  markCompleted: "Marcar como concluída",
  markIncomplete: "Marcar como não concluída",
  markComplete: "Marcar como concluída",
  openFolder: "Abrir pasta",
  editCourse: "Editar curso",
  resetProgress: "Resetar progresso",
  deleteCourse: "Excluir curso",
  confirmDelete: "Tem certeza que deseja excluir este curso?",
  confirmReset: "Tem certeza que deseja resetar todo o progresso?",
  courseCompleted: "Curso Concluído!",
  congratulations: "Parabéns! Você concluiu o curso inteiro.",
  invalidCourse: "Curso inválido.",
  courseNotFound: "Curso não encontrado.",
  hideCurriculum: "Ocultar",
  showCurriculum: "Mostrar Currículo",
  byAuthor: "por",
  switchLesson: "Trocar de aula?",
  timestampFromLesson: "Este timestamp é da aula",
  switchAndSave: "Trocar irá salvar sua posição atual.",
  goToLesson: "Ir para a aula",
  noLessonSelected: "Nenhuma aula selecionada",
  lessonComplete: "Aula Concluída",
  replay: "Repetir",
  nextLesson: "Próxima Aula",
  addANote: "Adicionar uma nota...",
  noNotesCapture: "Nenhuma nota ainda. Comece a registrar seus pensamentos.",
  backToCourse: "Voltar ao Curso",
  updateCourseDesc: "Atualize os detalhes do curso ou gerencie progresso e dados.",
  manage: "Gerenciar",
  resetProgressDesc: "Marca todas as aulas como não concluídas e limpa o histórico.",
  confirmResetBtn: "Confirmar Reset",
  deleteCourseDesc: "Remove este curso da sua biblioteca. Seus arquivos no disco não serão afetados.",
  deleteWarning: "Isso excluirá todas as notas e progresso. Esta ação não pode ser desfeita.",
  yesDelete: "Sim, Excluir",
  saving: "Salvando...",
  saveChanges: "Salvar Alterações",
  unsavedChanges: "Alterações não salvas",
  courseComplete: "Curso Concluído!",
  congratsFinish: "Parabéns por concluir o curso",

  subtitleSmall: "Pequena",
  subtitleMedium: "Média",
  subtitleLarge: "Grande",
  subtitleXL: "Extra Grande",
  subtitleWhite: "Branco",
  subtitleYellow: "Amarelo",
  subtitleCyan: "Ciano",
  subtitleLime: "Lima",
  subtitleBgNone: "Nenhum",
  subtitlePosLow: "Baixa",
  subtitlePosDefault: "Padrão",
  subtitlePosMid: "Média",
  subtitlePosHigh: "Alta",

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
  checking: "Verificando…",
  installVersion: "Instalar",
  checkNewVersions: "Verificar novas versões",
  updateCheckFailed: "Falha ao verificar atualizações",
  confirmPhrase: "delete all",
  customDataDir: "Customizado:",
  restoreDefault: "Restaurar padrão",
  changeLocation: "Alterar local",
  chooseFolderTitle: "Escolher pasta para o banco de dados",
  errorSetFolder: "Erro ao definir pasta",
  errorResetFolder: "Erro ao resetar",
  updateReady: "Atualização pronta",
  restartToFinish: "Reinicie para finalizar a instalação",
  versionReadyInstall: "pronta para instalar",
  install: "Instalar",
  restart: "Reiniciar",

  progressOverview: "Visão Geral do Progresso",
  completionRate: "Taxa de Conclusão",
  totalCourses: "Total de Cursos",
  totalLessons: "Total de Aulas",
  progressDescription: "Sua jornada de aprendizado em um relance",
  level: "Nível",
  lessonsToNextLevel: "aulas restantes para",
  highestRank: "Maior nível alcançado",
  longestStreak: "Maior sequência",
  overallProgress: "Progresso geral",
  activity: "Atividade",
  categories: "Categorias",
  overview: "Visão Geral",
  courseProgress: "Progresso dos Cursos",
  completionByCourse: "Conclusão por Curso",
  lastSixMonths: "Últimos 6 meses",
  activeDays: "dias ativos",
  activeDay: "dia ativo",
  coursesCompleted: "Cursos concluídos",
  inProgressCourses: "Em progresso",
  notesWritten: "Notas escritas",
  noCoursesYet: "Nenhum curso ainda.",
  more: "mais",

  allNotes: "Todas as Notas",
  noNotesYet: "Nenhuma nota ainda. Adicione notas enquanto assiste seus cursos.",
  startTakingNotes: "Comece a fazer anotações enquanto assiste seus cursos. Use @ para marcar timestamps.",
  searchNotes: "Buscar notas...",
  notesAcrossCourses: "notas em",
  noteAcrossCourse: "nota em",
  noMatchingNotes: "Nenhuma nota encontrada",
  tryDifferentSearch: "Tente uma busca ou filtro diferente.",
  modified: "Modificado",
  created: "Criado",

  bookmarkedCourses: "Cursos Marcados",
  noBookmarks: "Nenhum curso marcado ainda.",
  bookmarkCourseDesc: "Marque cursos e favorite vídeos para encontrá-los rapidamente aqui.",
  noFavorites: "Nenhum vídeo favoritado",
  favoriteDesc: "Favorite um vídeo pelo painel de currículo.",
  bookmarkFromLibrary: "Marque um curso na sua biblioteca ou na página de detalhes.",
  favoriteFromCurriculum: "Favorite um vídeo pelo painel de currículo.",

  portableMode: "Modo Portátil",
  portableModeActive: "Rodando em modo portátil — dados salvos junto ao app",

  frontend: "Frontend",
  backend: "Backend",
  devops: "DevOps",
  database: "Banco de Dados",
  design: "Design",
  other: "Outros",

  dashboard: "Painel",

  startCourse: "Iniciar Curso",
  reviewCourse: "Revisar Curso",
  continue_: "Continuar",
  unknownAuthor: "Autor desconhecido",
  never: "Nunca",
  today: "Hoje",
  yesterday: "Ontem",
  daysAgo: "d atrás",
  weeksAgo: "sem atrás",

  language: "Idioma",
  languageDesc: "Escolha seu idioma preferido",

  couldntUpdateLesson: "Não foi possível atualizar a aula",
  couldntUpdateFavorite: "Não foi possível atualizar o favorito",
  couldntSaveNote: "Não foi possível salvar a nota",
  couldntUpdateNote: "Não foi possível atualizar a nota",
  couldntDeleteNote: "Não foi possível excluir a nota",
  couldntOpenResource: "Não foi possível abrir o recurso",
  tryAgainMoment: "Tente novamente em um momento.",
  contentStillInEditor: "Seu conteúdo ainda está no editor.",
  changesNotSaved: "Suas alterações não foram salvas.",
  fileMayBeMoved: "O arquivo pode ter sido movido ou excluído.",

  currentTime: "Tempo atual",
  goToTime: "Ir para o tempo",
  bold: "Negrito",
  italic: "Itálico",
  underline: "Sublinhado",
  strikethrough: "Tachado",
  typeAtToTag: "Digite @ para marcar o tempo",
  writeANote: "Escreva uma nota...",

  tooltipBack: "Voltar 10s (J)",
  tooltipForward: "Avançar 10s (L)",
  tooltipNextLesson: "Próxima aula",
  tooltipSpeed: "Velocidade de reprodução",
  tooltipSubtitles: "Legendas (C)",
  tooltipPiP: "Picture-in-Picture (P)",

  navigation: "Navegação",
  app: "App",
  anotherLesson: "outra aula",
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
