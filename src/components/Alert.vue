<template>
  <div class="alert">
    <div class="alert-header">
      <span class="icon icon--big" :class="'icon--' + alert.type"></span>
      <h2 class="alert-header__title">{{ alert.title }}</h2>
    </div>
    <div class="alert-body">
      <p>
        {{ alert.text }}
      </p>
    </div>
    <div class="alert-footer" v-if="alert.type == 'info'">
      <button
        class="alert-button"
        v-for="button in alert.options"
        :key="button"
        :class="'alert-button--' + button.type"
        @click="
          button.functionName
            ? (button.functionName(), closeAlert())
            : closeAlert()
        "
      >
        <span class="icon" :class="buttonClass(button.type)"></span
        >{{ button.text }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    closeAlertFromParent: Function,
    alertData: Object,
  },
  data() {
    return {
      alert: this.$store.state.alertData,
      timer: null,
    };
  },
  methods: {
    buttonClass: (type) => {
      return type == 'negative'
        ? `icon--${type} icon--color-reverse`
        : `icon--${type}`;
    },
    startTimerForClose() {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.closeAlert();
      }, this.alert.time);
    },
    closeAlert() {
      clearTimeout(this.timer);
      this.$store.commit('changeAlertData', null);
    },
  },
  mounted() {
    this.startTimerForClose();
  },
};
</script>

<style scoped>
.icon--big {
  width: 24px;
  height: 24px;
}
.alert {
  position: fixed;
  z-index: 999999;
  top: 50px;
  right: 50px;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  width: 100%;
  max-width: 330px;
  height: auto;
  padding: 1.5rem;
  background-color: var(--main-purple);
  border-radius: 10px;
  box-shadow: var(--mainShadow);
}
.alert-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.alert-header__title {
  font-weight: bold;
  font-size: 18px;
}
.alert-footer {
  display: flex;
  gap: 1rem;
}
.alert-button {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.4rem 1.2rem;
  border-radius: 10px;
  cursor: pointer;
  border: 2px solid rgba(0, 0, 0, 0);
}
.alert-button:hover {
  color: #fff;
  border: 2px solid var(--body-second);
  transition: var(--easeOutQuart);
  background-color: var(--main-purple);
  box-shadow: var(--smallShadow);
}
.alert-button--negative:hover .icon {
  filter: none;
}
.alert-button--positive {
  background-color: var(--body-second);
}
.alert-button--negative {
  background-color: #fff;
  color: var(--body-main);
}
@media print {
  .alert {
    z-index: 0;
    overflow: hidden;
  }
}

@media screen and (max-width: 740px) {
  .alert {
    left:50%;
    transform: translateX(-50%);
  }
}
</style>
