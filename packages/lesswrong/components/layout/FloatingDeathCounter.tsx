"use client";

import React, { useEffect, useRef, useState } from "react";
import { defineStyles, useStyles } from "@/components/hooks/useStyles";
import { isUnresignedForum } from "@/lib/forumTypeUtils";

const DEATHS_PER_MINUTE = 90;

const styles = defineStyles("FloatingDeathCounter", (theme: ThemeType) => ({
  root: {
    position: "fixed",
    right: 16,
    bottom: 16,
    zIndex: theme.zIndexes.reactionsFooter,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 2,
    maxWidth: "min(240px, calc(100vw - 32px))",
    pointerEvents: "none",
    ...theme.typography.caption,
    color: theme.palette.text.dim60,
    textAlign: "right",
    textShadow: `0 0 12px ${theme.palette.background.default}`,
  },
  line1: {
    margin: 0,
    fontSize: 13,
    lineHeight: 1.35,
    color: theme.palette.text.primary,
    textAlign: "right",
  },
  count: {
    fontWeight: 600,
    fontVariantNumeric: "tabular-nums",
    letterSpacing: "-0.02em",
  },
  caption: {
    margin: 0,
    fontSize: 11,
    lineHeight: 1.35,
    opacity: 0.92,
  },
}));

const FloatingDeathCounter = () => {
  const classes = useStyles(styles);
  const startMs = useRef<number>(Date.now());
  const [deaths, setDeaths] = useState(0);

  useEffect(() => {
    startMs.current = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startMs.current;
      setDeaths(Math.floor((elapsed / 60_000) * DEATHS_PER_MINUTE));
    };
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, []);

  if (!isUnresignedForum()) {
    return null;
  }

  const personWord = deaths === 1 ? "person" : "people";

  return (
    <div className={classes.root} aria-live="polite">
      <p className={classes.line1}>
        <span className={classes.count}>{deaths.toLocaleString("en-US")}</span>
        {` ${personWord} died`}
      </p>
      <p className={classes.caption}>{"since you've opened the page"}</p>
    </div>
  );
};

export default FloatingDeathCounter;
