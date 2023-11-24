(ns metabase.integrations.jwt.sso-settings
  "Namesapce for defining settings used by the SSO backends. This is separate as both the functions needed to support
  the SSO backends and the generic routing code used to determine which SSO backend to use need this
  information. Separating out this information creates a better dependency graph and avoids circular dependencies."
  (:require
   [metabase.models.setting :as setting :refer [defsetting]]
   [metabase.util.i18n :refer [deferred-tru]]
   [metabase.util.schema :as su]
   [schema.core :as s]))

(set! *warn-on-reflection* true)

(def ^:private GroupMappings
  (s/maybe {su/KeywordOrString [su/IntGreaterThanZero]}))

(def ^:private ^{:arglists '([group-mappings])} validate-group-mappings
  (s/validator GroupMappings))

(defsetting jwt-identity-provider-uri
  (deferred-tru "URL of JWT based login page"))

(defsetting send-new-sso-user-admin-email?
  (deferred-tru "Should new email notifications be sent to admins, for all new SSO users?")
  :type :boolean
  :default true)

(defsetting data-api-base-url
  (deferred-tru "Base URL for data api requests")
  :default "http://localhost:8000/api")


(defsetting data-api-exchange-code-endpoint
  (deferred-tru "Data API endpoint to exchange auth code for jwt token")
  :default "/auth/exchange-code")


(defsetting data-api-brands-endpoint
  (deferred-tru "Data API endpoint to get brands associated with a user")
  :default "/auth/brands")

