<template>
  <li class="warranty-card-list__item warranty-card">
    <h3 class="warranty-card__name" :data-filter-person="warranty.personName">
      {{ warranty.personName }}
    </h3>
    <div class="warranty-card__content warranty-card-content">
      <div class="warranty-card-content__column">
        <div class="warranty-card-icon-wrapper">
          <span
            class="icon icon--warranty-card"
            :class="`icon--logo-${logoIconName}`"
          ></span>
        </div>
        <div class="warranty-card-description">
          <h4 class="warranty-card-description__title">
            {{ warranty.device.name }}
          </h4>
          <p class="warranty-card-description__text">
            {{ warranty.device.sn }}
          </p>
          <p class="warranty-card-description__text">{{ warranty.id }}</p>
        </div>
      </div>
      <div
        class="warranty-card-content__column warranty-card-content__column--progress"
      >
        <div class="warranty-card-progress">
          <div
            class="warranty-card-progress__bar"
            :style="`width: ${remainingMonthsProgressBar}%`"
          >
            <span class="warranty-card-progress-value-now">{{
              elapsedMonths
            }}</span>
          </div>
        </div>
        <div class="warranty-card-proggress-info">
          <time
            class="warranty-card-proggress-info__time"
            :datetime="warranty.device.date.start"
            >{{ reverseDate(warranty.device.date.start) }}</time
          >
          <time
            class="warranty-card-proggress-info__time warranty-card-proggress-info__time--bold"
            :datetime="warranty.device.date.finish"
            >{{ reverseDate(warranty.device.date.finish) }}</time
          >
        </div>
      </div>
    </div>
    <div class="warranty-card__options">
      <button
        class="warranty-card-button"
        @click="openModalToEditCard(warranty)"
        title="Edit"
      >
        <span class="icon icon--edit"></span>
      </button>
      <button
        class="warranty-card-button"
        @click="openPrintPage(warranty, false)"
      >
        <span class="icon icon--view"></span>
      </button>
      <button
        class="warranty-card-button"
        @click="openPrintPage(warranty, true)"
      >
        <span class="icon icon--print"></span>
      </button>
      <button class="warranty-card-button" @click="startRemoving()">
        <span class="icon icon--trash"></span>
      </button>
    </div>
  </li>
</template>

<script>
import { supabase } from '../supabase/init';
export default {
  props: {
    openModalToEditCard: Function,
    openPrintPage: Function,
    warrantyData: Object,
  },
  data() {
    return {
      warranty: this.warrantyData,
      alertData: {
        type: 'info', //can be positive,negative or info
        title: 'Alert',
        text: 'Usunąć?',
        options: [
          {
            type: 'positive',
            text: 'Yes',
            functionName: this.findCardConnectedToMainTemplate,
          },
          { type: 'negative', text: 'Nie' },
        ],
        time: 4000,
      },
    };
  },
  computed: {
    logoIconName() {
      const brandsName = [
        'samsung',
        'dell',
        'hp',
        'sony',
        'fujitsu',
        'acer',
        'asus',
        'apple',
        'toshiba',
      ];
      const brandCheck = brandsName.includes(
        this.warranty.device.brand.toLowerCase()
      );
      return brandCheck ? this.warranty.device.brand.toLowerCase() : 'app';
    },
    remainingMonthsProgressBar() {
      const startDate = new Date(this.warranty.device.date.start);
      const todayDate = new Date();
      const finishDate = new Date(this.warranty.device.date.finish);
      const elapsedTime = parseInt(
        (todayDate - startDate) / (24 * 3600 * 1000)
      );
      const totalTime = parseInt((finishDate - startDate) / (24 * 3600 * 1000));
      const differenceTime = (elapsedTime / totalTime) * 100;
      return differenceTime <= 100 ? differenceTime : 100;
    },
    elapsedMonths() {
      const startDate = new Date(this.warranty.device.date.start);
      const todayDate = new Date();
      return parseInt((todayDate - startDate) / (24 * 3600 * 1000) / 30);
    },
  },
  methods: {
    reverseDate(date) {
      const reversedDate = date.split('-').reverse().join('-');
      return reversedDate;
    },
    startRemoving() {
      this.alertData.text = `Czy na pewno chcesz usunąć karte: ${this.warranty.id} klienta - ${this.warranty.personName}`;
      this.$store.commit('changeAlertData', this.alertData);
    },
    async findCardConnectedToMainTemplate() {
      try {
        const { data, error } = await supabase
          .from('Cards')
          .select('templateID')
          .eq('templateID', this.warranty.templateID);
        if (error) throw error;
        if (data.length == 1) {
          this.removeTemplate();
        } else {
          this.removeCard();
        }
      } catch (error) {
        console.log(error);
      }
    },
    async removeCard() {
      await supabase.from('Cards').delete().eq('uuid', this.warranty.uuid);
    },
    async removeTemplate() {
      await this.removeCard();
      try {
        const { error } = await supabase
          .from('Templates')
          .delete()
          .match({ uuid: this.warranty.templateID, main: false });
        if (error) throw error;
      } catch (error) {
        console.log(error);
      }
    },
  },
  watch: {
    warrantyData(newValue) {
      this.warranty = newValue;
    },
  },
};
</script>

<style scoped>
.warranty-card {
  width: 100%;
  max-width: 310px;
  height: 350px;
  padding: 1.5rem 1.2rem;
  border-radius: 10px;
  background-color: var(--body-second);
  box-shadow: 0px 25px 50px -12px rgba(118, 81, 170, 0.25);
}
.warranty-card__name {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.warranty-card__content {
  padding-bottom: 2rem;
  margin-bottom: 1.52rem;
  color: var(--sub-text);
  border-bottom: 1px solid var(--body-main);
}
.warranty-card-content__column {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
}
.warranty-card-content__column--progress {
  flex-direction: column;
}
.warranty-card-icon-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100px;
  height: 75px;
  border-radius: 10px;
  background-color: var(--main-purple);
}
.icon--warranty-card {
  position: relative;
  width: 60px;
  height: 60px;
}
.warranty-card-description {
  max-width: calc(100% - 100px - 1rem);
  height: 75px;
}
.warranty-card-description__title {
  display: -webkit-box;
  overflow: hidden;
  margin-bottom: 0.4rem;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  font-size: 0.9rem;
  color: var(--sub-text);
}
.warranty-card-description__text {
  font-size: 0.8rem;
  color: var(--sub-text);
}
.warranty-card-progress {
  width: 100%;
  height: 6px;
  margin-bottom: 1.2rem;
  border-radius: 100px;
  background-color: var(--main-text);
}
.warranty-card-progress__bar {
  position: relative;
  width: 0%;
  height: 100%;
  background-color: var(--main-purple);
  border-radius: 100px;
}
.warranty-card-progress-value-now {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  left: calc(100% - 13px);
  top: -10px;
  width: 26px;
  height: 26px;
  background-color: var(--main-purple);
  border: 3px solid var(--body-second);
  border-radius: 100px;
  text-align: center;
  font-size: 0.8rem;
  z-index: 2;
}
.warranty-card-progress-value-now::before {
  position: absolute;
  content: '';
  top: -4px;
  left: -4px;
  width: 24px;
  height: 24px;
  border-radius: 100px;
  border: 2px solid var(--main-purple);
  z-index: -3;
}
.warranty-card-proggress-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
}
.warranty-card-proggress-info__time {
  color: var(--sub-text);
}
.warranty-card-proggress-info__time--bold {
  font-weight: bold;
}
.warranty-card__options {
  display: flex;
  justify-content: space-between;
}
.warranty-card-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 5px;
  background-color: var(--body-main);
  cursor: pointer;
}
.warranty-card-button:hover {
  transition: var(--easeOutQuart);
  background-color: var(--main-purple);
  box-shadow: var(--smallShadow);
}
</style>
