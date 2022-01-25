<template>
  <section class="login-container">
    <div class="login-nav">
      <span class="icon icon--bigger icon--business-deal"> </span>
    </div>
    <div class="login-wrapper">
      <header class="login-header">
        <span class="icon icon--big icon--logo-app"></span>
        <h1 class="login-heade__title">Gwarancyjka</h1>
      </header>
      <LoginForm v-if="loginFormTemplate"/>
      <RegisterForm v-else-if="!loginFormTemplate" :changeTemplate="changeFormTemplate"/>
      <p class="login-text-space">{{formTextInfo}}</p>
      <button type="button" class="login-form__button login-form__button--link" @click="loginFormTemplate = !loginFormTemplate">
        {{formButtonText}}
      </button>
    </div>
  </section>
</template>

<script>
import LoginForm from '../components/LoginForm.vue';
import RegisterForm from '../components/RegisterForm.vue';
export default {
  components: { LoginForm, RegisterForm },
  data(){
    return{
      loginFormTemplate:true
    }
  },
  computed:{
    formButtonText(){
      return (this.loginFormTemplate)?'Zarejestruj się': 'Zaloguj się'
    },
    formTextInfo(){
      return (this.loginFormTemplate)?'Nie masz konta?': 'Posiadasz konto?'
    }
  },
  methods:{
    changeFormTemplate(){
      this.loginFormTemplate = true
    }
  }
};
</script>

<style scoped>
.icon--big {
  width: 60px;
  height: 60px;
}
.icon--bigger {
  height: 90%;
  width: 90%;
  max-width: 400px;
  max-height: 400px;
}
.login-container {
  display: grid;
  grid-template-columns: 3fr 5fr;
  width: 100%;
  height: 100vh;
}
.login-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  background: linear-gradient(162.02deg, #b291e0 -8.78%, #7651aa 114.27%);
}
.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: var(--body-main);
}
.login-header {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
}
.login-heade__title {
  text-transform: uppercase;
}
.login-heade__title::first-letter {
  color: var(--light-purple);
}
.login-form__message {
  color: #fff;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}
.login-text-space {
  margin-top: 1rem;
}
@media screen and (max-width: 740px) {
  .login-container {
    grid-template-columns: 1fr;
    grid-template-rows: 2fr 6fr;
  }
  .login-wrapper {
    box-shadow: var(--smallShadowReverse);
  }
}
</style>

