import React from 'react';
import classNames from 'classnames';
import type { AnnualReviewMarketInfo } from '@/lib/collections/posts/annualReviewMarkets';
import { postHasAudioPlayer } from './PostsAudioPlayerWrapper';
import AudioToggle from "./AudioToggle";
import PostActionsButton from "../../dropdowns/posts/PostActionsButton";
import { defineStyles } from '@/components/hooks/defineStyles';
import { useStyles } from '@/components/hooks/useStyles';

const styles = defineStyles('LWPostsPageHeaderTopRight', (theme: ThemeType) => ({
  root: {
    display: 'flex',
    flexWrap: "nowrap",
    alignItems: "center",
    columnGap: 8,
    [theme.breakpoints.down('sm')]: {
      top: 8,
      right: 8
    },
    
    // Ensure this is above the side-items column, which extends to the top of
    // the page.
    zIndex: 100,
  },
  postActionsButton: {
    display: 'flex',
    alignItems: 'center',
    opacity: 0.3
  },
  postActionsButtonShortform: {
    marginTop: 12,
    marginRight: 8
  },
  tagList: {
    marginTop: 12,
    marginBottom: 12,
    opacity: 0.5,
    [theme.breakpoints.down('xs')]: {
      display: 'none'
    }
  },
  audioToggle: {
    opacity: 0.55,
    display: 'flex',
    "@media print": {
      display: "none",
    },
  },
  darkerOpacity: {
    opacity: 0.7
  }
}));

export const LWPostsPageHeaderTopRight = ({post, toggleEmbeddedPlayer, showEmbeddedPlayer, higherContrast, annualReviewMarketInfo}: {
  post: PostsWithNavigation|PostsWithNavigationAndRevision|PostsListWithVotes,
  toggleEmbeddedPlayer?: () => void,
  showEmbeddedPlayer?: boolean,
  higherContrast?: boolean,
  annualReviewMarketInfo?: AnnualReviewMarketInfo
}) => {
  const classes = useStyles(styles);

  return <div className={classes.root}>
      {!post.shortform && postHasAudioPlayer(post) && <div className={classNames(classes.audioToggle, higherContrast && classes.darkerOpacity)}>
        <AudioToggle post={post} toggleEmbeddedPlayer={toggleEmbeddedPlayer} showEmbeddedPlayer={showEmbeddedPlayer} />
      </div>}
      <PostActionsButton post={post} className={classNames(classes.postActionsButton, post.shortform && classes.postActionsButtonShortform)} flip />
  </div>;
}

export default LWPostsPageHeaderTopRight;


