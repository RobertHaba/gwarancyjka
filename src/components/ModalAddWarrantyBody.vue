<template>
  <form
    class="modal-dialog-form-body"
    @submit.prevent="createWarrantyData(false)"
    id="addWarrantyModalForm"
  >
    <ModalInput
      v-for="inputData in inputsData"
      :key="inputData.id"
      :inputProp="inputData"
      :modalProps="warrantyData"
    />
    <div class="modal-dialog-footer">
      <div class="modal-dialog-footer-wrapper">
        <button class="modal-button" type="submit">
          <span class="icon icon--save"></span>Zapisz
        </button>
        <button
          type="button"
          class="modal-button modal-button--bg-color"
          @click="createWarrantyData(true)"
        >
          <span class="icon icon--print"></span>Drukuj i zapisz
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
    modalProps: Object,
    closeModal: Function,
    forceRerenderComponent: Function,
    activeCategory: Object,
  },
  data() {
    return {
      warrantyData: this.modalProps.warrantyData,
      inputsData: [
        {
          id: 'warrantyInputName',
          title: 'Imię i nazwisko',
          placeholder: 'Wprowadź imię i nazwisko',
          validation: {
            text: 'To pole wymaga min. 5 znaków',
            isValid: this.modalProps.warrantyData.personName ? true : false,
            launched: false,
            options: {
              minLength: 5,
              maxLength: Infinity,
            },
          },
          type: 'text',
          isRequired: true,
          value: this.modalProps.warrantyData.personName,
        },
        {
          id: 'warrantyInputBrand',
          dataName: 'brand',
          title: 'Marka',
          placeholder: 'Wprowadź markę',
          validation: {
            text: 'To pole wymaga min. 2 znaków',
            isValid: this.modalProps.warrantyData.device.brand ? true : false,
            launched: false,
            options: {
              minLength: 2,
              maxLength: Infinity,
            },
          },
          type: 'text',
          isRequired: true,
          value: this.modalProps.warrantyData.device
            ? this.modalProps.warrantyData.device.brand
            : '',
        },
        {
          id: 'warrantyInputModel',
          dataName: 'model',
          title: 'Model',
          placeholder: 'Wprowadź model',
          validation: {
            text: 'To pole jest wymagane',
            isValid: this.modalProps.warrantyData.device.model ? true : false,
            launched: false,
            options: {
              minLength: 1,
              maxLength: Infinity,
            },
          },
          type: 'text',
          isRequired: true,
          value: this.modalProps.warrantyData.device
            ? this.modalProps.warrantyData.device.model
            : '',
        },
        {
          id: 'warrantyInputSN',
          title: 'Numer Seryjny',
          placeholder: 'Wprowadź numer seryjny',
          validation: {
            text: 'To pole jest wymagane',
            isValid: this.modalProps.warrantyData.device.sn ? true : false,
            launched: false,
            options: {
              minLength: 1,
              maxLength: Infinity,
            },
          },
          type: 'text',
          isRequired: true,
          value: this.modalProps.warrantyData.device
            ? this.modalProps.warrantyData.device.sn
            : '',
        },
        {
          id: 'warrantyInputMonthsLength',
          title: 'Okres gwarancji',
          placeholder: 'Wprowadź ilość miesięcy gwarancji',
          validation: {
            text: 'To pole jest wymagane',
            isValid: this.modalProps.warrantyData.device.date.months
              ? true
              : false,
            launched: false,
            options: {
              minLength: 1, //is like min number ex. 1
              maxLength: Infinity,
            },
          },
          type: 'number',
          isRequired: true,
          value: this.modalProps.warrantyData.device
            ? this.modalProps.warrantyData.device.date.months
            : '',
        },
        {
          id: 'warrantyInputDateStart',
          title: 'Data rozpoczęcia',
          placeholder: 'Wprowadź datę rozpoczęcia gwarancji np. 22.12.2021',
          validation: {
            text: 'To pole jest wymagane',
            isValid: true,
            launched: false,
            options: {
              minLength: 1, //is like min number ex. 1
              maxLength: Infinity,
            },
          },
          type: 'date',
          isRequired: true,
          value: this.modalProps.warrantyData.device.date.start
            ? this.modalProps.warrantyData.device.date.start
            : new Date().toISOString().slice(0, 10),
        },
        {
          id: 'warrantyInputPrice',
          title: 'Cena',
          placeholder: 'Wprowadź cenę urządzenia',
          validation: {
            text: 'To pole jest wymagane',
            isValid: this.modalProps.warrantyData.device.price ? true : false,
            launched: false,
            options: {
              minLength: 0, //is like min number ex. 1
              maxLength: Infinity,
              step: 0.01,
            },
          },
          type: 'number',
          isRequired: true,
          value: this.modalProps.warrantyData.device.price
            ? this.modalProps.warrantyData.device.price
            : '',
        },
      ],
      userID: this.$store.state.user.id,
      cardID: this.newCardID,
      lastIDInInactive: null,
      printing:false,
    };
  },
  computed: {
    newCardID() {
      const allWarrantyCard = this.$store.state.allWarrantyData;
      const selectedYear = this.$store.state.year;
      let lastId, lastIdInactive;
      if (allWarrantyCard.length > 0) {
        lastId = [...allWarrantyCard][0].id.split('/');
      }
      if (this.lastIDInInactive) {
        lastIdInactive = this.lastIDInInactive.split('/');
        lastId =
          parseInt(lastId[0]) > parseInt(lastIdInactive[0])
            ? lastId
            : lastIdInactive;
      }
      if (allWarrantyCard.length && lastId[1] == selectedYear) {
        return parseInt(lastId[0]) + 1 + '/' + selectedYear;
      } else {
        return `1/${selectedYear}`;
      }
    },
  },
  methods: {
    createWarrantyData(printStatus) {
      this.printing = printStatus
      const newWarrantyData = {
        id: this.modalProps.warrantyData.id
          ? this.modalProps.warrantyData.id
          : this.newCardID,
        uid: this.userID,
        personName: this.inputsData[0].value,
        device: {
          brand: this.inputsData[1].value,
          model: this.inputsData[2].value,
          name: this.inputsData[1].value + ' ' + this.inputsData[2].value,
          sn: this.inputsData[3].value,
          date: {
            months: this.inputsData[4].value,
            start: this.inputsData[5].value,
            finish: this.addMonthsToDate(),
            timestamp: this.modalProps.warrantyData.device.date.timestamp,
          },
          category: this.activeCategory.title,
          price: this.inputsData[6].value,
        },
        active: this.modalProps.warrantyData.active
          ? this.modalProps.warrantyData.active
          : true,
      };
      const mainTemplate = this.$store.state.mainTemplates.find(
        (template) => template.category == newWarrantyData.device.category
      );
      newWarrantyData.templateID = mainTemplate
        ? mainTemplate.uuid
        : this.activeCategory.uuid;
      if (
        this.checkValidationStatus() &&
        this.modalProps.warrantyData.uuid == undefined
      ) {
        this.addNewCardToDB(newWarrantyData);
      } else if (
        this.checkValidationStatus() &&
        this.modalProps.warrantyData.uuid !== undefined
      ) {
        this.findCardConnectedToTemplate(newWarrantyData);
      }
    },
    addMonthsToDate() {
      if (this.inputsData[4].value) {
        let dateStart = new Date(this.inputsData[5].value);
        return new Date(
          dateStart.setMonth(dateStart.getMonth() + this.inputsData[4].value)
        )
          .toISOString()
          .slice(0, 10);
      }
    },
    checkValidationStatus() {
      return this.inputsData.every((inputData) => inputData.validation.isValid);
    },
    async checkLastIDInInactive() {
      try {
        const { data, error } = await supabase
          .from('Cards')
          .select('id')
          .limit(1)
          .order('timestamp', { ascending: false })
          .eq('active', false);
        if (error) throw error;
        if (data.length > 0) {
          this.lastIDInInactive = data[0].id;
        }
      } catch (error) {
        console.log(error);
      }
    },
    async addNewCardToDB(newWarrantyData) {
      const alertData = {
        type: 'positive', //can be positive,negative or info
        title: 'Sukces',
        text: `Karta gwarancyjna klienta: ${newWarrantyData.personName} została zapisana.`,
        time: 5000,
      };
      try {
        const { error } = await supabase.from('Cards').insert(newWarrantyData);
        if (error) throw error;
        this.$store.commit('changeAlertData', alertData);
        this.closeModal(0);
        if(this.printing){
          this.$store.commit('setPrintPageData',newWarrantyData)
        }
        this.forceRerenderComponent();
      } catch (error) {
        console.log(error);
      }
    },
    async findCardConnectedToTemplate(newWarrantyData) {
      try {
        const { data, error } = await supabase
          .from('Cards')
          .select('templateID')
          .eq('templateID', this.warrantyData.templateID);
        if (error) throw error;
        if (data.length == 1) {
          this.removeTemplate(newWarrantyData);
        } else {
          this.updateCardData(newWarrantyData);
        }
      } catch (error) {
        console.log(error);
      }
    },
    async removeTemplate(newWarrantyData) {
      await this.updateCardData(newWarrantyData);
      try {
        const { error } = await supabase
          .from('Templates')
          .delete()
          .match({ uuid: this.warrantyData.templateID, main: false });
        if (error) throw error;
      } catch (error) {
        console.log(error);
      }
    },
    async updateCardData(newWarrantyData) {
      let alertData = {
        type: 'positive', //can be positive,negative or info
        title: 'Sukces',
        text: `Karta gwarancyjna nr: ${newWarrantyData.id} została zaktualizowana.`,
        time: 5000,
      };
      try {
        const { error } = await supabase
          .from('Cards')
          .update(newWarrantyData)
          .eq('uuid', this.modalProps.warrantyData.uuid);
        this.$store.commit('changeAlertData', alertData);
        if (error) throw error;
        this.closeModal(0);
        if(this.printing){
          this.$store.commit('setPrintPageData',newWarrantyData)
        }
      } catch (error) {
        alertData.type = 'negative';
        alertData.title = 'Błąd';
        alertData.text = error.message;
        console.log(error);
      }
    },
  },
  mounted() {
    if (!this.warrantyData.id) {
      this.checkLastIDInInactive();
    }
  },
};
</script>