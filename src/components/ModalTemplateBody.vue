<template>
  <form
    class="modal-dialog-form-body"
    @submit.prevent="saveNewTemplateCategory"
    id="addWarrantyModalForm"
    v-if="ready"
  >
    <ModalInput v-for="inputData in inputsData" :key="inputData.id" :inputProp="inputData" />
    <div class="modal-form-group--button">
      <p class="modal-form-group__title">Edytor treści szablonu</p>
      <button
        class="modal-button modal-button--form modal-button--bg-color"
        type="button"
        @click="openPageEditor = true"
      >
        <span class="icon icon--edit"></span>Otwórz
      </button>
    </div>
    <div class="modal-dialog-footer">
      <div class="modal-dialog-footer-wrapper">
        <button class="modal-button modal-button--bg-color" type="submit">
          <span class="icon icon--save"></span>Zapisz
        </button>
      </div>
    </div>
    <WarrantyTemplatePageCreator
      v-if="openPageEditor"
      :closePrintPage="closePrintPage"
      :categoryProps="category"
    />
  </form>
</template>

<script>
import ModalInput from './ModalInput.vue';
import WarrantyTemplatePageCreator from './WarrantyTemplatePageCreator.vue';
import { supabase } from '../supabase/init';
export default {
  components: {
    ModalInput,
    WarrantyTemplatePageCreator,
  },
  props: {
    activeCategory: Object,
    closeModal: Function,
    forceRerenderComponent: Function,
  },
  data() {
    return {
      inputsData: [
        {
          id: 'nameInputTemplate',
          dataName: 'brand',
          title: 'Nazwa szablonu',
          placeholder: 'Wprowadź nazwę szablonu',
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
          id: 'defaultInputTemplate',
          dataName: 'brand',
          title: 'Domyślny',
          placeholder: '',
          validation: {
            text: '',
            isValid: true,
            launched: false,
            options: {
              minLength: null,
              maxLength: null,
            },
          },
          type: 'checkbox',
          isRequired: false,
          value: '',
        },
      ],
      userID: this.$store.state.user.id,
      imgURL: '',
      ready: false,
      category: null,
      openPageEditor: false,
    };
  },
  methods: {
    closePrintPage() {
      this.openPageEditor = false;
    },
    async saveNewTemplateCategory() {
      let mainTemplates = this.$store.state.mainTemplates;
      let template = mainTemplates.find(
        (template) => template.category === this.activeCategory.title
      );
      template.category = this.inputsData[0].value;
      let alertData = {
        type: 'positive', //can be positive,negative or info
        title: 'Sukces',
        text: `Nazwa szablonu została zmieniona na: ${template.category}`,
        time: 5000,
      };
      let dataToUpdate = {
        category: template.category,
      };
      if (!template.default && this.inputsData[1].value) {
        dataToUpdate.default = true;
        template.default = true;
        alertData.text =
          this.category.title !== template.category
            ? `Zmiana domyślnego szablonu i nazwy na: ${template.category} przebiegła pomyślnie.`
            : `Szablon ${template.category} jest teraz domyślnym szablonem.`;
        await this.removeDefaultFromOtherTemplate();
        this.$store.commit('updateDeafultCategory', template);
      }
      try {
        const { error } = await supabase
          .from('Templates')
          .update(dataToUpdate)
          .eq('uuid', template.uuid);
        this.$store.commit('changeAlertData', alertData);
        if (error) throw error;
        this.closeModal(0);
        this.$store.commit('updateCategories', template);
        this.category.title = template.category;
      } catch (error) {
        alertData.type = 'negative';
        alertData.title = 'Błąd';
        alertData.text = error.message;
      }
    },
    async removeDefaultFromOtherTemplate() {
      try {
        const { error } = await supabase
          .from('Templates')
          .update({
            default: false,
          })
          .eq('default', true);
        if (error) throw error;
      } catch (error) {
        console.log(error);
      }
    },
  },
  watch: {
    activeCategory: function (newValue) {
      this.ready = false;
      setTimeout(() => {
        this.ready = true;
      }, 1);
      this.inputsData[0].value = newValue.title;
      this.inputsData[1].value = this.activeCategory.default;
      this.category = newValue;
    },
  },
};
</script>

<style scoped>
.modal-form-group--button {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-height: 82px;
  width: 100%;
  max-width: 330px;
  padding-right: 1rem;
}
.modal-form-group__title {
  font-weight: bold;
}
.modal-button--form {
  align-self: flex-start;
}
</style>
