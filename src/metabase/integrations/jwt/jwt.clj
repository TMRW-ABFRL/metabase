(ns metabase.integrations.jwt.jwt
  "Implementation of the JWT backend for sso"
  (:require 
   [cheshire.core :as json]
   [clj-http.client :as http]
   [clojure.data :as data]
   [clojure.string :as str] 
   [java-time :as t]
   [metabase.api.session :as api.session]
   [metabase.integrations.jwt.sso-settings :as sso-settings]
   [metabase.integrations.jwt.sso-utils :as sso-utils]
   [metabase.models.permissions-group :as perms-group :refer [PermissionsGroup]]
   [metabase.models.permissions-group-membership
    :as perms-group-membership
    :refer [PermissionsGroupMembership]]
   [metabase.server.middleware.session :as mw.session]
   [metabase.server.request.util :as request.u]
   [metabase.util :as u]
   [metabase.util.i18n :refer [trs]]
   [metabase.util.log :as log]
   [ring.util.response :as response]
   [toucan.db :as db]
   [toucan2.core :as t2])
  (:import
   (java.util Base64)))

(set! *warn-on-reflection* true)

(defn fetch-or-create-user!
  "Returns a session map for the given `email`. Will create the user if needed."
  [first-name last-name email user-attributes]
  ;; (when-not (sso-settings/jwt-enabled)
  ;;   (throw (IllegalArgumentException. (str (tru "Can't create new JWT user when JWT is not configured")))))
  (let [user {:first_name       first-name
              :last_name        last-name
              :email            email
              :sso_source       "jwt"
              :login_attributes user-attributes}]
    (or (sso-utils/fetch-and-update-login-attributes! user)
        (sso-utils/create-new-sso-user! user))))

(defn- jwt-data->login-attributes [jwt-data]
  (dissoc jwt-data
          "email"
          "given_name"
          "family_name"
          "iat"
          :max_age))

(defn- groups-exist
  [group-ids]
  (let [group-ids-set (set group-ids)
        existing-groups-set (t2/select-fn-set :id PermissionsGroup
                                          {:where
                                           [:in :id group-ids-set]})]
    (= (count group-ids-set) (count existing-groups-set))))

(defn- sync-groups-db
  [user group-ids]
  (let [user-id (u/the-id user) 
        excluded-group-ids #{(u/the-id (perms-group/all-users))} 
        existing-user-groups-set (t2/select-fn-set :group_id PermissionsGroupMembership {:where [:= :user_id user-id]}) 
        updated-user-groups-set (set group-ids) 
        [to-remove to-add] (data/diff existing-user-groups-set updated-user-groups-set)]
       (when (seq to-remove)
         (log/debugf "Removing user %s from group(s) %s" user-id to-remove)
         (try
           (db/delete! PermissionsGroupMembership :group_id [:in to-remove], :user_id user-id)
           (catch clojure.lang.ExceptionInfo e
             ;; in case sync attempts to delete the last admin, the pre-delete hooks of
             ;; [[metabase.models.permissions-group-membership/PermissionsGroupMembership]] will throw an exception.
             ;; but we don't want to block user from logging-in, so catch this exception and log a warning
             (if (= (ex-message e) (str perms-group-membership/fail-to-remove-last-admin-msg))
               (log/warn "Attempted to remove the last admin during group sync!"
                         "Check your SSO group mappings and make sure the Administrators group is mapped correctly.")
               (throw e))))) 
       (doseq [id    to-add
               :when (not (excluded-group-ids id))]
         (log/debugf "Adding user %s to group %s" user-id id)
         ;; if adding membership fails for one reason or another (i.e. if the group doesn't exist) log the error add the
         ;; user to the other groups rather than failing entirely
         (try
           (db/insert! PermissionsGroupMembership :group_id id, :user_id user-id)
           (catch Throwable e
             (log/error e (trs "Error adding User {0} to Group {1}" user-id id)))))))

(defn- sync-groups!
  "Sync a user's groups based on mappings configured in the JWT settings"
  [user group-ids]
  (when group-ids
    (if (groups-exist group-ids)
      (sync-groups-db user group-ids)
      (throw (Throwable. "One or more groups associated with the user do not exist")))))

(defn- base64-decode [encoded-str]
  (let [decoded-bytes (.decode (Base64/getDecoder) encoded-str)]
    (String. decoded-bytes "UTF-8")))

(defn- login-jwt-user
  [jwt groups {{redirect :return_to} :body, :as request}]
  (let [redirect-url (or redirect "/")]
    (sso-utils/check-sso-redirect redirect-url)
    (let [jwt-data     (try 
                         (-> jwt
                            (str/split #"\.") 
                            (nth 1)
                            (base64-decode)
                            (json/parse-string))
                         (catch Throwable e
                           (throw (ex-info (ex-message e)
                                           (assoc (ex-data e) :status-code 401)
                                           e))))
          login-attrs  (jwt-data->login-attributes jwt-data)
          email        (get jwt-data "email")
          first-name   (get jwt-data "given_name")
          last-name    (get jwt-data "family_name")
          user         (fetch-or-create-user! first-name last-name email login-attrs)
          session      (api.session/create-session! :sso user (request.u/device-info request))] 
      (sync-groups! user groups)
      (mw.session/set-session-cookies request (response/redirect redirect-url) session (t/zoned-date-time (t/zone-id "GMT"))))))    

(defn- exchange-code-for-jwt
  [code cognito_redirect]
  (try
    (let [data_api (str (sso-settings/data-api-base-url) (sso-settings/data-api-exchange-code-endpoint))
          params {:form-params {"code" code "redirect_url" cognito_redirect} :content-type :json}
          response (http/post data_api params)
          {:keys [body]} response
          json_body (json/parse-string body)
          id_token (get json_body "id_token")
          user_groups (get json_body "metabase_groups")]
      {:jwt id_token :user_groups user_groups})
    (catch Throwable e
      (log/error #_e (trs "Error exchanging code"))
      (throw e))))

(defn sso-get
  [{{:keys [code cognito_redirect return_to]} :body, :as request}]
  (let [{:keys [jwt user_groups]} (exchange-code-for-jwt code cognito_redirect)]
    (if jwt
      (login-jwt-user jwt user_groups request)
      (let [idp (sso-settings/jwt-identity-provider-uri)
            return-to-param (if (str/includes? idp "?") "&return_to=" "?return_to=")]
        (response/redirect (str idp (when return_to
                                      (str return-to-param return_to))))))))
      

(defn sso-post
  [_]
  (throw (ex-info "POST not valid for JWT SSO requests" {:status-code 400})))
