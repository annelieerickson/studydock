// Hand-drawn assets live in public/assets (relative so GitHub Pages paths work)
export const asset = (name) => `${import.meta.env.BASE_URL}assets/${name}`

// Seed data for the prototype. Everything resets on page refresh so each
// test participant starts from the same state.

export const SUBJECTS = [
  {
    id: 'coms4720',
    code: 'COMS 4720',
    name: 'Principles of Artificial Intelligence',
    icon: 'icon-ai.png',
    color: '#3E4B8E',
    week: [22, 64, 6, 38, 0, 62, 6],
    projects: [
      {
        id: 'ps7',
        name: 'Problem Set 7',
        minutes: 112,
        sessions: 3,
        dueHrs: 5,
        active: true,
        tasks: [
          { id: 'ps7-1', title: 'Set up Overleaf file', mins: 10, done: true },
          { id: 'ps7-2', title: 'Problem 1', mins: 25, done: true },
          { id: 'ps7-3', title: 'Problem 2', mins: 25, done: true },
          { id: 'ps7-4', title: 'Problem 3', mins: 30, done: false },
          { id: 'ps7-5', title: 'Format and Submit', mins: 10, done: false },
        ],
      },
      {
        id: 'mcts',
        name: 'MCTS Checkers',
        minutes: 58,
        sessions: 2,
        dueHrs: 48,
        active: true,
        tasks: [
          { id: 'mcts-1', title: 'Implement rollout policy', mins: 40, done: true },
          { id: 'mcts-2', title: 'Finish GUI', mins: 35, done: false },
          { id: 'mcts-3', title: 'Test with users', mins: 15, done: false },
          { id: 'mcts-4', title: 'Write report', mins: 45, done: false },
        ],
      },
      {
        id: 'mid',
        name: 'Midterm Review',
        minutes: 28,
        sessions: 1,
        dueHrs: 144,
        tasks: [
          { id: 'mid-1', title: 'Review search algorithms', mins: 30, done: true },
          { id: 'mid-2', title: 'Practice exam', mins: 50, done: false },
        ],
      },
    ],
  },
  {
    id: 'coms3520',
    code: 'COMS 3520',
    name: 'Introduction to Operating Systems',
    icon: 'icon-os.png',
    color: '#7A5C8E',
    week: [30, 0, 45, 25, 20, 0, 20],
    projects: [
      {
        id: 'p1b',
        name: 'Project 1b',
        minutes: 85,
        sessions: 3,
        dueHrs: 16,
        active: true,
        tasks: [
          { id: 'p1b-1', title: '1A, 1P, 1AG', mins: 30, done: true },
          { id: 'p1b-2', title: '2A, 2P, 2AG', mins: 30, done: false },
          { id: 'p1b-3', title: '3A, 3P, 3AG', mins: 10, done: false },
        ],
      },
      {
        id: 'lab4',
        name: 'Lab 4: Scheduling',
        minutes: 40,
        sessions: 1,
        dueHrs: 96,
        tasks: [
          { id: 'lab4-1', title: 'Read the lab spec', mins: 10, done: true },
          { id: 'lab4-2', title: 'Round-robin scheduler', mins: 45, done: false },
        ],
      },
      {
        id: 'ch5',
        name: 'Chapter 5 Reading',
        minutes: 15,
        sessions: 1,
        dueHrs: 72,
        tasks: [
          { id: 'ch5-1', title: 'Read 5.1 – 5.4', mins: 30, done: false },
          { id: 'ch5-2', title: 'Reading quiz', mins: 15, done: false },
        ],
      },
    ],
  },
  {
    id: 'coms3420',
    code: 'COMS 3420',
    name: 'Principles of Programming Languages',
    icon: 'icon-pl.png',
    color: '#5D8AA8',
    week: [0, 35, 20, 0, 40, 20, 0],
    projects: [
      {
        id: 'interp',
        name: 'Interpreter Project',
        minutes: 70,
        sessions: 2,
        dueHrs: 216,
        tasks: [
          { id: 'interp-1', title: 'Parser', mins: 60, done: true },
          { id: 'interp-2', title: 'Evaluator', mins: 60, done: false },
          { id: 'interp-3', title: 'Write tests', mins: 30, done: false },
        ],
      },
      {
        id: 'hw5',
        name: 'Homework 5',
        minutes: 30,
        sessions: 1,
        dueHrs: 60,
        tasks: [
          { id: 'hw5-1', title: 'Lambda calculus problems', mins: 40, done: false },
        ],
      },
      {
        id: 'quiz',
        name: 'Quiz Prep',
        minutes: 15,
        sessions: 1,
        dueHrs: 168,
        tasks: [{ id: 'quiz-1', title: 'Flashcards', mins: 20, done: false }],
      },
    ],
  },
  {
    id: 'uxd4400',
    code: 'UXD 4400',
    name: 'UX Design Research and Emerging Technologies',
    icon: 'icon-ux.png',
    color: '#B08A4A',
    week: [12, 0, 15, 20, 0, 20, 0],
    projects: [
      {
        id: 'hifi',
        name: 'HiFi Wireframes',
        minutes: 45,
        sessions: 2,
        dueHrs: 24,
        active: true,
        tasks: [
          { id: 'hifi-1', title: 'Apply brand colors', mins: 30, done: true },
          { id: 'hifi-2', title: 'Build React prototype', mins: 60, done: false },
          { id: 'hifi-3', title: 'Usability test with classmates', mins: 30, done: false },
        ],
      },
      {
        id: 'persona',
        name: 'Personas',
        minutes: 22,
        sessions: 1,
        dueHrs: 120,
        tasks: [{ id: 'persona-1', title: 'Write 2 personas', mins: 40, done: true }],
      },
      {
        id: 'readings',
        name: 'Weekly Readings',
        minutes: 0,
        sessions: 0,
        dueHrs: 130,
        tasks: [{ id: 'read-1', title: 'Read assigned article', mins: 25, done: false }],
      },
    ],
  },
]

// location: where a studying friend chose to share they're working (null = not shared)
// weekTasks: tasks completed this week; bestFinishMins: fastest time to finish a whole day's plan this week
export const FRIENDS = [
  { id: 'oliver', name: 'Oliver', img: 'avatar-oliver.png', studying: true, subject: 'COMS', mins: 42, location: 'Parks Library', color: '#3E4B8E', weekMins: 612, weekTasks: 18, bestFinishMins: 155 },
  { id: 'max', name: 'Max', img: 'avatar-max.png', studying: true, subject: 'Essay', mins: 70, location: 'Memorial Union', color: '#A6BCC9', weekMins: 488, weekTasks: 22, bestFinishMins: 130 },
  { id: 'marge', name: 'Marge', img: 'avatar-marge.png', studying: true, subject: 'Agronomy', mins: 18, location: null, color: '#F6E0B6', weekMins: 395, weekTasks: 14, bestFinishMins: 95 },
  { id: 'wes', name: 'Wes', studying: false, last: 'Last studied yesterday', color: '#7A5C8E', weekMins: 260, weekTasks: 9, bestFinishMins: 210 },
  { id: 'bram', name: 'Bram', studying: false, last: 'Last studied 3 days ago', color: '#B08A4A', weekMins: 95, weekTasks: 3, bestFinishMins: null },
]

// Places offered when sharing where you're working
export const STUDY_SPOTS = ['Parks Library', 'Memorial Union', 'Student Innovation Center', 'Coffee shop', 'Home']

export const REQUESTS = [
  { id: 'r-priya', name: 'Natasha', handle: '@nat4real', color: '#5D8AA8' },
  { id: 'r-theo', name: 'Makenna', handle: '@mjolley', color: '#3D1534' },
  { id: 'r-june', name: 'Sasha', handle: '@s.plaist', color: '#B08A4A' },
]

export const SENT = [{ id: 's-varsha', name: 'Varsha', note: 'Pending, sent 2 days ago', color: '#7A5C8E' }]

export const HISTORY = [
  { id: 'h1', day: 'Today', time: '10:05 AM', mins: 75, label: 'Problem Set 7', mode: 'Pomodoro' },
  { id: 'h2', day: 'Today', time: '8:30 AM', mins: 58, label: 'MCTS Checkers', mode: 'Deep work' },
  { id: 'h3', day: 'Yesterday', time: '7:40 PM', mins: 50, label: 'Project 1b', mode: 'Deep work' },
  { id: 'h4', day: 'Yesterday', time: '2:15 PM', mins: 35, label: 'HiFi Wireframes', mode: 'Pomodoro' },
  { id: 'h5', day: 'Friday', time: '4:00 PM', mins: 40, label: 'Interpreter Project', mode: 'Set length' },
  { id: 'h6', day: 'Thursday', time: '9:20 PM', mins: 25, label: 'Lab 4: Scheduling', mode: 'Pomodoro' },
  { id: 'h7', day: 'Wednesday', time: '1:00 PM', mins: 60, label: 'Problem Set 7', mode: 'Open' },
]

export const TIMING = {
  pomodoro: { id: 'pomodoro', name: 'Pomodoro', desc: '25 min focus, 5 min break', focus: 25, rest: 5 },
  deep: { id: 'deep', name: 'Deep work', desc: '50 min focus, 10 min break', focus: 50, rest: 10 },
  set: { id: 'set', name: 'Set length', desc: 'One block, no breaks' },
  open: { id: 'open', name: 'Open', desc: 'Count up until you stop' },
}

// Urgency level for a due date, used to color badges
export function urgency(hrs) {
  if (hrs <= 12) return 'urgent'
  if (hrs <= 24) return 'soon'
  if (hrs <= 72) return 'upcoming'
  return 'later'
}

export function fmtDue(hrs) {
  if (hrs <= 48) return `${hrs}hrs`
  return `${Math.round(hrs / 24)} days`
}

export function fmt(mins) {
  const h = Math.floor(mins / 60)
  const m = Math.round(mins % 60)
  if (!h) return `${m}m`
  return `${h}h ${String(m).padStart(2, '0')}m`
}
