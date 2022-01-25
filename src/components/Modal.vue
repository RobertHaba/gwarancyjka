<template>
  <div class="modal" @click.self="closeModal(modalData.id)">
    <div class="modal-dialog">
      <div class="modal-dialog-content modal-dialog-nav">
        <h3 class="modal-dialog-nav-title">{{ modalData.nav.title }}:</h3>
        <ul class="modal-dialog-nav-list">
          <li
            class="modal-dialog-nav-list-item"
            v-for="navItem in categories"
            :key="navItem.id"
          >
            <button
              class="modal-button modal-dialog-nav-button"
              tabindex="0"
              @click="changeCategory(navItem)"
              :class="{
                'modal-button--active': category.uuid == navItem.uuid,
              }"
            >
              <span
                class="icon icon--template"
                v-if="
                  modalData.warrantyData &&
                  navItem.uuid === modalData.warrantyData.templateID
                "
              ></span>
              {{ navItem.title }}
            </button>
          </li>
        </ul>
      </div>
      <div class="modal-dialog-content modal-dialog-body">
        <div class="modal-dialog-body-header">
          <div class="modal-dialog-icon-wrapper">
            <span class="icon icon--add-page"></span>
          </div>
          <h3 class="modal-dialog-body-header__title">{{ modalData.title }}</h3>
          <button class="modal-dialog-close" @click="closeModal(modalData.id)">
            <span class="icon icon--close"></span>
          </button>
        </div>
        <component
          :is="modalData.component"
          :modalProps="modalData"
          :activeCategory="category"
          :closeModal="closeModal"
          :forceRerenderComponent="forceRerender"
          :key="componentKey"
        ></component>
      </div>
    </div>
  </div>
</template>

<script>
import ModalWarrantyBody from './ModalAddWarrantyBody.vue';
import ModalSettingsBody from './ModalSettingsBody.vue';
import ModalTemplateBody from './ModalTemplateBody.vue';
export default {
  props: {
    modalProps: Object,
    closeModal: Function,
    loadFromData: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      modalData: this.modalProps,
      componentKey: 0,
      category: {},
      categories: [...this.$store.getters.sortedCategories],
    };
  },
  components: {
    ModalWarrantyBody,
    ModalSettingsBody,
    ModalTemplateBody,
  },
  methods: {
    forceRerender() {
      this.componentKey += 1;
    },
    changeCategory(category) {
      const defaultCategory = this.categories.find(
        (categoryItem) => categoryItem.default
      );
      if (this.loadFromData) {
        this.category.title = category
          ? category.title
          : this.modalData.warrantyData.device.category;
        this.category.uuid = category
          ? category.uuid
          : this.modalData.warrantyData.templateID;
        this.category.default = category ? category.default : false;
        if (!category) {
          const categoryExist = this.$store.getters.sortedCategories.find(
            (categoryItem) => categoryItem.uuid === this.category.uuid
          );
          if (!categoryExist) {
            this.categories[this.$store.state.categories.length] = {
              ...this.category,
            };
          }
        }
      } else if (this.modalData.component === 'ModalWarrantyBody') {
        this.category = category ? category : defaultCategory;
      } else if (this.modalData.component === 'ModalSettingsBody') {
        this.category = category ? category : this.modalData.nav.items[0];
        this.categories = this.modalData.nav.items;
      } else if (this.modalData.component === 'ModalTemplateBody') {
        this.category = category ? category : defaultCategory;
      }
    },
  },
  watch: {
    '$store.state.update': function () {
      this.changeCategory();
    },
  },
  mounted() {
    this.changeCategory();
  },
};
</script>

<style scoped>
.icon-template {
  background-image: url('../assets/icons/template.svg');
}
.modal {
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  background-color: rgba(65, 65, 89, 0.9);
  z-index: 999;
}
.modal-dialog {
  width: 100%;
  max-width: 720px;
  height: 600px;
}
.modal-dialog-content {
  position: relative;
  display: flex;
  background-color: var(--body-main);
  border-radius: 10px;
  padding: 0 25px;
  box-shadow: var(--lightShadow);
}
.modal-dialog-nav {
  align-items: center;
  gap: 1rem;
  height: 70px;
  margin-bottom: 25px;
  overflow-x: auto;
}
.modal-dialog-nav-list {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: max-content;
  align-items: center;
  width: 100%;
  gap: 0.7rem;
  overflow-x: auto;
  height: calc(100% - 1rem);
  max-height: 100%;
}
.modal-dialog-nav-list-item {
  display: flex;
  height: 30px;
}
.modal-dialog-body {
  display: flex;
  flex-direction: column;
  height: calc(100% - 95px);
}
.modal-dialog-body-header {
  display: grid;
  grid-template-columns: 40px 1fr 40px;
  grid-gap: 0.5rem;
  align-items: center;
  width: 100%;
  padding: 25px 0;
  border-bottom: 1px solid var(--main-purple);
}
.modal-dialog-body-header__title {
  font-size: 1.3rem;
}
.modal-dialog-icon-wrapper,
.modal-dialog-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  margin-right: 1rem;
  background-color: var(--body-second);
  border-radius: 40px;
}
.modal-dialog-close {
  font-size: 0.9rem;
  margin-right: 0;
  margin-left: auto;
  cursor: pointer;
}

@media screen and (max-width: 740px) {
  .modal-dialog {
    height: 100%;
    max-width: 100%;
  }
  .modal-dialog-content {
    border-radius: 0;
  }
}
@media screen and (max-width: 500px) {
  .modal-dialog-body-header__title{
    font-size: 1.1rem;
    text-align: center;
  }
}
</style>
