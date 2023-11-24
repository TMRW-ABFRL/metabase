import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { exchangeCode } from "metabase/auth/actions";
import { Dispatch } from "metabase-types/store";

interface SSORedirectProps {
  triggerCodeExchange: (code: string | null, state: string | null) => void;
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  triggerCodeExchange: (code: string | null, state: string | null) =>
    dispatch(exchangeCode(code, state)),
});

const SSORedirect = ({ triggerCodeExchange }: SSORedirectProps) => {
  const [exchangeTriggered, setExchangeTriggered] = useState(false);

  useEffect(() => {
    if (!exchangeTriggered) {
      // Get the authorization code from the URL
      const urlParams = new URLSearchParams(location.search);
      triggerCodeExchange(urlParams.get("code"), urlParams.get("state"));
      setExchangeTriggered(true);
    }
  }, [exchangeTriggered, triggerCodeExchange]);

  return <div>Redirecting...</div>;
};

export default connect(null, mapDispatchToProps)(SSORedirect);
