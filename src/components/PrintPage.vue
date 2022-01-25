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
              <h2 class="brand-info-title">
                {{ this.$store.state.profileBrandData.name }}
              </h2>
            </li>
            <li class="print-page-brand-info-list__item">
              <span class="icon icon--color-reverse icon--home"></span>
              <p class="brand-info-text">
                {{ this.$store.state.profileBrandData.address }}
              </p>
            </li>
            <li class="print-page-brand-info-list__item">
              <span class="icon icon--color-reverse icon--phone"></span>
              <p class="brand-info-text">
                {{ this.$store.state.profileBrandData.phone }}
              </p>
            </li>
            <li class="print-page-brand-info-list__item">
              <span class="icon icon--color-reverse icon--email"></span>
              <p class="brand-info-text">
                {{ this.$store.state.profileBrandData.email }}
              </p>
            </li>
          </ul>
        </header>
        <div class="print-page-content">
          <h3 class="print-page-number text-uppercase">
            Karta gwarancyjna nr {{ warrantyData.id }}
          </h3>
          <ul class="print-description-list">
            <li class="print-description-list__item">
              <p>
                Odbiorca:
                <span class="text-capitalize">{{
                  warrantyData.personName
                }}</span>
              </p>
            </li>
            <li class="print-description-list__item">
              <p>
                Nazwa sprzętu:
                <span class="text-capitalize">{{
                  warrantyData.device.name
                }}</span>
              </p>
            </li>
            <li class="print-description-list__item">
              <p>
                Numer seryjny:
                <span class="text-uppercase">{{ warrantyData.device.sn }}</span>
              </p>
            </li>
            <li class="print-description-list__item">
              <p>
                Data wydania:
                <time :date="reverseDate(warrantyData.device.date.start)">{{
                  reverseDate(warrantyData.device.date.start)
                }}</time>
                r.
              </p>
            </li>
            <li class="print-description-list__item">
              <p>Okres gwarancji: {{ warrantyData.device.date.months }} msc.</p>
            </li>
            <li class="print-description-list__item">
              <p>Cena zakupu: {{ warrantyData.device.price }}zł</p>
            </li>
          </ul>
          <div
            class="print-page-warranty-content"
            contenteditable="true"
            id="printPageText"
            v-html="warrantyData.template"
            @input="isModifiedTemplate = true"
          ></div>
        </div>
      </div>
      <div class="print-page-options">
        <button class="print-page-option-button" @click="closePrintModal()">
          <span class="icon icon--close"></span>
          <p class="page-button-text">Zamknij</p>
        </button>
        <button
          class="print-page-option-button"
          @click="saveNewTemplate()"
          v-if="isModifiedTemplate"
        >
          <span class="icon icon--save"></span>
          <p class="page-button-text">Zamknij i zapisz</p>
        </button>
        <button
          class="print-page-option-button print-page-option-button--main-purple"
          @click="
            isModifiedTemplate ? saveNewTemplate() : printPage(), (print = true)
          "
        >
          <span class="icon icon--print"></span>
          <p class="page-button-text">
            Drukuj {{ isModifiedTemplate ? 'i zapisz' : '' }}
          </p>
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
    printData: Object,
    closePrintPage: Function,
  },
  data() {
    return {
      warrantyData: this.printData.warrantyData,
      closePrintModal: this.closePrintPage,
      isModifiedTemplate: false,
      newTemplateObject: {},
      newDataFromDB: null,
      print: false,
      alertData: {
        type: 'positive', //can be positive,negative or info
        title: 'Sukces',
        text: `Operacja udana`,
        time: 5000,
      },
    };
  },
  methods: {
    printPage: (autoClose, closeWindow) => {
      window.print();
      if (autoClose === true) {
        closeWindow();
      }
    },
    printWhenTemplateIsAdded() {
      const printPageElement = document.getElementById('printPageText');
      const checkForChange = setInterval(() => {
        if (printPageElement.childNodes) {
          this.printPage(true, this.closePrintPage);
          clearInterval(checkForChange);
        }
      }, 50);
    },
    reverseDate(date) {
      const reversedDate = date.split('-').reverse().join('.');
      return reversedDate;
    },
    async getTemplateFromDB() {
      const template = this.$store.state.mainTemplates.find(
        (template) => template.uuid === this.warrantyData.templateID
      );
      if (template) {
        this.warrantyData.templateMain = template.main;
        this.replaceFlagToText(template.template);
      } else {
        try {
          const { data, error } = await supabase
            .from('Templates')
            .select('template,main')
            .eq('uuid', this.warrantyData.templateID);
          if (error) throw error;
          this.warrantyData.templateMain = data[0].main;
          this.replaceFlagToText(data[0].template);
        } catch (error) {
          console.log(error);
        }
      }
    },
    replaceFlagToText(template) {
      const profileBrandData = this.$store.state.profileBrandData;
      const flags = [
        {
          name: '[[person]]',
          data: this.warrantyData.personName,
        },
        {
          name: '[[months]]',
          data: this.warrantyData.device.date.months,
        },
        {
          name: '[[device]]',
          data: this.warrantyData.device.name,
        },
        {
          name: '[[sn]]',
          data: this.warrantyData.device.sn,
        },
        {
          name: '[[date]]',
          data: this.reverseDate(this.warrantyData.device.date.start),
        },
        {
          name: '[[price]]',
          data: this.warrantyData.device.price,
        },
        {
          name: '[[id]]',
          data: this.warrantyData.id,
        },
        {
          name: '[[address]]',
          data: profileBrandData.address,
        },
        {
          name: '[[name]]',
          data: profileBrandData.name,
        },
        {
          name: '[[phone]]',
          data: profileBrandData.phone,
        },
        {
          name: '[[email]]',
          data: profileBrandData.email,
        },
      ];
      flags.forEach((flag) => {
        template = template.replaceAll(flag.name, flag.data);
      });
      this.warrantyData.template = template;
      if (this.printData.startPrinting) {
        this.printWhenTemplateIsAdded();
      }
    },
    async saveNewTemplate() {
      const printPageElement = document.getElementById('printPageText');
      this.newTemplateObject = {
        template: printPageElement.innerHTML,
        category: this.warrantyData.device.category,
        uid: this.$store.state.user.id,
        main: false,
      };
      this.alertData.text = `Szablon został pozytywnie zaktualizowany.`;
      this.alertData.time = 3000;
      try {
        const { data, error } = await supabase
          .from('Templates')
          .insert(this.newTemplateObject);
        this.$store.commit('changeAlertData', this.alertData);
        if (error) throw error;
        this.newDataFromDB = data;
        this.updateTemplateIDInCard();
      } catch (error) {
        this.alertData.type = 'negative';
        this.alertData.title = 'Błąd';
        this.alertData.text = error.message;
        console.log(error);
      }
    },
    async updateTemplateIDInCard() {
      try {
        const { error } = await supabase
          .from('Cards')
          .update({ templateID: this.newDataFromDB[0].uuid })
          .eq('uuid', this.warrantyData.uuid);
        if (error) throw error;
        this.deleteOldTemplate();
      } catch (error) {
        this.$store.commit('changeAlertData', this.alertData);
        this.alertData.type = 'negative';
        this.alertData.title = 'Błąd';
        this.alertData.text = error.message;
        console.log(error);
      }
    },
    async deleteOldTemplate() {
      if (!this.warrantyData.templateMain) {
        try {
          const { error } = await supabase
            .from('Templates')
            .delete()
            .eq('uuid', this.warrantyData.templateID);
          if (error) throw error;
          this.isModifiedTemplate = false;
        } catch (error) {
          this.$store.commit('changeAlertData', this.alertData);
          this.alertData.type = 'negative';
          this.alertData.title = 'Błąd';
          this.alertData.text = error.message;
          console.log(error);
        }
      }
      this.warrantyData.template = this.newTemplateObject.template;
      this.warrantyData.templateID = this.newDataFromDB[0].uuid;
      if (this.print) {
        this.printPage();
        this.print = false;
      } else {
        this.closePrintModal();
      }
    },
  },
  mounted() {
    if (!this.printData.warrantyData.template) {
      this.getTemplateFromDB();
    } else if (
      this.printData.warrantyData.template &&
      this.printData.startPrinting
    ) {
      this.replaceFlagToText(this.printData.warrantyData.template);
    }
  },
};
</script>

<style scoped>
* {
  color: #000;
}
.icon {
  -webkit-print-color-adjust: exact;
  color-adjust: exact !important; /* Fix no print icon */
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
  width: 300px;
  height: 120px;
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
  position: relative;
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
  .print-modal{
    display: block;
    right: unset;
    width: 100%;
    overflow: auto;
  }
  .print-page-wrapper{
    overflow: auto;
  }
  .print-page-container{
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
