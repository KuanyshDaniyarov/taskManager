export default {
  mode: 'history',
  base: process.env.NODE_ENV === 'production'
  ? '/task-manager/' 
  : '/',
  routes: [
    {
      path: '/:type/all',
      component: () => import(/* webpackChunkName: "home" */ './views/Home.vue'),
      children: [
        {
          path: '/:type/manage', 
          component: () => import(/* webpackChunkName: "manage" */ './views/Manage.vue')
        },
      ]
    },
    {
      path: '/:type/archive',
      component: () => import(/* webpackChunkName: "archive" */ './views/Archive.vue')
    },
    {
      path: '/:type/:board', 
      component: () => import(/* webpackChunkName: "board" */ './views/Board.vue')
    },
    {
      path: '/:type/:board/:card',
      component: () => import(/* webpackChunkName: "card" */ './views/Card.vue'),
    },
    // {
    //   path: '/test',
    //   component: () => import(/* webpackChunkName: "test" */ './views/Test.vue'),
    // }
  ]
}
