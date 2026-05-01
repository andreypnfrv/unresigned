import React from 'react';
import { isAF, forumTitleSetting } from '../../lib/instanceSettings';
import { combineUrls, getSiteUrl } from '@/lib/vulcan-lib/utils';
import { Link } from "../../lib/reactRouterWrapper";
import { useCurrentUser } from "../common/withUser";
import { defineStyles } from '@/components/hooks/defineStyles';
import { useStyles } from '@/components/hooks/useStyles';

const styles = defineStyles("AlignmentPendingApprovalMessage", (theme: ThemeType) => ({
  root: {
    ...theme.typography.contentNotice,
    ...theme.typography.postStyle
  },
}))

const AlignmentPendingApprovalMessage = ({post}: {
  post: PostsBase,
}) => {
  const classes = useStyles(styles);
  const currentUser = useCurrentUser()
  if (!currentUser) return null
  
  const userSubmittedPost = !!post.suggestForAlignmentUserIds && post.suggestForAlignmentUserIds.includes(currentUser._id)
  
  if (!post.af && userSubmittedPost && isAF()) {
    const viewPostHref = combineUrls(getSiteUrl(), `posts/${post._id}/${post.slug}`);
    return (
      <div className={classes.root}>
        <p>
          This post is pending approval to the Alignment Forum and is currently only visible to you.
          However, it is already visible (and commentable) to everyone on {forumTitleSetting.get()}.
          {' '}
          <a href={viewPostHref}>View your post on {forumTitleSetting.get()}</a>.
        </p>
        <p>
          For more info about Alignment Forum membership and posting policies, see <Link to={'/faq'}>the FAQ</Link>.
        </p>
      </div>
    );
  } else {
    return null
  }
}

export default AlignmentPendingApprovalMessage;


