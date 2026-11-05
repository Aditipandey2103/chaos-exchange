import { useEffect, useRef, useState } from "react";
import { num } from "../format";

/** Price that briefly flashes green/red when it ticks. */
export function Price({ value }: { value: number }) {
  const prev = useRef(value);
  const [flash, setFlash] = useState("");

  useEffect(() => {
    if (value === prev.current) return;
    setFlash(value > prev.current ? "flash-up" : "flash-down");
    prev.current = value;
    const t = window.setTimeout(() => setFlash(""), 700);
    return () => window.clearTimeout(t);
  }, [value]);

  return <span className={`price ${flash}`}>{num(value)}</span>;
}
