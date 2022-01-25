<template>
  <section class="print-modal" data-type="page">
    <div class="print-page-wrapper">
      <div class="print-page-container" size="A4">
        <header class="print-page-header">
          <div class="print-page-logo-box">
            <img
              class="print-page-logo"
              :src="this.$store.state.profileBrandData.logo"
              alt=""
            />
          </div>
          <ul class="print-page-brand-info-list">
            <li class="print-page-brand-info-list__item">
              <h2 class="brand-info-title">[[name]]</h2>
            </li>
            <li class="print-page-brand-info-list__item">
              <span class="icon icon--color-reverse icon--home"></span>
              <p class="brand-info-text">[[address]]</p>
            </li>
            <li class="print-page-brand-info-list__item">
              <span class="icon icon--color-reverse icon--phone"></span>
              <p class="brand-info-text">[[phone]]</p>
            </li>
            <li class="print-page-brand-info-list__item">
              <span class="icon icon--color-reverse icon--email"></span>
              <p class="brand-info-text">[[email]]</p>
            </li>
          </ul>
        </header>
        <div class="print-page-content">
          <h3 class="print-page-number text-uppercase">
            Karta gwarancyjna nr [[id]]
          </h3>
          <ul class="print-description-list">
            <li class="print-description-list__item">
              <p>Odbiorca: [[person]]</p>
            </li>
            <li class="print-description-list__item">
              <p>Nazwa sprzętu: [[device]]</p>
            </li>
            <li class="print-description-list__item">
              <p>Numer seryjny: [[sn]]</p>
            </li>
            <li class="print-description-list__item">
              <p>Data wydania: [[date]]</p>
            </li>
            <li class="print-description-list__item">
              <p>Okres gwarancji: [[months]]</p>
            </li>
            <li class="print-description-list__item">
              <p>Cena zakupu: [[price]]</p>
            </li>
          </ul>
          <div
            class="print-page-warranty-content"
            contenteditable="true"
            id="printPageText"
            v-if="template"
            v-html="template.html"
            @input="isModifiedTemplate = true"
          ></div>
        </div>
      </div>
      <div class="print-page-options">
        <button
          type="button"
          class="print-page-option-button"
          @click="closePrintModal"
        >
          <span class="icon icon--close"></span>
          <p class="page-button-text">Zamknij</p>
        </button>
        <button
          type="button"
          class="print-page-option-button"
          @click="startSavingTemplate()"
          v-if="isModifiedTemplate"
        >
          <span class="icon icon--save"></span>
          <p class="page-button-text">Zamknij i zapisz</p>
        </button>
      </div>
      <p class="print-page-alert">Obszar nie do wydruku!</p>
    </div>
  </section>
</template>

<script>
import { supabase } from '../supabase/init';
export default {
  name: 'printView',
  props: {
    closePrintPage: Function,
    categoryProps: Object,
  },
  data() {
    return {
      isModifiedTemplate: false,
      closePrintModal: this.closePrintPage,
      template: {},
      isDefault: false,
      mainTemplates: [],
      alertData: {
        type: 'positive', //can be positive,negative or info
        title: 'Sukces',
        text: `Operacja udana`,
        time: 5000,
      },
    };
  },
  methods: {
    getTemplateFromStore() {
      this.mainTemplates = this.$store.state.mainTemplates;
      const templateObj = this.mainTemplates.find(
        (template) => template.uuid === this.categoryProps.uuid
      );
      if (templateObj) {
        this.template.html = templateObj.template;
        this.template.uuid = templateObj.uuid;
        this.isDefault = templateObj.default;
      } else {
        this.template.html = 'Click to create';
        this.template.uuid = null;
        this.isDefault = false;
      }
    },
    async removeStatusFromOldTemplate() {
      try {
        const { error } = await supabase
          .from('Templates')
          .update({
            main: false,
            default: false,
          })
          .eq('uuid', this.template.uuid);
        if (error) throw error;
      } catch (error) {
        console.log(error);
      }
    },
    async startSavingTemplate() {
      const printPageElement = document.getElementById('printPageText');
      this.newTemplateObject = {
        template: printPageElement.innerHTML,
        category: this.categoryProps.title,
        uid: this.$store.state.user.id,
        main: true,
        default: this.isDefault,
      };
      this.findCardConnectedToMainTemplate();
    },
    async saveNewMainTemplate() {
      this.alertData.text = `Nowy szablon został pozytywnie dodany.`;
      try {
        const { data, error } = await supabase
          .from('Templates')
          .insert(this.newTemplateObject);
        this.$store.commit('changeAlertData', this.alertData);
        if (error) throw error;
        this.closePrintPage(0);
        if (this.template.uuid) {
          this.removeStatusFromOldTemplate();
        }
        this.updateMainTemplatesInStore(data);
      } catch (error) {
        this.alertData.type = 'negative';
        this.alertData.title = 'Błąd';
        this.alertData.text = error.message;
        console.log(error);
      }
    },
    async updateMainTemplate() {
      this.alertData.text = `Pozytywnie zaktualizowano szablon: ${this.categoryProps.title}.`;
      try {
        const { data, error } = await supabase
          .from('Templates')
          .update(this.newTemplateObject)
          .eq('uuid', this.template.uuid);
        this.$store.commit('changeAlertData', this.alertData);
        if (error) throw error;
        this.closePrintPage(0);
        this.updateMainTemplatesInStore(data);
      } catch (error) {
        this.alertData.type = 'negative';
        this.alertData.title = 'Błąd';
        this.alertData.text = error.message;
        console.log(error);
      }
    },
    async findCardConnectedToMainTemplate() {
      this.alertData.text = `Nowy szablon został pozytywnie dodany.`;
      try {
        const { data, error } = await supabase
          .from('Cards')
          .select('templateID')
          .eq('templateID', this.template.uuid);
        if (error) throw error;
        if (data.length) {
          this.saveNewMainTemplate();
        } else {
          this.updateMainTemplate();
        }
      } catch (error) {
        this.alertData.type = 'negative';
        this.alertData.title = 'Błąd';
        this.alertData.text = error.message;
        console.log(error);
      }
    },
    updateMainTemplatesInStore(newMainTemplate) {
      let oldMainTemplateIndex = this.mainTemplates.findIndex(
        (template) => template.category === this.categoryProps.title
      );
      oldMainTemplateIndex =
        oldMainTemplateIndex >= 0
          ? oldMainTemplateIndex
          : this.mainTemplates.length;
      this.mainTemplates[oldMainTemplateIndex] = newMainTemplate[0];
      this.$store.commit('setMainTemplates', this.mainTemplates);
    },
  },
  mounted() {
    this.getTemplateFromStore();
  },
};
</script>

<style scoped>
* {
  color: #000;
}
.text-capitalize {
  text-transform: capitalize;
}
.text-uppercase {
  text-transform: uppercase;
}
.print-modal {
  position: fixed;
  display: flex;
  justify-content: center;
  top: 0;
  right: 0;
  left: 0;
  z-index: 999;
  overflow: auto;
  width: 100%;
  height: 100vh;
  background-color: var(--body-second);
}
.print-page-wrapper {
  display: flex;
  align-items: center;
  flex-direction: column;
  width: 21cm; /* is A4 Page scale height/width=0,7070... */
  height: 28.6cm;
  background-color: var(--body-main);
  box-shadow: var(--smallShadow);
}
.print-page-container {
  display: flex;
  flex-direction: column;
  width: 19cm; /* is A4 Page scale height/width=0,7070... */
  height: 27.6cm;
  padding: 0 4mm;
  background-color: #fff;
}
.print-page-alert {
  color: var(--main-text);
}
.print-page-header {
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: 100px;
}
.print-page-logo-box {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 250px;
  height: 100px;
}
.print-page-logo {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
.print-page-brand-info-list {
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: space-between;
}
.brand-info-text {
  font-size: 0.9rem;
}
.brand-info-title {
  text-align: right;
  white-space: pre-line;
  margin-bottom: 0.2rem;
}
.print-page-brand-info-list__item {
  display: flex;
  justify-content: flex-end;
}
.print-page-brand-info-list__item .icon {
  margin-right: 2mm;
}
.print-page-content {
  padding: 10mm 0;
}
.print-page-number {
  font-size: 1.2rem;
  text-align: center;
}
.print-description-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 5mm 0;
}
.print-page-warranty-content {
  padding: 0 5mm;
  font-size: 0.9rem;
}
.print-page-warranty-content ul {
  display: flex;
  flex-direction: column;
  gap: 1mm;
  padding: 2mm;
}
.print-page-warranty-content li {
  list-style-type: decimal;
  list-style-position: outside;
}
.print-page-options {
  position: fixed;
  top: 1rem;
  right: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
}
.print-page-option-button {
  display: flex;
  background-color: unset;
  gap: 0.5rem;
  width: auto;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  background-color: var(--body-second);
  border: 2px solid var(--main-purple);
  opacity: 1;
  cursor: pointer;
}
.print-page-option-button--main-purple {
  background-color: var(--main-purple);
}

.print-page-option-button:hover {
  transition: var(--easeOutQuart);
  background-color: var(--main-purple);
  border: 2px solid var(--main-purple);
  box-shadow: var(--smallShadow);
}
.print-page-option-button--main-purple:hover {
  transition: var(--easeOutQuart);
  background-color: var(--body-second);
  border: 2px solid var(--main-purple);
}
.page-button-text {
  font-size: 0.8rem;
  color: var(--main-text);
}
@media print {
  html,
  body,
  .print-modal {
    width: 100%;
    height: 29.7cm;
  }
  .print-page-options,
  .print-page-options * {
    display: none;
  }
}

@media screen and (max-width: 740px) {
  .print-modal {
    display: block;
    right: unset;
    width: 100%;
    overflow: auto;
  }
  .print-page-wrapper {
    overflow: auto;
  }
  .print-page-container {
    overflow: auto;
  }
}
</style>
<style>
@media print {
  *:not(.print-modal *) {
    overflow: hidden;
  }
}
</style>
