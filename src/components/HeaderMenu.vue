<template>
  <div>
    <header class="header">
      <div class="header-item header-logo" v-show="!scrollStart">
        <img
          class="header-logo__img"
          src="../assets/logo.svg"
          alt="Logo Gwarancyjka"
        />
        <h1 class="header-logo__title">Gwarancyjka</h1>
      </div>
      <nav class="header-item header-menu">
        <MenuItem
          v-for="menuItemData in menuItemsData"
          :key="menuItemData.id"
          :class="menuItemData.class"
          :text="menuItemData.text"
          :icon="menuItemData.icon"
          @click="openModal(menuItemData.id)"
        />
        <div
          class="header-menu__user-logo user-logo"
          @click="toggleDropdown()"
          @keypress.enter="showDropdown = !showDropdown"
          tabindex="0"
        >
          <span class="user-logo__letter">{{ firsLetterFromEmail }}</span>
          <ul class="header-menu-dropdown-list" v-show="showDropdown">
            <li class="header-menu-dropdown-list__item">
              <button
                class="dropdown-button"
                @click="this.$store.commit('signOut', this.$router)"
              >
                Wyloguj
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </header>

    <Modal
      :modalProps="modalData[0]"
      v-show="modalData[0].show"
      :closeModal="closeModal"
    /><Modal
      :modalProps="modalData[1]"
      v-show="modalData[1].show"
      :closeModal="closeModal"
    /><Modal
      :modalProps="modalData[2]"
      v-if="modalData[2].show"
      :closeModal="closeModal"
    />
  </div>
</template>

<script>
import MenuItem from './HeaderMenuItem.vue';
import Modal from './Modal.vue';
export default {
  components: {
    MenuItem,
    Modal,
  },
  computed: {
    firsLetterFromEmail() {
      return this.$store.state.profileBrandData.name.charAt(0);
    },
  },
  data() {
    return {
      menuItemsData: [
        {
          id: 0,
          text: 'Dodaj',
          class: 'header-menu__button--special',
          icon: 'icon--add',
        },
        {
          id: 1,
          text: 'Szablony',
          icon: 'icon--template',
        },
        {
          id: 2,
          text: 'Ustawienia',
          icon: 'icon--settings',
        },
      ],
      modalData: [
        {
          title: 'Dodaj nową kartę gwarancyjną',
          id: 0,
          component: 'ModalWarrantyBody',
          show: false,
          nav: {
            title: 'Szablony',
            items: this.$store.getters.sortedCategories,
          },
          warrantyData: {
            personName: '',
            device: {
              brand: '',
              model: '',
              sn: '',
              date: {
                months: '',
                start: '',
                finish: '',
              },
              category: null,
              price: '',
            },
          },
        },
        {
          title: 'Edytuj szablon',
          id: 1,
          component: 'ModalTemplateBody',
          show: false,
          nav: {
            title: 'Szablony',
            items: this.$store.getters.sortedCategories,
          },
        },
        {
          title: 'Personalizacja',
          id: 2,
          component: 'ModalSettingsBody',
          show: false,
          nav: {
            title: 'Ustawienia',
            items: [
              {
                title: 'Dane firmy',
                uuid: '1',
                default: false,
              },
            ],
          },
        },
      ],
      showDropdown: false,
      subShowDropdown: false,
      scrollStart: false,
    };
  },
  methods: {
    openModal(id) {
      this.modalData[id].show = true;
    },
    closeModal(id) {
      this.modalData[id].show = false;
    },
    toggleDropdown() {
      if (this.showDropdown) {
        this.subShowDropdown = true;
      }
      const closeDropdownByClick = () => {
        if (this.showDropdown) {
          this.showDropdown = false;
          this.subShowDropdown = false;
          window.removeEventListener('click', closeDropdownByClick);
        } else if (!this.subShowDropdown) {
          this.showDropdown = true;
        }
      };
      if (!this.subShowDropdown) {
        window.addEventListener('click', closeDropdownByClick);
      }
    },
  },
};
</script>

<style scoped>
.header {
  position: relative;
  display: flex;
  width: 100%;
  height: 75px;
}
.header-item {
  display: flex;
  align-items: center;
  padding: 0 25px;
  border-radius: 10px;
  background-color: var(--body-second);
}
.header-logo {
  margin-right: 50px;
}
.header-logo__title {
  text-transform: uppercase;
}
.header-logo__title::first-letter {
  color: var(--light-purple);
}
.header-menu {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  gap: 15px;
}
.header-menu__user-logo {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  border-radius: 100%;
  background-color: var(--main-purple);
  cursor: pointer;
}
.user-logo__letter {
  font-weight: bold;
  font-size: 1.4rem;
}
.header-menu-dropdown-list {
  position: absolute;
  top: calc(100% + 0.5rem);
  border-radius: 10px;
  background-color: var(--main-purple);
  background-color: var(--main-purple);
  box-shadow: var(--smallShadow);
  cursor: pointer;
}
.header-menu-dropdown-list:hover {
  transition: var(--easeOutQuart);
  background-color: var(--main-purple);
  box-shadow: var(--mainShadow);
}
.dropdown-button {
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  background-color: unset;
  cursor: pointer;
}
@media screen and (max-width: 740px) {
  .header {
    position: fixed;
    justify-content: center;
    bottom: 0;
    left: 0;
    display: grid;
    grid-template-columns: 40px 1fr;
    width: 100vw;
    height: 60px;
    padding: 0 25px;
    z-index: 10;
    background-color: var(--body-second);
    box-shadow: var(--smallShadowReverse);
  }
  .header-menu-dropdown-list {
    top: calc(-100% - 0.5rem);
  }
  .header-logo,
  .header-menu {
    width: 100%;
    height: 100%;
    border-radius: 0;
    padding: 0;
  }
  .header-logo__img {
    max-width: 40px;
  }
  .header-logo__title {
    display: none;
  }
}
</style>
