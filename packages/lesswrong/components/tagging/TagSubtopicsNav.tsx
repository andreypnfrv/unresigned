import React from "react";
import { Link } from "../../lib/reactRouterWrapper";
import { tagGetUrl } from "@/lib/collections/tags/helpers";
import { defineStyles, useStyles } from "../hooks/useStyles";

const styles = defineStyles("TagSubtopicsNav", (theme: ThemeType) => ({
  root: {
    marginBottom: 20,
    paddingRight: 8,
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
  title: {
    ...theme.typography.caption,
    color: theme.palette.text.dim,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: 8,
    fontWeight: 600,
  },
  link: {
    ...theme.typography.body2,
    display: "block",
    color: theme.palette.link.color ?? theme.palette.primary.main,
    textDecoration: "none",
    padding: "4px 0",
    lineHeight: 1.35,
    "&:hover": {
      opacity: 0.85,
    },
  },
  linkParent: {
    marginBottom: 6,
    paddingBottom: 6,
    borderBottom: `1px solid ${theme.palette.border.faint}`,
  },
}));

export interface TagSubtopicsNavTag {
  _id: string;
  name: string;
  slug: string;
  parentTag?: { _id: string; name: string; slug: string } | null;
  subTags: Array<{ _id: string; name: string; slug: string }>;
}

export interface TagSubtopicsNavArbital {
  parents?: Array<{ _id: string; name: string; slug: string }> | null;
  children?: Array<{ _id: string; name: string; slug: string }> | null;
}

export function mergeTagSubtopicLinks(
  tag: TagSubtopicsNavTag,
  arbitalLinkedPages?: TagSubtopicsNavArbital | null,
): { parent: { _id: string; name: string; slug: string } | null; children: Array<{ _id: string; name: string; slug: string }> } {
  const parent = tag.parentTag ?? arbitalLinkedPages?.parents?.[0] ?? null;
  const byId = new Map<string, { _id: string; name: string; slug: string }>();
  for (const t of tag.subTags) {
    byId.set(t._id, t);
  }
  for (const t of arbitalLinkedPages?.children ?? []) {
    if (!byId.has(t._id)) {
      byId.set(t._id, t);
    }
  }
  const children = [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
  return { parent, children };
}

export function TagSubtopicsNav({
  tag,
  arbitalLinkedPages,
}: {
  tag: TagSubtopicsNavTag;
  arbitalLinkedPages?: TagSubtopicsNavArbital | null;
}) {
  const classes = useStyles(styles);
  const { parent, children } = mergeTagSubtopicLinks(tag, arbitalLinkedPages);

  if (!parent && children.length === 0) {
    return null;
  }

  return (
    <nav className={classes.root} aria-label="Subtopics">
      <div className={classes.title}>Subtopics</div>
      {parent && (
        <Link
          className={`${classes.link} ${classes.linkParent}`}
          to={tagGetUrl(parent)}
        >
          ↑ {parent.name}
        </Link>
      )}
      {children.map((st) => (
        <Link
          key={st._id}
          className={classes.link}
          to={tagGetUrl(st)}
        >
          {st.name}
        </Link>
      ))}
    </nav>
  );
}
