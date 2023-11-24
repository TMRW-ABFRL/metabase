import Settings from "metabase/lib/settings";

export const getSSOUrl = (redirectUrl?: string): string => {
  const siteUrl = Settings.get("site-url");
  const state = encodeURIComponent(JSON.stringify({ origin: redirectUrl }));
  const azureRedirectTo = `${siteUrl}/auth/sso-redirect`;

  return `https://tmrw-admin-portal.auth.ap-south-1.amazoncognito.com/oauth2/authorize?state=${state}&identity_provider=TMRWAzureADProvider&response_type=CODE&client_id=4gaqcna1h240bsd8kfs62861fn&redirect_uri=${azureRedirectTo}&scope=aws.cognito.signin.user.admin email openid profile`;
};
