let {screen} = require('electron');
require('dotenv').config();
// Page Registration
import LoginPage from "../pages/login.js";
import Dashboard from "../pages/dashboard.js";
// Component Registration
import TopNav from "../components/TopNav.js";

// var mainScreen = screen.getPrimaryDisplay();
// var dimensions = mainScreen.size;

// console.log(dimensions.width + "x" + dimensions.height);
// Outputs i.e : 1280x720
console.log(Vue);
// Vue.prototype.$test = function(){console.log('test')}

let app = Vue.createApp({
    data() {
        return {
            loggedin: false,
            user: {
                displayname: "LOL"
            },
        }
    }
});
app.config.globalProperties.$APICall = async function(url, method, data = false) {
  let params = { method: method }
  if(data) params.body = JSON.stringify(data)
  let a = await fetch(process.env.api + url, params)
  a = await a.json().then(e=> {return e})
  console.log(a);
  return a;
};
// Build Page Router
const routes = [
  {
    path: "/dashboard",
    name: "Dashboard",
    component: Dashboard
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
    props: [
      'APICall()'
    ],
    template: `
      <button @click="APICall()">
        You clicked me {{ count }} times.
      </button>`
  })

// Mount it
app.mount("#app");