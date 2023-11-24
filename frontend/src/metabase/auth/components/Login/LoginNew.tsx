import React from "react";
import { connect } from "react-redux";
import { t } from "ttag";
import AuthLayout from "../../containers/AuthLayout";
import { AuthProvider } from "../../types";
import { getAuthProviders } from "../../selectors";
import AuthButton from "../AuthButton";
import SSOButton from "../SSOButton";
import {
  ActionList,
  ActionListItem,
  LoginPanel,
  LoginTitle,
} from "./Login.styled";

const mapStateToProps = (state: any, props: any) => ({
  providers: getAuthProviders(state),
  providerName: props.params.provider,
  redirectUrl: props.location.query.redirect,
});

export interface LoginProps {
  providers: AuthProvider[];
  providerName?: string;
  redirectUrl?: string;
}

const LoginNew = ({
  providers,
  providerName,
  redirectUrl,
}: LoginProps): JSX.Element => {
  if (!providerName) {
    return (
      <AuthLayout>
        <SSOButton isCard redirectUrl={redirectUrl} />
        <AuthButton isCard link={"/auth/login_new/password"}>
          Sign in with external email and password
        </AuthButton>
      </AuthLayout>
    );
  }
  const selection = getSelectedProvider(providers, providerName);

  return (
    <AuthLayout>
      <LoginTitle>{t`Sign in to Metabase`}</LoginTitle>
      {selection && selection.Panel && (
        <LoginPanel>
          <selection.Panel redirectUrl={redirectUrl} />
        </LoginPanel>
      )}
      {!selection && (
        <ActionList>
          {providers.map(provider => (
            <ActionListItem key={provider.name}>
              <provider.Button isCard={true} redirectUrl={redirectUrl} />
            </ActionListItem>
          ))}
        </ActionList>
      )}
    </AuthLayout>
  );
};

const getSelectedProvider = (
  providers: AuthProvider[],
  providerName?: string,
): AuthProvider | undefined => {
  const provider =
    providers.length > 1
      ? providers.find(p => p.name === providerName)
      : providers[0];

  return provider?.Panel ? provider : undefined;
};

export default connect(mapStateToProps)(LoginNew);
