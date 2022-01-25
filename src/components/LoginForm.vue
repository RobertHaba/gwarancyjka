<template>
  <form class="login-form" @submit.prevent="handleRegister()">
    <ModalInput :inputProp="inputData[0]" />
    <ModalInput :inputProp="inputData[1]" />
    <p class="login-form__message" v-if="errorMessage">
      {{ errorMessage }}
    </p>
    <button class="login-form__button">Zaloguj</button>
  </form>
</template>

<script>
import { ref } from 'vue';
import { supabase } from '../supabase/init';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import ModalInput from './ModalInput.vue';
export default {
  components: { ModalInput },
  setup() {
    const email = ref('robertfrontend@gmail.com');
    const password = ref('Maslo12');
    const router = useRouter();
    const store = useStore();
    const inputData = [
      {
        id: 'brandInputEmail',
        title: 'Email',
        placeholder: 'Wprowadź adres email',
        validation: {
          text: 'Wprowadź poprawny adres np klient@poczta.pl',
          isValid: true,
          launched: false,
          options: {
            minLength: 1,
            maxLength: Infinity,
          },
          regex: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, // eslint-disable-line
        },
        type: 'email',
        isRequired: true,
        value: 'kqx48260@boofx.com',
      },
      {
        id: 'brandInputPassword',
        title: 'Hasło',
        placeholder: 'Wprowadź hasło',
        validation: {
          text: 'Wprowadź poprawne hasło',
          isValid: true,
          launched: false,
          options: {
            minLength: 6,
            maxLength: Infinity,
          },
          regex: /^.{6,}$/,
        },
        type: 'password',
        isRequired: true,
        value: 'Test12@',
      },
    ];
    let errorMessage = ref(null);
    const handleRegister = async () => {
      if (inputData[0].value && inputData[1].value) {
        try {
          const { error } = await supabase.auth.signIn({
            email: inputData[0].value,
            password: inputData[1].value,
          });
          if (error) throw error;
          store.commit('setUserAuth', supabase.auth.user());
          router.push({ name: 'WarrantyApp' });
        } catch (error) {
          errorMessage.value = (error.message === 'Email not confirmed')?'Potwierdź swoje konto' : 'Dane logowania są niepoprawne'
          console.log(error);
        }
      }
    };
    return { email, password, handleRegister, inputData, errorMessage };
  },
};
</script>
<style scoped>
.modal-form-group {
  padding: 0;
}
</style>
