<template>
  <ul class="warranty-card-list" id="warrantyCardList">
    <template
      v-if="warrantyCardsData !== 'empty' && warrantyCardsData.length > 0"
    >
      <WarrantyCardListItem
        :openModalToEditCard="openModalToEditWarrantyCard"
        v-for="warrantyCard in warrantyCardsData"
        :key="warrantyCard.id"
        :warrantyData="warrantyCard"
        :openPrintPage="openPrintPage"
      />
    </template>
    <div
      class="warranty-card-list__alert"
      v-else-if="warrantyCardsData === 'empty' || warrantyCardsData.length < 1"
    >
      <span class="icon icon--big icon--sad"></span>
      <p class="card-list-alert__text">Brak wyników.</p>
    </div>
    <li
      class="card-load-more"
      v-if="
        !searchStatus &&
        this.warrantyCardsData.length < this.$store.state.allCardsInDBLength
      "
    >
      <button class="button-load-more" @click="loadMoreCards">
        <span class="icon icon--add"></span>
        <span class="button-load-more__text">Załaduj więcej</span>
      </button>
    </li>
    <Modal
      :modalProps="modalData"
      :loadFromData="true"
      v-if="modalData.show"
      :closeModal="closeModalWindow"
    />
    <PrintPage
      v-if="printPage.view"
      :printData="printPage"
      :closePrintPage="closePrintPage"
    />
  </ul>
</template>

<script>
import WarrantyCardListItem from './WarrantyCardListItem.vue';
import Modal from './Modal.vue';
import PrintPage from './PrintPage.vue';
import { supabase } from '../supabase/init';
export default {
  components: {
    WarrantyCardListItem,
    Modal,
    PrintPage,
  },
  data() {
    return {
      modalData: {
        title: 'Edytuj kartę gwarancyjną',
        component: 'ModalWarrantyBody',
        show: false,
        nav: {
          title: 'Szablony',
          items: [...this.$store.getters.sortedCategories],
        },
        warrantyData: {},
      },
      warrantyCardsData: this.$store.state.allWarrantyData,
      searchWarrantyData: null,
      printPage: {
        view: false,
        startPrinting: false,
        warrantyData: {},
      },
      searchStatus: false,
      inactiveCardsUUID: [],
    };
  },
  methods: {
    openModalToEditWarrantyCard(data) {
      this.modalData.show = true;
      this.modalData.warrantyData = data;
    },
    closeModalWindow() {
      this.modalData.show = false;
    },
    openPrintPage(data, startPrinting) {
      this.printPage.view = true;
      this.printPage.startPrinting = startPrinting;
      this.printPage.warrantyData = data;
    },
    closePrintPage() {
      this.printPage.view = false;
    },
    loadMoreCards() {
      let query = {
        length: this.$store.state.cardLimit,
        name: 'active',
        value: this.$store.state.viewCardType,
      };
      if (
        this.warrantyCardsData.length < this.$store.state.allCardsInDBLength
      ) {
        this.$store.commit('updateCardLimit', 6);
        query.length += 6;
        this.$store.commit('getDataFromDB', query);
      }
    },
    checkActiveCards() {
      const today = new Date(this.$store.state.today);
      this.warrantyCardsData.forEach((card) => {
        const finishDate = new Date(card.device.date.finish);
        if (today > finishDate && card.active) {
          this.inactiveCardsUUID.push(card.uuid);
        }
      });
      if (this.inactiveCardsUUID.length > 0) {
        this.changeCardToInactive();
      }
    },
    async changeCardToInactive() {
      try {
        const { error } = await supabase
          .from('Cards')
          .update({ active: false })
          .in('uuid', this.inactiveCardsUUID);
        if (error) throw error;
      } catch (error) {
        console.log(error);
      }
    },
  },
  watch: {
    '$store.state.searchWarrantyData': function (newVal) {
      if (newVal !== null && newVal.length !== 'empty') {
        this.searchStatus = true;
        this.warrantyCardsData = newVal;
      } else if (newVal === 'empty') {
        this.searchStatus = true;
        this.warrantyCardsData = 'empty';
      } else if (newVal === null) {
        this.searchStatus = false;
        this.warrantyCardsData = this.$store.state.allWarrantyData;
      }
    },
    '$store.state.allWarrantyData': function (newVal) {
      this.searchStatus = false;
      this.warrantyCardsData = newVal;
      this.checkActiveCards();
    },
    '$store.state.printPageData': function (newVal) {
      this.openPrintPage(newVal, true);
    },
  },
  mounted() {
    this.checkActiveCards();
  },
};
</script>

<style scoped>
.icon--big {
  width: 24px;
  height: 24px;
}
.warranty-card-list {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  gap: 3rem;
  width: 100%;
  height: calc(100vh - 335px);
  padding-bottom: 2rem;
  overflow-y: auto;
}
.warranty-card-list::-webkit-scrollbar {
  width: 4px;
  background-color: var(--body-second);
  border-radius: 20px;
}
.warranty-card-list::-webkit-scrollbar-thumb {
  background-color: var(--main-purple);
  border-radius: 20px;
}
.card-load-more {
  width: 100%;
  max-width: 310px;
}
.button-load-more,
.warranty-card-list__alert {
  width: 100%;
  max-width: 310px;
  display: flex;
  align-items: center;
  padding: 0.7rem 2rem;
  background-color: var(--main-purple);
  border-radius: 10px;
  box-shadow: var(--mainShadow);
}
.button-load-more__text {
  margin-left: 0.5rem;
}
.warranty-card-list__alert {
  height: 40px;
  gap: 1rem;
}
@media screen and (max-width: 740px) {
  .warranty-card-list {
    height: calc(100vh - 220px);
  }
}
</style>
