import {RouteRecordRaw} from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/sidepanel/bookmarks'
  },
  {
    path: '/refresh/:redirect',
    component: () => import('layouts/SidePanelLayout.vue'),
    children: [{path: '', component: () => import('pages/RefreshPage.vue')}],
  },
  {
    path: '/start',
    component: () => import('layouts/PlainLayout.vue'),
    children: [{path: '', component: () => import('pages/StartPage.vue')}],
  },
  {
    path: '/sidepanel',
    component: () => import('layouts/SidePanelLayout.vue'),
    children: [{path: '', component: () => import('pages/SidePanelPage.vue')}],
  },
  {
    path: '/sidepanel/welcome',
    component: () => import('layouts/SidePanelLayout.vue'),
    children: [{path: '', component: () => import('pages/sidepanel/WelcomePage.vue')}],
  },
  {
    path: '/sidepanel/search',
    component: () => import('layouts/SidePanelLayout.vue'),
    children: [{path: '', component: () => import('pages/SidePanelSearchPage.vue')}],
  },

  {
    path: '/sidepanel/bookmarks',
    component: () => import('layouts/SidePanelLayout.vue'),
    children: [{path: '', component: () => import('pages/sidepanel/SidePanelBookmarksPage.vue')}],
  },
  {
    path: '/sidepanel/messages',
    component: () => import('layouts/SidePanelLayout.vue'),
    children: [{path: '', component: () => import('pages/sidepanel/SidePanelMessagesPage.vue')}],
  },

  {
    path: '/mainpanel/settings',
    component: () => import('layouts/PlainWithRightDrawerLayout.vue'),
    children: [{path: '', component: () => import('pages/SettingsPage.vue')}],
  },
  {
    path: '/mainpanel/features/:feature',
    component: () => import('layouts/PlainWithRightDrawerLayout.vue'),
    children: [{path: '', component: () => import('pages/FeaturesPage.vue')}],
  },


  {
    path: '/mainpanel/bookmarks/:id',
    component: () => import('layouts/PlainLayout.vue'),
    children: [{path: '', component: () => import('pages/mainpanel/MainPanelBookmarksPage.vue')}],
  },

  {
    path: '/settings',
    component: () => import('layouts/DefaultLayout.vue'),
    children: [{path: '', component: () => import('pages/SettingsPage.vue')}],
  },

  {
    path: '/bookmarks/:id',
    component: () => import('layouts/FullPageLayout.vue'),
    children: [{path: '', component: () => import('pages/BookmarksPage.vue')}],
  },

  {
    path: '/features/:feature',
    component: () => import('layouts/FullPageLayout.vue'),
    children: [{path: '', component: () => import('pages/FeaturesPage.vue')}],
  },
  {
    path: '/search',
    component: () => import('layouts/FullPageLayout.vue'),
    children: [{path: '', component: () => import('pages/SearchPage.vue')}],
  },
  {
    path: '/searchresult',
    component: () => import('layouts/FullPageLayout.vue'),
    children: [{path: '', component: () => import('pages/SearchResultPage.vue')}],
  },

  {
    path: '/help/:ident',
    component: () => import('layouts/DefaultLayout.vue'),
    children: [{path: '', component: () => import('pages/HelpPage.vue')}],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
