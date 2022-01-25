<template>
  <button class="header-menu__item header-menu__button">
    <span class="icon" :class="icon"></span>
    <span class="button-text" v-if="text">{{ text }}</span>
  </button>
</template>

<script>
export default {
  props: {
    text: String,
    icon: String,
  },
};
</script>
<style>
.header-menu__item {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  cursor: pointer;
}
.header-menu__button {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0;
  background-color: var(--body-second);
  border: 1px solid rgba(0, 0, 0, 0);
  padding: 0.5rem 0.8rem;
}
.header-menu__button:hover {
  transition: var(--easeOutQuart);
  background-color: var(--main-purple);
  border: 1px solid var(--main-purple);
  box-shadow: var(--smallShadow);
}
.header-menu__button--special {
  padding: 0.5rem 1.6rem;
  background-color: var(--main-purple);
}
.header-menu__button--special:hover {
  transition: var(--easeOutQuart);
  background-color: var(--body-second);
  border: 1px solid var(--main-purple);
}
.icon-add {
  background-image: url('../assets/icons/add.svg') !important;
}
.header-menu__item--account .icon {
  width: 2rem;
  height: 2rem;
  border-radius: 100px;
}
.header-menu__item--account .icon-add {
  background-image: url('../assets/icons/user.png') !important;
}
.icon-template {
  background-image: url('../assets/icons/template.svg');
}
@media screen and (max-width: 1000px) {
  .button-text {
    display: none;
  }
  .header-menu__button,
  .header-menu__button--special {
    padding: 0.8rem;
    border-radius: 100%;
  }
}
</style>
