import React, { useMemo } from 'react';
import classNames from 'classnames';
import LWTooltip from "../common/LWTooltip";
import { defineStyles } from '@/components/hooks/defineStyles';
import { useStyles } from '@/components/hooks/useStyles';
import { forumTitleSetting } from '../../lib/instanceSettings';

const readPostStyle = (theme: ThemeType) => ({
  background: theme.palette.grey[405],
})

const styles = defineStyles('PostInteractionStripe', (theme: ThemeType) => ({
  root: {
    position: "absolute",
    left: 0,
    top: 0,
    height: "100%",
    width: 6,
    background: theme.palette.grey[405],
  },
  bigUpvote: {
    background: theme.palette.primary.dark
  },
  smallUpvote: {
    background: theme.palette.primary.light
  },
  bigDownvote: {
    background: theme.palette.error.dark
  },
  smallDownvote: {
    background: theme.palette.error.light
  },
  readPost: readPostStyle(theme),
  neutral: readPostStyle(theme),
}));

const votePrefix = `You previously gave this post `
const readPostLabel = `You have read this post`

type KarmaInteractionKey = 'bigDownvote' | 'smallDownvote' | 'smallUpvote' | 'bigUpvote'
type InteractionKey = KarmaInteractionKey | 'readPost' | 'neutral'

const isInteractionKey = (value: string | null): value is InteractionKey =>
  value === 'readPost' ||
  value === 'neutral' ||
  value === 'bigDownvote' ||
  value === 'smallDownvote' ||
  value === 'smallUpvote' ||
  value === 'bigUpvote';

export const PostInteractionStripe = ({post}: {
  post: PostsListWithVotes
}) => {
  const classes = useStyles(styles);
  const forumTitle = forumTitleSetting.get();
  const interactionLabels: Record<InteractionKey, React.ReactNode> = useMemo(() => {
    const voteSuffix = <div><em>(This is different from a {forumTitle} Review vote)</em></div>;
    return {
      bigDownvote: <div>{votePrefix}a strong (karma) downvote{voteSuffix}</div>,
      smallDownvote: <div>{votePrefix}a (karma) downvote{voteSuffix}</div>,
      smallUpvote: <div>{votePrefix}a (karma) upvote{voteSuffix}</div>,
      bigUpvote: <div>{votePrefix}a strong (karma) upvote{voteSuffix}</div>,
      readPost: readPostLabel,
      neutral: readPostLabel,
    };
  }, [forumTitle]);
  const interaction = post.currentUserVote || (post.lastVisitedAt ? 'readPost' : null)

  if (!isInteractionKey(interaction)) return null

  return <LWTooltip title={interactionLabels[interaction]} placement="left" inlineBlock={false}>
    <div className={classNames(classes.root, classes[interaction])}/>
  </LWTooltip>
}

export default PostInteractionStripe;



