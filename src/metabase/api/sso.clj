(ns metabase.api.sso
  "`/auth/sso` Routes.

  Implements the SSO routes needed for SAML and JWT. This namespace primarily provides hooks for those two backends so
  we can have a uniform interface both via the API and code"
  (:require 
   [compojure.core :refer [GET POST]]
   [metabase.api.common :as api]
   [metabase.integrations.jwt.jwt :as jwt]
   [metabase.util.i18n :refer [trs]]
   [metabase.util.log :as log]))

(set! *warn-on-reflection* true)

#_{:clj-kondo/ignore [:deprecated-var]}
(api/defendpoint-schema POST "/exchange_code"
  "SSO entry-point for an SSO user that has not logged in yet"
  [:as req]
  (try
    (jwt/sso-code-exchange req)
    (catch Throwable e
      (log/error #_e (trs "Error returning SSO entry point"))
      (throw e))))

(api/define-routes)