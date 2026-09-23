"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

const HelloContext = createContext<() => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [tick, setTick] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hello = useCallback(() => {
    setTick((t) => t + 1);
    setVisible(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setVisible(false), 1800);
  }, []);

  return (
    <HelloContext.Provider value={hello}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-[3000] flex justify-center px-4">
        {visible && (
          <div
            key={tick}
            className="rounded-full bg-ink px-6 py-3 text-sm font-bold text-white shadow-soft animate-[fade_0.2s_ease-out]"
          >
            Hello World
          </div>
        )}
      </div>
    </HelloContext.Provider>
  );
}

export const useHello = () => useContext(HelloContext);