(ns metabase.api.sso
  "`/auth/sso` Routes.

  Implements the SSO routes needed for SAML and JWT. This namespace primarily provides hooks for those two backends so
  we can have a uniform interface both via the API and code"
  (:require 
   [compojure.core :refer [GET POST]]
   [metabase.api.common :as api]
   [metabase.integrations.jwt.jwt :as jwt]
   [metabase.util :as u]
   [metabase.util.i18n :refer [trs]]
   [metabase.util.log :as log]
   [stencil.core :as stencil]))

(set! *warn-on-reflection* true)

#_{:clj-kondo/ignore [:deprecated-var]}
(api/defendpoint-schema POST "/exchange_code"
  "SSO entry-point for an SSO user that has not logged in yet"
  [:as req]
  (try
    (jwt/sso-get req)
    (catch Throwable e
      (log/error #_e (trs "Error returning SSO entry point"))
      (throw e))))

(defn- sso-error-page [^Throwable e]
  {:status  (get (ex-data e) :status-code 500)
   :headers {"Content-Type" "text/html"}
   :body    (stencil/render-file "metabase_enterprise/sandbox/api/error_page"
              (let [message    (.getMessage e)
                    data       (u/pprint-to-str (ex-data e))]
                {:errorMessage   message
                 :exceptionClass (.getName Exception)
                 :additionalData data}))})

#_{:clj-kondo/ignore [:deprecated-var]}
(api/defendpoint-schema POST "/"
  "Route the SSO backends call with successful login details"
  [:as req]
  (try
    (jwt/sso-post req)
    (catch Throwable e
      (log/error e (trs "Error logging in"))
      (sso-error-page e))))

(api/define-routes)