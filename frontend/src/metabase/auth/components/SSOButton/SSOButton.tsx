import React, { useCallback, useEffect } from "react";
import { connect } from "react-redux";
import { t } from "ttag";
import AuthButton from "metabase/auth/components/AuthButton";
import { isWithinIframe } from "metabase/lib/dom";
import { loginSSO } from "../../actions";

export interface SSOButtonProps {
  redirectUrl?: string;
  isCard?: boolean;
  isEmbedded?: boolean;
  onLogin: (redirectUrl?: string) => void;
}

const mapStateToProps = () => ({
  isEmbedded: isWithinIframe(),
});

const mapDispatchToProps = {
  onLogin: loginSSO,
};

const SSOButton = ({
  redirectUrl,
  isCard,
  isEmbedded,
  onLogin,
}: SSOButtonProps): JSX.Element => {
  const handleLogin = useCallback(() => {
    onLogin(redirectUrl);
  }, [onLogin, redirectUrl]);

  useEffect(() => {
    isEmbedded && handleLogin();
  }, [isEmbedded, handleLogin]);

  return (
    <AuthButton isCard={isCard} onClick={handleLogin}>
      {t`Sign in with tmrw.in account`}
    </AuthButton>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(SSOButton);
