<template>
  <form
    class="modal-dialog-form-body"
    @submit.prevent="startUpdateData"
    id="addWarrantyModalForm"
    v-if="brandData"
  >
    <ModalInput
      v-for="inputData in inputsData"
      :key="inputData.id"
      :inputProp="inputData"
      :brandProps="brandData"
    />
    <div class="modal-dialog-footer">
      <div class="modal-dialog-footer-wrapper">
        <button class="modal-button modal-button--bg-color" type="submit">
          <span class="icon icon--save"></span>Zapisz
        </button>
      </div>
    </div>
  </form>
</template>

<script>
import ModalInput from './ModalInput.vue';
import { supabase } from '../supabase/init';
export default {
  components: {
    ModalInput,
  },
  props: {
    closeModal: Function,
    forceRerenderComponent: Function,
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
            isValid: true,
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
            isValid: true,
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
            isValid: true,
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
          id: 'brandInputLogo',
          title: 'Logo',
          placeholder: 'Prześlij logo firmy',
          validation: {
            text: 'To pole jest wymagane, max rozmiar 1MB',
            isValid: true,
            launched: false,
            options: {
              minLength: null, //is like min number ex. 1
              maxLength: null,
            },
            acceptImg: 'image/*',
            function: 'imageValidation',
          },
          type: 'file',
          isRequired: false, // change letter to required
          value: '',
          logoURL: null,
        },
      ],
      userID: this.$store.state.user.id,
      imgURL: '',
    };
  },
  methods: {
    async startUpdateData() {
      if (
        this.inputsData[4].validation.launched &&
        this.inputsData[4].validation.isValid
      ) {
        this.updateAccountImage();
      } else {
        this.updateAccountBrandData();
      }
    },
    async updateAccountBrandData(imgPath) {
      let dateToUpdate = {
        uid: this.userID,
        name: this.inputsData[0].value,
        address: this.inputsData[1].value,
        phone: this.inputsData[2].value,
        email: this.inputsData[3].value,
      };
      if (imgPath) {
        dateToUpdate.logo = imgPath;
      }
      if (this.checkValidationStatus()) {
        const alertData = {
          type: 'positive', //can be positive,negative or info
          title: 'Sukces',
          text: 'Pozytywnie zakatualizowano dane.',
          time: 3000,
        };
        try {
          const { data, error } = await supabase
            .from('Brand')
            .update(dateToUpdate)
            .eq('uid', this.userID);
          this.$store.commit('changeAlertData', alertData);
          if (error) throw error;
          if (!imgPath) {
            data[0].logo = this.brandData.logo;
          }
          this.$store.commit('updateBrandDataFromDB', data[0]);
          if (imgPath) {
            this.$store.commit('updateProfileLogo', imgPath);
          }
          this.closeModal(2);
        } catch (error) {
          alertData.type = 'negative';
          alertData.title = 'Błąd';
          alertData.text = error.message;
        }
      }
    },
    async updateAccountImage() {
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
        this.updateAccountBrandData(path);
      }
    },
    loadAccountDataToInput() {
      this.inputsData[0].value = this.brandData.name;
      this.inputsData[1].value = this.brandData.address;
      this.inputsData[2].value = this.brandData.phone;
      this.inputsData[3].value = this.brandData.email;
      this.inputsData[4].logoURL = this.brandData.logo;
    },
    checkValidationStatus() {
      return this.inputsData.every((inputData) => inputData.validation.isValid);
    },
  },
  mounted() {
    this.brandData = this.$store.state.profileBrandData;
    this.loadAccountDataToInput();
  },
};
</script>

