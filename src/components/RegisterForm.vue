<template>
  <form class="login-form" @submit.prevent="handleRegister()">
    <ModalInput :inputProp="inputData[0]" />
    <ModalInput :inputProp="inputData[1]" />
    <ModalInput :inputProp="inputData[2]" />
    <p class="login-form__message" v-if="errorMessage">
      {{ errorMessage }}
    </p>
    <button class="login-form__button">Zarejestruj</button>
  </form>
</template>

<script>
import { ref } from 'vue';
import { supabase } from '../supabase/init';
import ModalInput from '../components/ModalInput.vue';
export default {
  components: { ModalInput },
  props:{
    changeTemplate:Function
  },
  setup(props) {
    const email = ref('');
    const password = ref('');
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
        value: '',
      },
      {
        id: 'brandInputPassword',
        title: 'Hasło',
        placeholder: 'Wprowadź hasło',
        validation: {
          text: 'Hasło jest za słabe, wymagane: min. 1 mała litera, 1 duża litera, 1 znak specjalny, 1 cyfra ',
          isValid: true,
          launched: false,
          options: {
            minLength: 6,
            maxLength: Infinity,
          },
          regex: /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/,
        },
        type: 'password',
        isRequired: true,
        value: '',
      },
      {
        id: 'brandInputPasswordConfirm',
        title: 'Potwierdź hasło',
        placeholder: 'Wprowadź hasło',
        validation: {
          text: 'Minimalna dłgość to 6 znaków',
          isValid: true,
          launched: false,
          options: {
            minLength: 6,
            maxLength: Infinity,
          },
          regex: /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/,
        },
        type: 'password',
        isRequired: true,
        value: '',
      },
    ];
    let errorMessage = ref(null);
    const handleRegister = async () => {
      if (
        inputData[0].validation.isValid &&
        inputData[1].validation.isValid &&
        checkIfPasswordIsTheSame()
      ) {
        try {
          const { error } = await supabase.auth.signUp({
            email: inputData[0].value,
            password: inputData[1].value,
          });
          if (error) throw error;
          props.changeTemplate()
        } catch (error) {
          errorMessage.value = 'Błąd spróbuj ponownie.';
          console.log(error);
        }
      }
    };
    const checkIfPasswordIsTheSame = () => {
      errorMessage.value =
        inputData[1].value !== inputData[2].value
          ? 'Podane hasła nie są takie same'
          : null;
      return inputData[1].value === inputData[2].value;
    };
    return { email, password, handleRegister, inputData, errorMessage };
  },
};
</script>
<style scoped>

.modal-form-group{
  padding: 0;
}
</style>
