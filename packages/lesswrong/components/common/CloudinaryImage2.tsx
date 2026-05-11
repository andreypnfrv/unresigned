import React, { CSSProperties } from 'react';
import { CloudinaryPropsType, makeCloudinaryImageUrl } from './cloudinaryHelpers';
import { useAbstractThemeOptions } from '../themes/useTheme';

const DEFAULT_HEADER_HEIGHT = 300;

const CLOUDINARY_AUTO = {
  dpr: 'auto',
  q: 'auto',
  f: 'auto',
} as const;

/** Single binding for Cloudinary URL helper (avoids stale HMR refs to removed aliases). */
const mkUrl = makeCloudinaryImageUrl;

const CloudinaryImage2 = ({
  width,
  height,
  objectFit,
  darkPublicId,
  publicId,
  imgProps,
  fullWidthHeader,
  preserveUploadedAspectRatio,
  className,
  wrapperClassName,
  loading,
}: {
  width?: number|string,
  height?: number,
  objectFit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down',
  publicId: string,
  darkPublicId?: string|null,
  imgProps?: CloudinaryPropsType,
  fullWidthHeader?: boolean,
  /**
   * Full-width header without forcing a fixed pixel height: scales by width and keeps the
   * upload crop aspect ratio (delivery uses the same URL helper as other Cloudinary images).
   */
  preserveUploadedAspectRatio?: boolean,
  className?: string,
  wrapperClassName?: string,
  loading?: "lazy"|"eager",
}) => {
  const themeOptions = useAbstractThemeOptions()

  const intrinsicHeader = !!(fullWidthHeader && preserveUploadedAspectRatio);

  let cloudinaryProps: CloudinaryPropsType;
  let imageStyle: CSSProperties = {};

  if (intrinsicHeader) {
    cloudinaryProps = {
      c: 'limit',
      w: '1600',
      g: 'center',
      ...CLOUDINARY_AUTO,
      ...imgProps,
    };
    imageStyle = {
      width: '100%',
      height: 'auto',
      ...(objectFit ? { objectFit } : {}),
    };
  } else {
    cloudinaryProps = {
      c: "fill",
      dpr: "auto",
      q: "auto",
      f: "auto",
      g: "auto:faces"
    };
    if (width) {
      cloudinaryProps.w = width.toString()
      imageStyle.width = width
    }
    if (height) {
      cloudinaryProps.h = height.toString()
      imageStyle.height = height+"px";
    }
    if (fullWidthHeader) {
      cloudinaryProps.h = ((height || DEFAULT_HEADER_HEIGHT)*2).toString()
      cloudinaryProps.w = 'iw'
      imageStyle.width="100%"
    }
    if (objectFit) {
      imageStyle.objectFit = objectFit
    }
    cloudinaryProps = {...cloudinaryProps, ...imgProps}
  }

  let shouldUseDarkImage: "yes"|"no"|"maybe" = "yes"
  if (!darkPublicId || themeOptions.name === "default") {
    shouldUseDarkImage = "no"
  } else if (themeOptions.name === "auto") {
    shouldUseDarkImage = "maybe"
  }
  const basicImageUrl = mkUrl(
    shouldUseDarkImage === "yes" ? darkPublicId! : publicId,
    cloudinaryProps
  )
  const darkImageUrl = darkPublicId && mkUrl(darkPublicId, cloudinaryProps)

  let srcSetFunc: ((publicId: string) => string) | null = null
  if (fullWidthHeader) {
    if (intrinsicHeader) {
      srcSetFunc = (imgId) => `
      ${mkUrl(imgId, {...cloudinaryProps, w: '450'})} 450w,
      ${mkUrl(imgId, {...cloudinaryProps, w: '900'})} 900w,
      ${mkUrl(imgId, {...cloudinaryProps, w: '1500'})} 1500w,
      ${mkUrl(imgId, {...cloudinaryProps, w: '2400'})} 2400w,
    `
    } else {
      const srcSetHeight = (cloudinaryProps.h || (DEFAULT_HEADER_HEIGHT*2).toString())
      srcSetFunc = (imgId) => `
      ${mkUrl(imgId, {...cloudinaryProps, ...{w: '450', h: srcSetHeight}})} 450w,
      ${mkUrl(imgId, {...cloudinaryProps, ...{w: '900', h: srcSetHeight}})} 900w,
      ${mkUrl(imgId, {...cloudinaryProps, ...{w: '1500', h: srcSetHeight}})} 1500w,
      ${mkUrl(imgId, {...cloudinaryProps, ...{w: 'iw', h: srcSetHeight}})} 3000w,
    `
    }
  }

  return <picture className={wrapperClassName}>
    {srcSetFunc && (shouldUseDarkImage === 'maybe' ? <source
      srcSet={srcSetFunc(darkPublicId!)}
      media="(min-width: 600px) and (prefers-color-scheme: dark)"
    /> : <source
      srcSet={srcSetFunc(shouldUseDarkImage === "yes" ? darkPublicId! : publicId)}
      media="(min-width: 600px)"
    />)}
    {shouldUseDarkImage === 'maybe' && <source
      srcSet={darkImageUrl!}
      media="(prefers-color-scheme: dark)"
    />}
    <img
      loading={loading}
      src={basicImageUrl}
      style={imageStyle}
      className={className}
    />
  </picture>;
};

export default CloudinaryImage2;

