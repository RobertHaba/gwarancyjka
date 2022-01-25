<template>
  <section class="first-login-container">
    <header class="first-login-header">
      <h2 class="first-login-header__title">Ustawienia konta</h2>
    </header>
    <form class="first-login-form-body" @submit.prevent="setDataHandler">
      <ModalInput
        v-for="inputData in inputsData"
        :key="inputData.id"
        :inputProp="inputData"
        :brandProps="brandData"
      />
      <div class="first-login-footer">
        <div class="first-login-footer-wrapper">
          <button class="modal-button modal-button--bg-color" type="submit">
            <span class="icon icon--save"></span>Zapisz
          </button>
        </div>
      </div>
    </form>
  </section>
</template>

<script>
import ModalInput from '../components/ModalInput.vue';
import { supabase } from '../supabase/init';
import cardTemplates from '../assets/cardDeafultTemplate.json';
export default {
  components: {
    ModalInput,
  },
  data() {
    return {
      brandData: null,
      inputsData: [
        {
          id: 'brandInputName',
          title: 'Nazwa firmy',
          placeholder: 'Wprowadź nazwę firmy',
          validation: {
            text: 'To pole wymaga min. 2 znaków',
            isValid: false,
            launched: false,
            options: {
              minLength: 2,
              maxLength: Infinity,
            },
          },
          type: 'textarea',
          isRequired: true,
          value: '',
        },
        {
          id: 'brandInputBrand',
          dataName: 'brand',
          title: 'Adres',
          placeholder: 'Wprowadź adres firmy',
          validation: {
            text: 'To pole wymaga min. 2 znaków',
            isValid: false,
            launched: false,
            options: {
              minLength: 2,
              maxLength: Infinity,
            },
          },
          type: 'text',
          isRequired: true,
          value: '',
        },
        {
          id: 'brandInputPhone',
          dataName: 'model',
          title: 'Numer telefonu',
          placeholder: 'Wprowadź numer telefonu np. 999-888-777',
          validation: {
            text: 'Wprowadź poprawny numer telefonu',
            isValid: false,
            launched: false,
            options: {
              minLength: 1, //is like min number ex. 1
              maxLength: Infinity,
            },
            regex: /^\+?[0-9]?(\d{3}|[(]?[0-9]+[)])?(?:[- ]?[0-9]){9,11}$/, // eslint-disable-line
          },
          type: 'tel',
          isRequired: true,
          value: '',
        },
        {
          id: 'brandInputEmail',
          title: 'Email',
          placeholder: 'Wprowadź adres email',
          validation: {
            text: 'Wprowadź poprawny adres np klient@poczta.pl',
            isValid: false,
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
          id: 'brandInputLogo',
          title: 'Logo',
          placeholder: 'Prześlij logo firmy',
          validation: {
            text: 'To pole jest wymagane, max rozmiar 1MB',
            isValid: false,
            launched: false,
            options: {
              minLength: null, //is like min number ex. 1
              maxLength: null,
            },
            acceptImg: 'image/*',
            function: 'imageValidation',
          },
          type: 'file',
          isRequired: true, // change letter to required
          value: '',
          logoURL: null,
        },
      ],
      userID: null,
      imgURL: '',
    };
  },
  methods: {
    setUserAuth() {
      this.$store.commit('setUserAuth', supabase.auth.user());
      this.userID = this.$store.state.user.id;
      cardTemplates.forEach((template) => {
        template.uid = this.userID;
      });
    },
    setDataHandler() {
      if (this.checkValidationStatus()) {
        this.setAccountImage();
      }
    },
    async setAccountBrandData(imgPath) {
      let dateToSet = {
        uid: this.userID,
        name: this.inputsData[0].value,
        address: this.inputsData[1].value,
        phone: this.inputsData[2].value,
        email: this.inputsData[3].value,
      };
      if (imgPath) {
        dateToSet.logo = imgPath;
      }
      if (this.checkValidationStatus()) {
        try {
          const { data, error } = await supabase
            .from('Brand')
            .insert(dateToSet)
            .eq('uid', this.userID);
          if (error) throw error;
          if (!imgPath) {
            data[0].logo = this.brandData.logo;
          }
          this.createDefaultTemplate();
        } catch (error) {
          console.log(error);
        }
      }
    },
    async setAccountImage() {
      const image = this.inputsData[4].value;
      const imageType = image.type.split('/')[1];
      let path = '';

      try {
        const { data, error } = await supabase.storage
          .from('image')
          .upload(`${this.userID}/logo.${imageType}`, image, {
            cacheControl: 'no-cache, no-store, must-revalidate',
            upsert: true,
            Expires: 0,
          });
        if (error) throw error;
        path = data.Key.replace('image/', '');
      } catch (error) {
        console.log(error);
      } finally {
        this.setAccountBrandData(path);
      }
    },
    async createDefaultTemplate() {
      try {
        const { error } = await supabase
          .from('Templates')
          .insert(cardTemplates);
        if (error) throw error;
        this.$router.push('/dashboard');
      } catch (error) {
        console.log(error);
      }
    },
    checkValidationStatus() {
      return this.inputsData.every((inputData) => inputData.validation.isValid);
    },
  },
  mounted() {
    this.setUserAuth();
  },
};
</script>

<style scoped>
.first-login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  background-color: var(--body-second);
}
.first-login-header {
  width: 100%;
  max-width: 720px;
  padding: 1rem 2rem;
  margin-bottom: 2rem;
  background-color: var(--body-main);
  border-radius: 10px;
}
.first-login-form-body {
  position: relative;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  gap: 0.8rem 1rem;
  width: 100%;
  max-width: 720px;
  height: 470px;
  padding: 2rem;
  background-color: var(--body-main);
  border-radius: 10px;
  box-shadow: var(--lightShadow);
}
.first-login-footer {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  flex: 1 1;
  width: 100%;
  max-width: 330px;
  padding-right: 1rem;
}
.first-login-footer-wrapper {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 82px;
  border-top: 1px solid var(--main-purple);
}
</style>
