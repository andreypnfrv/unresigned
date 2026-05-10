import { isServer } from "./executionEnvironment";
import type { ForumTypeString } from "./instanceSettings"

export function inferForumTypeFromDeploymentUrl(): ForumTypeString | undefined {
  const rawUrls = [
    process.env.SITE_URL,
    process.env.RAILWAY_PUBLIC_DOMAIN,
    process.env.RAILWAY_STATIC_URL,
  ].filter((s): s is string => typeof s === "string" && s.trim().length > 0);

  for (const raw of rawUrls) {
    const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw.replace(/^\/+/, "")}`;
    try {
      const { hostname } = new URL(withScheme);
      if (hostname.includes("alignmentforum.org")) {
        return "AlignmentForum";
      }
      if (hostname.includes("forum.effectivealtruism.org")) {
        return "EAForum";
      }
      if (hostname.includes("antimortality.org")) {
        return "Antimortality";
      }
    } catch {
      // ignore invalid URLs
    }
  }
  return undefined;
}

export const forumTypeSetting: { get: () => ForumTypeString } = {
  get: () => {
    if (isServer) {
      const explicit = process.env.FORUM_TYPE?.trim();
      if (explicit) {
        return explicit as ForumTypeString;
      }
      const inferred = inferForumTypeFromDeploymentUrl();
      if (inferred) {
        return inferred;
      }
      return "Unresigned";
    }

    const fromPublic = process.env.NEXT_PUBLIC_FORUM_TYPE?.trim() as ForumTypeString | undefined;
    if (fromPublic && (fromPublic === "Unresigned" || fromPublic === "Antimortality" || fromPublic === "EAForum" || fromPublic === "AlignmentForum")) {
      return fromPublic;
    }

    const urlObj = new URL(window.location.href);
    if (urlObj.hostname.includes('alignmentforum.org')) {
      return 'AlignmentForum';
    } else if (urlObj.hostname.includes('forum.effectivealtruism.org')) {
      return 'EAForum';
    } else if (urlObj.hostname.includes('antimortality.org')) {
      return 'Antimortality';
    } else {
      return process.env.FORUM_TYPE as ForumTypeString | undefined ?? 'Unresigned';
    }
  }
};

/** Unresigned or Antimortality — shared LW-style UI (themes, header image editor, etc.). */
export function isLWStyleForum(): boolean {
  const t = forumTypeSetting.get();
  return t === "Unresigned" || t === "Antimortality";
}

export const isLW = isLWStyleForum;
export const isUnresignedForum = isLWStyleForum;

export const isEAForum = () => forumTypeSetting.get() === "EAForum"
export const isAntimortality = () => forumTypeSetting.get() === "Antimortality"
export const isAF = () => forumTypeSetting.get() === "AlignmentForum"

export const isUnresignedStyledForumType = (forumType: ForumTypeString): boolean =>
  forumType === "Unresigned" || forumType === "Antimortality"
export const isLWorAF = () => isLW() || isAF()

//Partial Type adds "undefined" erroneously to T, so we need to explicitly tell TS that it can't be undefined.
type NonUndefined<T> = T extends undefined ? never : T;

type ComboForumTypeString = Exclude<ForumTypeString, "Unresigned" | "AlignmentForum"> | "LWAF";

export type ForumOptions<T> = Record<ForumTypeString, T> |
  Record<ComboForumTypeString, T> |
  (Partial<Record<ForumTypeString, T>> & {default: T}) |
  (Partial<Record<ComboForumTypeString, T>> & {default: T});

export function forumSelect<T>(forumOptions: ForumOptions<T>, forumType?: ForumTypeString): NonUndefined<T> {
  forumType ??= forumTypeSetting.get();
  if (forumType in forumOptions) {
    return (forumOptions as AnyBecauseTodo)[forumType] as NonUndefined<T> // The default branch ensures T always exists
  }
  if (forumType === "Antimortality" && "Unresigned" in forumOptions) {
    return forumOptions["Unresigned"] as NonUndefined<T>
  }
  if ((forumType === "Unresigned" || forumType === "AlignmentForum") && "LWAF" in forumOptions) {
    return forumOptions["LWAF"] as NonUndefined<T>
  }
  // @ts-ignore - if we get here, our type definition guarantees that there's a default set
  return forumOptions.default
}

export class DeferredForumSelect<T> {
  constructor(private forumOptions: ForumOptions<T>) {}

  getDefault() {
    return "default" in this.forumOptions ? this.forumOptions.default : undefined;
  }

  get(forumType?: ForumTypeString): NonUndefined<T> {
    return forumSelect(this.forumOptions, forumType);
  }
}
