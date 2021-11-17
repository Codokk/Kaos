let {screen} = require('electron');
// Page Registration
import LoginPage from "../pages/login.js";
// Component Registration
import TopNav from "../components/TopNav.js";

var mainScreen = screen.getPrimaryDisplay();
var dimensions = mainScreen.size;

console.log(dimensions.width + "x" + dimensions.height);
// Outputs i.e : 1280x720

let app = Vue.createApp({
    data() {
        return {
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