import React, { useState } from 'react';
import { Card } from "@/components/widgets/Paper";
import { useTagBySlug } from '../tagging/useTag';
import Button  from '@/lib/vendor/@material-ui/core/src/Button'
import { ContentItemBody } from "../contents/ContentItemBody";
import LWDialog from "../common/LWDialog";
import ContentStyles from "../common/ContentStyles";
import { defineStyles } from '../hooks/defineStyles';
import { useStyles } from '../hooks/useStyles';
import { combineUrls, getSiteUrl } from '@/lib/vulcan-lib/utils';
import { forumTitleSetting } from '@/lib/instanceSettings';

const styles = defineStyles("AFNonMemberSuccessPopup", (theme: ThemeType) => ({
  dialog: {
    zIndex: theme.zIndexes.afNonMemberPopup
  },
  popupCard: {
    padding: 30,
    display: "flex",
    flexDirection: "column",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: 16
  },
  goToLWButton: {
    color: theme.palette.secondary.main,
  },
  stayHereButton: {
   color: theme.palette.grey[600]
  }
}));

// Makes its child a link (wrapping it in an <a> tag) which opens a login
// dialog.
const AFNonMemberSuccessPopup = ({_id, postId, onClose}: {
  _id: string,
  postId?: string,
  onClose?: () => void,
}) => {
  const classes = useStyles(styles);
  const [open, setOpen] = useState(true)
  const { tag } = useTagBySlug("af-non-member-submission-success", "TagFragment")
  
  const handleClose = () => {
    setOpen(false)
    if (onClose)
      onClose();
  };
  
  
  const submissionIsComment = !!postId 
  const mainSitePostsBase = combineUrls(getSiteUrl(), 'posts')
  const postOnMainSiteHref = submissionIsComment
    ? `${combineUrls(mainSitePostsBase, postId!)}#${_id}`
    : combineUrls(mainSitePostsBase, _id)

  return (
    <LWDialog
      open={open}
      onClose={handleClose}
      className={classes.dialog}
    >
      <Card className={classes.popupCard}>
        <ContentStyles contentType="comment">
          <ContentItemBody
            dangerouslySetInnerHTML={{__html: tag?.description?.html || ""}}
            description={`tag ${tag?.name}`}
          />
        </ContentStyles>
        <div className={classes.buttonContainer}>
          <Button className={classes.stayHereButton} onClick={() => {
            handleClose()
          }}>
            I'll stay here
          </Button>
          <Button color="primary">
            <a href={postOnMainSiteHref}>
              {`Take me to my ${submissionIsComment ? "comment" : "post"} on ${forumTitleSetting.get()}`}
            </a>
          </Button>
        </div>
      </Card>
    </LWDialog>
  );
}

export default AFNonMemberSuccessPopup;


