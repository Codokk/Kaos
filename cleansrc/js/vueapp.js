const Vue = require('vue');
const VueRouter = require('vue-router');

// 1. Define route components.
// These can be imported from other files
import Navbar from '../html/pages/NavBar.vue'
const Home = { template: '<div>Home</div>' }
const About = { template: '<div>About</div>' }

// 2. Define some routes
// Each route should map to a component.
// We'll talk about nested routes later.
const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
]

// 3. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
const router = VueRouter.createRouter({
  // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
  history: VueRouter.createWebHashHistory(),
  routes, // short for `routes: routes`
})

// 5. Create and mount the root instance.
let app = Vue.createApp({
    data() {
        return {
            title: 'Kaos',
            user: {},
            events: {}
        }
    }
})
.component('NavBar', Navbar)
.use(router)
.mount('#app');