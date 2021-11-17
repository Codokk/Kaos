export default {
    template: `
    <div id="Login-Wrapper" class="flex-col">
    <div class="fadeIn first">
        <img src="../assets/clash.png" id="icon" alt="App Icon" />
    </div>

    <!-- Login Form -->
    <div id="errorBar"></div>
    <form class="flex-col" id='login-form'>
        <input v-model="formUsername" type="text" id="username" class="fadeIn second" name="username" placeholder="login" autofocus>
        <input v-model="formPassword" type="password" id="password" class="fadeIn third" name="password" placeholder="password">
        <input type="submit" id="loginbutton" class="fadeIn fourth" value="Log In">
        <a style='display: block; margin-top: -30px; margin-bottom: 40px;' href="#" @click="swapForm('signup')">Or Sign Up</a>
    </form>
    <form class='hidden flex-col' id='signup-form'>
        <input v-model="formUsername" type="text" id="signup-username" class="fadeIn second" name="username" placeholder="username" autofocus>
        <input v-model="formEmail" type="text" id="signup-email" class="fadeIn second" name="email" placeholder="email" autofocus>
        <input v-model="formPassword" type="password" id="signup-password" class="fadeIn third" name="password" placeholder="password">
        <input type="submit" id="signupbutton" class="fadeIn fourth" value="Sign Up">
        <a style='display: block; margin-top: -30px; margin-bottom: 40px;' href="#" @click="swapForm('login')">Or Login</a>
    </form>

    <!-- Remind Passowrd -->
    <div id="formFooter">
        <a class="underlineHover" href="#" id="forgotpassword">Forgot Password?</a>
    </div>
    </div>`,
    data() {
        return {
            formUsername: "",
            formPassword: "",
            formEmail: "",
            formDisplayName: "",
        }
    },
    modules: {
        swapForm(form) {
            document.querySelectorAll("form").classList.add('hidden');
            document.querySelector("#"+ form).classList.remove('hidden');
        }
    }
}
