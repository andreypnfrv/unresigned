"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from '../../../lib/routeUtil';
import classNames from 'classnames';
import TabNavigationMenu, { TAB_NAVIGATION_MENU_WIDTH } from './TabNavigationMenu';
import { defineStyles, useStyles } from '@/components/hooks/useStyles';
import { getCommunityPath } from '@/lib/pathConstants';
import { isLWStyleForum } from '@/lib/forumTypeUtils';

const ICON_ONLY_NAVIGATION_WIDTH = 64;
export const ICON_ONLY_NAVIGATION_BREAKPOINT = 1424;

const styles = defineStyles("NavigationStandalone", (theme: ThemeType) => ({
  navStack: {
    position: "relative",
    zIndex: theme.zIndexes.tabNavigation,
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
    [theme.breakpoints.up('sm')]: {
      position: "sticky",
      top: "var(--header-height, 64px)",
      alignSelf: "flex-start",
      height: "calc(100dvh - var(--header-height, 64px))",
      maxHeight: "calc(100dvh - var(--header-height, 64px))",
      boxSizing: "border-box",
    },
  },
  viewportScrim: {
    position: "fixed",
    inset: 0,
    zIndex: theme.zIndexes.tabNavigation - 1,
    pointerEvents: "none",
    background: `linear-gradient(90deg, ${theme.palette.greyAlpha(0.38)} 0%, ${theme.palette.greyAlpha(0.12)} min(360px, 32vw), transparent 58%)`,
    [theme.breakpoints.down('sm')]: {
      display: "none",
    },
  },
  sidebar: {
    width: TAB_NAVIGATION_MENU_WIDTH,
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
    [theme.breakpoints.down('sm')]: {
      display: "none"
    }
  },
  iconOnlySidebar: {
    [`@media (max-width: ${ICON_ONLY_NAVIGATION_BREAKPOINT}px)`]: {
      width: ICON_ONLY_NAVIGATION_WIDTH,
    },
  },
  navSidebarTransparent: {
    zIndex: 10,
  },
  background: {
    background: theme.palette.panelBackground.translucent3,
  },
  fullNavigation: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
    [`@media (max-width: ${ICON_ONLY_NAVIGATION_BREAKPOINT}px)`]: {
      display: "none",
    },
  },
  iconOnlyNavigation: {
    flex: 1,
    display: "none",
    flexDirection: "column",
    minHeight: 0,
    [`@media (max-width: ${ICON_ONLY_NAVIGATION_BREAKPOINT}px)`]: {
      display: "flex",
    },
  },
}))

const NavigationStandalone = ({ sidebarHidden, iconOnlyNavigationEnabled }: {
  sidebarHidden: boolean,
  iconOnlyNavigationEnabled?: boolean,
}) => {
  const classes = useStyles(styles);
  const { location } = useLocation();
  const [mounted, setMounted] = useState(false);
  const [navHovered, setNavHovered] = useState(false);
  const scrimEnabled = isLWStyleForum();

  useEffect(() => {
    setMounted(true);
  }, []);

  const background = location.pathname === getCommunityPath();

  const scrim =
    mounted &&
    scrimEnabled &&
    navHovered &&
    typeof document !== "undefined"
      ? createPortal(<div className={classes.viewportScrim} aria-hidden />, document.body)
      : null;

  return <>
    {scrim}
    <div
      className={classes.navStack}
      onMouseEnter={() => {
        if (scrimEnabled) setNavHovered(true);
      }}
      onMouseLeave={() => setNavHovered(false)}
    >
      <Slide slidIn={!sidebarHidden}>
        <div className={classNames(classes.sidebar, {
          [classes.background]: background,
          [classes.iconOnlySidebar]: iconOnlyNavigationEnabled,
        })}>
          <div className={classes.fullNavigation}>
            <TabNavigationMenu
              iconOnlyNavigationEnabled={false}
            />
          </div>
          {iconOnlyNavigationEnabled && <div className={classes.iconOnlyNavigation}>
            <TabNavigationMenu
              iconOnlyNavigationEnabled={iconOnlyNavigationEnabled}
            />
          </div>}
        </div>
      </Slide>
    </div>
  </>;
}

const slideStyles = defineStyles("Slide", (theme: ThemeType) => ({
  wrapper: {
    position: "relative",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
  },
  slider: {
    transition: "left 0.3s ease-in-out",
    position: "relative",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
  },
  slidOut: {
    left: "-100%",
  },
  slidIn: {
    left: 0,
  },
}));

const Slide = ({slidIn, children}: {
  slidIn: boolean,
  children: React.ReactNode
}) => {
  const classes = useStyles(slideStyles);
  return <div className={classes.wrapper}>
    <div className={classNames(classes.slider, {
      [classes.slidOut]: !slidIn,
      [classes.slidIn]: slidIn,
    })}>
      {children}
    </div>
  </div>
}

export default NavigationStandalone;

