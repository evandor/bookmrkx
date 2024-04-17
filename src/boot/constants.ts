import {boot} from 'quasar/wrappers'

const INDEX_DB_VERSION = 22

const CLEANUP_PERIOD_IN_MINUTES = 10 // in prod: 10
const EXPIRE_DATA_PERIOD_IN_MINUTES = 60 // in prod: 60
const MONITORING_PERIOD_IN_MINUTES = 60 // in prod: 60


const SPECIAL_ID_FOR_NO_GROUP_ASSIGNED = "no_group_assigned_identifier"

const STRIP_CHARS_IN_USER_INPUT = /[`@#$%^*=\[\]{};:"\\|<>\/~]/g;
const STRIP_CHARS_IN_COLOR_INPUT = /[`@$%^*=\[\]{};:"\\|<>\/~]/g;

const RELEASE_NOTES_URL = "https://us-central1-tabsets-backend-prd.cloudfunctions.net/app/share/preview/5d2cccf9-83ea-40be-bc84-37b03e38af1d"

// Local storage Identifiers
const TITLE_IDENT = 'title';

const APP_INSTALLATION_ID = 'app.installation.id'


const SUBSCRIPTION_ID_IDENT = 'subscription.id';

const SHARING_AUTHOR_IDENT = 'sharing.author';
const SHARING_AVATAR_IDENT = 'sharing.avatar';

const SYNC_TYPE = "sync.type"

const SYNC_GITHUB_TOKEN = "sync.github.token"

const SYNC_COUCHDB_USERNAME = "sync.couchdb.username"
const SYNC_COUCHDB_PASSWORD = "sync.couchdb.password"
const SYNC_COUCHDB_URL = "sync.couchdb.url"

const EMAIL_LINK_REDIRECT_DOMAIN = "https://tabsets.web.app"

const CURRENT_USER_ID = "current.user.id"
const CURRENT_USER_EMAIL = "current.user.email"

const UI_WINDOWS_ITEMS_PER_PAGE = 'ui.windows.itemsPerPage'

export default boot(({}) => {
})

export {
  INDEX_DB_VERSION,
  CLEANUP_PERIOD_IN_MINUTES, STRIP_CHARS_IN_USER_INPUT, STRIP_CHARS_IN_COLOR_INPUT,
  EXPIRE_DATA_PERIOD_IN_MINUTES, SPECIAL_ID_FOR_NO_GROUP_ASSIGNED,MONITORING_PERIOD_IN_MINUTES,
  RELEASE_NOTES_URL,
  SUBSCRIPTION_ID_IDENT,
  SHARING_AUTHOR_IDENT,
  SHARING_AVATAR_IDENT,
  APP_INSTALLATION_ID,
  SYNC_TYPE,
  SYNC_GITHUB_TOKEN,
  SYNC_COUCHDB_USERNAME,
  SYNC_COUCHDB_PASSWORD,
  SYNC_COUCHDB_URL,
  TITLE_IDENT,
  EMAIL_LINK_REDIRECT_DOMAIN,
  CURRENT_USER_ID,
  CURRENT_USER_EMAIL,
  UI_WINDOWS_ITEMS_PER_PAGE
}

