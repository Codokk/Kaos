// Page Registration
import LoginPage from "../pages/login.js";
// Component Registration
import TopNav from "../components/TopNav.js";

let app = Vue.createApp({
    data() {
        return {
            message: "IT'S ALIVE",
            loggedin: false,
            user: {
                displayname: "LOL"
            },
        }
    },
    methods: {

    }
});

// Build Page Router
const routes = [
  {
    path: "/",
    name: "Login",
    component: LoginPage
  },
  {
    path: '/:pathMatch(.*)*',
    name: "Login",
    component: LoginPage
  }
]
const router = VueRouter.createRouter({
  history: VueRouter.createWebHistory(),
  routes,
})
app.use(router);
// Add Components
app.component("top-nav", TopNav)
app.component('button-counter', {
    data() {
      return {
        count: 0
      }
    },
    template: `
      <button @click="count++">
        You clicked me {{ count }} times.
      </button>`
  })

// Mount it
app.mount("#app");