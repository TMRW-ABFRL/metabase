import React from "react";
import { t } from "ttag";
import AuthButton from "../AuthButton";

export interface PasswordButtonProps {
  isLdapEnabled: boolean;
  redirectUrl?: string;
}

const PasswordButton = ({
  isLdapEnabled,
  redirectUrl,
}: PasswordButtonProps) => {
  const link = redirectUrl
    ? `/auth/login_new/password?redirect=${encodeURIComponent(redirectUrl)}`
    : `/auth/login_new/password`;

  return (
    <AuthButton link={link}>
      {isLdapEnabled
        ? t`Sign in with username or email`
        : t`Sign in with email`}
    </AuthButton>
  );
};

export default PasswordButton;
