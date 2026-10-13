import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export type Task = {
  id: string;
  title: string;
  minutes: number;
  done: boolean;
};

export type ListItem = {
  id: string;
  text: string;
  done: boolean;
};

const DEFAULT_TASK_MINUTES = 25;

type TasksContextValue = {
  tasks: Task[];
  addFromText: (text: string) => void;
  toggleTask: (id: string) => void;
  setTaskMinutes: (id: string, minutes: number) => void;
  listItems: ListItem[];
  addListItems: (text: string) => void;
  toggleListItem: (id: string) => void;
};

const TasksContext = createContext<TasksContextValue | null>(null);

function splitLines(text: string) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function makeId(index: number) {
  return `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`;
}

function createTasks(text: string): Task[] {
  return splitLines(text).map((title, index) => ({
    id: makeId(index),
    title,
    minutes: DEFAULT_TASK_MINUTES,
    done: false,
  }));
}

function createListItems(text: string): ListItem[] {
  return splitLines(text).map((line, index) => ({ id: makeId(index), text: line, done: false }));
}

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [listItems, setListItems] = useState<ListItem[]>([]);

  const value = useMemo<TasksContextValue>(
    () => ({
      tasks,
      addFromText: (text) => setTasks((current) => [...current, ...createTasks(text)]),
      toggleTask: (id) =>
        setTasks((current) =>
          current.map((task) => (task.id === id ? { ...task, done: !task.done } : task)),
        ),
      setTaskMinutes: (id, minutes) =>
        setTasks((current) =>
          current.map((task) => (task.id === id ? { ...task, minutes } : task)),
        ),
      listItems,
      addListItems: (text) =>
        setListItems((current) => [...current, ...createListItems(text)]),
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
