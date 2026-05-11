"use client";

import React from 'react';
import { defineStyles } from '@/components/hooks/defineStyles';
import { useStyles } from '@/components/hooks/useStyles';
import { useConcreteThemeOptions } from '@/components/themes/useTheme';
import { isUnresignedForum } from '@/lib/forumTypeUtils';

const styles = defineStyles("Footer", (theme: ThemeType) => ({
  root: {
    minHeight: 165,
    paddingTop: 12,
    paddingBottom: 24,
    paddingLeft: 24,
    paddingRight: 24,
    boxSizing: "border-box",
    "@media print": {
      display: "none",
    },
  },
  rootPlaceholder: {
    height: 165,
    "@media print": {
      height: 0,
    },
  },
  lineRow: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    boxSizing: "border-box",
  },
  line: {
    flex: 1,
    borderBottom: theme.palette.greyBorder("1px", 0.35),
    minWidth: 0,
  },
  center: {
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingLeft: 20,
    paddingRight: 20,
    gap: 10,
  },
  emblem: {
    display: "block",
    width: 72,
    height: 72,
    objectFit: "contain",
    opacity: 0.92,
  },
  motto: {
    ...theme.typography.overline,
    letterSpacing: "0.28em",
    fontSize: 11,
    color: theme.palette.text.dim60,
    textAlign: "center",
    margin: 0,
    paddingLeft: "0.28em",
  },
}));

const Footer = () => {
  const classes = useStyles(styles);
  const { name: themeName } = useConcreteThemeOptions();
  const emblemSrc =
    themeName === "dark"
      ? "/unresigned-footer-emblem-night.png"
      : "/unresigned-footer-emblem.png";

  if (!isUnresignedForum()) {
    return <div className={classes.rootPlaceholder} />;
  }

  return (
    <footer className={classes.root}>
      <div className={classes.lineRow}>
        <div className={classes.line} aria-hidden />
        <div className={classes.center}>
          <img
            key={emblemSrc}
            src={emblemSrc}
            alt=""
            width={72}
            height={72}
            className={classes.emblem}
            decoding="async"
          />
          <p className={classes.motto}>MEMENTO FUTURI</p>
        </div>
        <div className={classes.line} aria-hidden />
      </div>
    </footer>
  );
};

export default Footer;
