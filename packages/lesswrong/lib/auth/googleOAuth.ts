import crypto from 'crypto';
import { googleClientIdSetting, googleOAuthSecretSetting } from '@/server/databaseSettings';
import { NextRequest } from 'next/server';
import { getSiteUrlFromReq } from '@/server/utils/getSiteUrl';
import { combineUrls } from '../vulcan-lib/utils';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

export interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  refresh_token?: string;
  id_token?: string;
}

export interface GoogleUserProfile {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  locale?: string;
}

export function generateOAuthState(): string {
  return crypto.randomBytes(32).toString('hex');
}

function googleOAuthFromEnv(): { clientId: string | null; clientSecret: string | null } {
  const clientId =
    process.env.GOOGLE_CLIENT_ID?.trim() ||
    process.env.GOOGLE_OAUTH_CLIENT_ID?.trim() ||
    null;
  const clientSecret =
    process.env.GOOGLE_CLIENT_SECRET?.trim() ||
    process.env.GOOGLE_OAUTH_CLIENT_SECRET?.trim() ||
    null;
  return { clientId, clientSecret };
}

export function getGoogleOAuthCredentials(): { clientId: string | null; clientSecret: string | null } {
  let clientId = googleClientIdSetting.get()?.trim() || null;
  let clientSecret = googleOAuthSecretSetting.get()?.trim() || null;
  if (!clientId || !clientSecret) {
    const env = googleOAuthFromEnv();
    clientId = clientId || env.clientId;
    clientSecret = clientSecret || env.clientSecret;
  }
  return { clientId, clientSecret };
}

export function getGoogleAuthUrl(request: NextRequest, state: string, returnTo?: string): string {
  const siteUrl = getSiteUrlFromReq(request);
  const { clientId } = getGoogleOAuthCredentials();
  if (!clientId) throw new Error('Google OAuth not configured');

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: combineUrls(siteUrl, '/auth/google/callback'),
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    state: state,
    prompt: 'select_account consent',
  });

  if (returnTo) {
    params.set('state', `${state}:${encodeURIComponent(returnTo)}`);
  }

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCodeForTokens(request: NextRequest, code: string): Promise<GoogleTokenResponse> {
  const siteUrl = getSiteUrlFromReq(request);
  const { clientId, clientSecret } = getGoogleOAuthCredentials();

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials not configured');
  }

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: combineUrls(siteUrl, '/auth/google/callback'),
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to exchange code: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchGoogleUserProfile(accessToken: string): Promise<GoogleUserProfile> {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user profile: ${response.statusText}`);
  }

  return response.json();
}
