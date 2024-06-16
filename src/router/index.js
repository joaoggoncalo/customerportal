import { createRouter, createWebHistory } from 'vue-router'
import Account from '../views/Account.vue'
import Login from '../views/Login.vue'
import Tickets from '../views/Tickets.vue'
import Invoices from '../views/Invoices.vue'
import Services from '../views/Services.vue'
import Profile from "../views/Profile.vue"
import TicketDetails from "../views/TicketDetails.vue";
import Dashboard from "../views/Dashboard.vue"
import Unauthorized from "../views/Unauthorized.vue"

const routes = [
  {
    path: '/',
    name: Login,
    component: Login
  },
  {
    path: '/account',
    name: 'account',
    component: Account,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'tickets',
        name: 'tickets',
        component: Tickets,
        meta: { requiresAuth: true }
      },
      {
        path: 'tickets/:id',
        name: 'ticketDetails',
        component: TicketDetails,
        meta: { requiresAuth: true }
      },
      {
        path: 'profile',
        name: 'profile',
        component: Profile,
        meta: { requiresAuth: true }
      },
      {
        path: 'invoices',
        name: 'invoices',
        component: Invoices,
        meta: { requiresAuth: true }
      },
      {
        path: 'services',
        name: 'services',
        component: Services,
        meta: { requiresAuth: true }
      },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: Dashboard,
        meta: { requiresAuth: true }
      }
    ]
  },
  {
    path: '/401',
    name: 'Unauthorized',
    component: Unauthorized
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: routes
})

router.beforeEach((to, from, next) => {
  // check if the route requires authentication and user is not logged in
  if (to.matched.some(record => record.meta.requiresAuth) && !localStorage.getItem('token'))
  {
    // redirect to unauthorized page
    next({ name: 'Unauthorized' })
    // eslint-disable-next-line no-dupe-else-if
  }
  else {
    next()
  }

})

export default router