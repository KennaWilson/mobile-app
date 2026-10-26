import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export type TaskKind = 'task' | 'schedule';
export type TaskType = 'task' | 'project' | 'event';
export type TaskDue = 'now' | 'today' | 'week' | 'month' | 'custom';
export type TaskPriority = 'nice' | 'should' | 'must';

export type TaskDetails = {
  minutes: number;
  type: TaskType;
  due: TaskDue;
  dueCustom?: string;
  priority: TaskPriority;
};

export type Task = {
  id: string;
  title: string;
  kind: TaskKind;
  type: TaskType;
  minutes: number;
  due: TaskDue;
  dueCustom?: string;
  priority: TaskPriority;
  done: boolean;
};

export type ListItem = {
  id: string;
  text: string;
  done: boolean;
};

const DEFAULT_DETAILS: TaskDetails = {
  minutes: 25,
  type: 'task',
  due: 'today',
  priority: 'should',
};

type TasksContextValue = {
  tasks: Task[];
  addTasks: (titles: string[], details?: Partial<TaskDetails>) => void;
  toggleTask: (id: string) => void;
  setTaskMinutes: (id: string, minutes: number) => void;
  listItems: ListItem[];
  addListItems: (texts: string[]) => void;
  toggleListItem: (id: string) => void;
};

const TasksContext = createContext<TasksContextValue | null>(null);

export function splitLines(text: string) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export function formatDue(due: TaskDue, dueCustom?: string) {
  switch (due) {
    case 'now':
      return 'Right now';
    case 'today':
      return 'Due today';
    case 'week':
      return 'Due this week';
    case 'month':
      return 'Due this month';
    case 'custom':
      return dueCustom ? `Due ${dueCustom}` : 'Custom due date';
  }
}

export function formatPriority(priority: TaskPriority) {
  switch (priority) {
    case 'nice':
      return 'Nice to have';
    case 'should':
      return 'Should do';
    case 'must':
      return 'Must do';
  }
}

export function formatTaskType(type: TaskType) {
  switch (type) {
    case 'task':
      return 'Task';
    case 'project':
      return 'Project';
    case 'event':
      return 'Calendar event';
  }
}

function makeId(index: number) {
  return `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`;
}

function kindFromType(type: TaskType): TaskKind {
  return type === 'event' ? 'schedule' : 'task';
}

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [listItems, setListItems] = useState<ListItem[]>([]);

  const value = useMemo<TasksContextValue>(
    () => ({
      tasks,
      addTasks: (titles, partial) => {
        const details = { ...DEFAULT_DETAILS, ...partial };
        setTasks((current) => [
          ...current,
          ...titles.map((title, index) => ({
            id: makeId(index),
            title,
            kind: kindFromType(details.type),
            type: details.type,
            minutes: details.minutes,
            due: details.due,
            dueCustom: details.dueCustom,
            priority: details.priority,
            done: false,
          })),
        ]);
      },
      toggleTask: (id) =>
        setTasks((current) =>
          current.map((task) => (task.id === id ? { ...task, done: !task.done } : task)),
        ),
      setTaskMinutes: (id, minutes) =>
        setTasks((current) =>
          current.map((task) => (task.id === id ? { ...task, minutes } : task)),
        ),
      listItems,
      addListItems: (texts) =>
        setListItems((current) => [
          ...current,
          ...texts.map((text, index) => ({ id: makeId(index), text, done: false })),
        ]),
      toggleListItem: (id) =>
        setListItems((current) =>
          current.map((item) => (item.id === id ? { ...item, done: !item.done } : item)),
        ),
    }),
    [tasks, listItems],
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function useTasks() {
  const context = useContext(TasksContext);
  if (!context) throw new Error('useTasks must be used inside TasksProvider');
  return context;
}
