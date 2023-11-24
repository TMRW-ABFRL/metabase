export const login = (redirectUrl?: string) => {
  return redirectUrl
    ? `/auth/login_new?redirect=${encodeURIComponent(redirectUrl)}`
    : "/auth/login_new";
};
