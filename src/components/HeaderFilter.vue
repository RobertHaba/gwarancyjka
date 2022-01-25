<template>
  <div class="header-filter">
    <div class="header-filter__column">
      <h2 class="header-filter-title">KARTY GWARANCYJNE</h2>
    </div>
    <div class="header-filter__column header-filter__column--sort">
      <div class="header-filter-item">
        <label class="header-filter-item__label" for="search"
          ><span class="icon icon--search icon--show-mobile"></span>
          <span class="header-filter-label-text">Szukaj</span></label
        >
        <ul class="header-filter-item__select">
          <div
            class="header-filter-item-select-title header-filter-item-select-title--search"
            @click="toggleDropdown(selectDataHandler[0])"
            tabindex="0"
          >
            <p>{{ selectDataHandler[0].activeOption.title }}</p>
            <span class="icon icon--arrow-down"></span>
          </div>
          <div
            class="filter-select-option"
            :class="{
              'filter-select-option--active': selectDataHandler[0].show,
            }"
            :id="'filterSelect' + selectDataHandler[0].id"
          >
            <li
              class="filter-item-option"
              :class="{
                'filter-item-option--active':
                  selectItemData.title ===
                  selectDataHandler[0].activeOption.title,
              }"
              tabindex="0"
              v-for="selectItemData in selectDataHandler[0].options"
              @click="selectDataHandler[0].activeOption = selectItemData"
              :key="selectItemData.id"
              :data-filter-value="selectItemData.type"
            >
              <p>{{ selectItemData.title }}</p>
            </li>
          </div>
        </ul>
        <input
          class="header-filter-item__input"
          type="text"
          name="search"
          @keyup.enter="searchFromDB(selectDataHandler[0].activeOption.type)"
          :placeholder="selectDataHandler[0].activeOption.placeholder"
          v-model="searchValue"
        />
      </div>
      <button
        class="button-filter"
        @click="showFiltersInMobile = !showFiltersInMobile"
      >
        <span class="icon icon--filter"></span>
      </button>
      <div class="header-filter-item-wrapper">
        <template
          v-for="selectItemData in selectDataHandler"
          :key="selectItemData.id"
        >
          <HeaderFilterItemSelect
            v-if="selectItemData.id != 'Search'"
            :filterProps="selectItemData"
            class="header-filter-item--toggle"
            :class="[
              showFiltersInMobile
                ? 'header-filter-item--show'
                : 'header-filter-item--hide',
            ]"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import HeaderFilterItemSelect from './HeaderFilterItemSelect.vue';
export default {
  components: {
    HeaderFilterItemSelect,
  },
  data() {
    return {
      searchValue: '',
      activeFilterDropdown: null,
      showFiltersInMobile: false,
      selectDataHandler: [
        {
          id: 'Search',
          title: 'Szukaj',
          show: false,
          subShow: false,
          activeOption: {
            id: 0,
            title: 'Klient',
            type: 'personName',
            placeholder: 'Imię lub nazwisko',
          },
          options: [
            {
              id: 0,
              title: 'Klient',
              type: 'personName',
              placeholder: 'Imię lub nazwisko',
            },
            {
              id: 1,
              title: 'Nazwa',
              type: 'device->>name',
              placeholder: 'Nazwa urządzenia',
            },
            {
              id: 2,
              title: 'Nr karty',
              type: 'id',
              placeholder: 'Numer karty',
            },
            {
              id: 3,
              title: 'SN',
              type: 'device->>sn',
              placeholder: 'Numer seryjny',
            },
          ],
        },
        {
          id: 'Sort',
          title: 'Sortowanie',
          show: false,
          subShow: false,
          activeOption: {
            id: 0,
            title: 'Najnowsze',
            type: 'latest',
            active: true,
          },
          options: [
            {
              id: 0,
              title: 'Najnowsze',
              type: 'latest',
              active: true,
              filterFunction: this.filterByDate,
            },
            {
              id: 1,
              title: 'Najstarsze',
              type: 'oldest',
              filterFunction: this.filterByDate,
            },
            {
              id: 2,
              title: 'Alfabetycznie (A-Z)',
              type: 'alphabetically',
              active: false,
              filterFunction: this.sortByAlphabetically,
            },
            {
              id: 3,
              title: 'Alfabetycznie (Z-A)',
              type: 'reverseAlphabetically',
              active: false,
              filterFunction: this.sortByAlphabetically,
            },
          ],
        },
        {
          id: 'Show',
          title: 'Wyświetl',
          show: false,
          subShow: false,
          activeOption: {
            id: 0,
            title: 'Aktywne',
            type: true,
            filterFunction: this.getCardFromDBByEQ,
          },
          options: [
            {
              id: 0,
              title: 'Aktywne',
              type: true,
              filterFunction: this.getCardFromDBByEQ,
            },
            {
              id: 1,
              title: 'Nieaktywne',
              type: false,
              filterFunction: this.getCardFromDBByEQ,
            },
            {
              id: 2,
              title: 'Wszystkie',
              type: [true, false],
              filterFunction: this.getCardFromDBByEQ,
            },
          ],
        },
      ],
    };
  },
  methods: {
    toggleDropdown(filterSelectItem) {
      if (filterSelectItem.show) {
        filterSelectItem.subShow = true;
      }
      const closeDropdownByClick = () => {
        if (this.activeFilterDropdown && filterSelectItem.show) {
          const optionList = document.getElementById(
            'filterSelect' + this.activeFilterDropdown
          );
          optionList.classList.remove('filter-select-option--active');
          window.removeEventListener('click', closeDropdownByClick);
          this.activeFilterDropdown = null;
          filterSelectItem.show = false;
          filterSelectItem.subShow = false;
        } else if (!filterSelectItem.subShow) {
          filterSelectItem.show = true;
          this.activeFilterDropdown = filterSelectItem.id;
        }
      };
      if (!filterSelectItem.subShow) {
        window.addEventListener('click', closeDropdownByClick);
      }
    },
    async searchFromDB(query) {
      const queryObject = {
        search: query,
        value: this.searchValue,
      };
      this.$store.commit('getSearchDataFromDB', queryObject);
    },
    filterByDate(type) {
      let allWarranty = this.$store.state.allWarrantyData;
      if (type === 'latest') {
        allWarranty.sort((a, b) => {
          return new Date(b.timestamp) - new Date(a.timestamp);
        });
      } else if (type === 'oldest') {
        allWarranty.sort((a, b) => {
          return new Date(a.timestamp) - new Date(b.timestamp);
        });
      }

      this.$store.state.allWarrantyData = allWarranty;
    },
    sortByAlphabetically(type) {
      this.$store.state.allWarrantyData =
        type === 'alphabetically'
          ? this.$store.state.allWarrantyData.sort((a, b) =>
              a.personName < b.personName ? -1 : 1
            )
          : this.$store.state.allWarrantyData.sort((a, b) =>
              a.personName > b.personName ? -1 : 1
            );
    },
    getCardFromDBByEQ(equal) {
      this.$store.commit('updateViewCardType', [equal]);
      let query = {
        length: this.$store.state.cardLimit,
        name: 'active',
        value: [equal],
      };
      this.$store.commit('getDataFromDB', query);
    },
  },
};
</script>

<style>
.icon--show-mobile {
  display: none;
}
.header-filter {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1rem;
  margin: 75px 0;
}
.header-filter__column {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
.header-filter-item {
  display: flex;
  align-items: center;
  padding-left: 1rem;
  height: 35px;
  width: auto;
  border-radius: 10px;
  background-color: var(--main-purple);
  font-size: 0.8rem;
}
.header-filter-item-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
.header-filter-item:hover {
  transition: var(--easeOutQuart);
  background-color: var(--main-purple);
  box-shadow: var(--mainShadow);
}
.header-filter-item--filter {
  background-color: transparent;
  padding: 0 1rem;
  border: 2px solid var(--body-second);
}
.header-filter-item__label {
  position: relative;
  margin-right: 1rem;
  color: var(--sub-text);
}
.header-filter-item__label::before {
  content: '';
  position: absolute;
  top: 50%;
  right: calc(-0.5rem - 1.5px);
  width: 3px;
  height: 3px;
  transform: translateY(-50%);
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.5);
}
.header-filter-item__select {
  position: relative;
  display: flex;
  color: var(--main-text);
  font-weight: bold;
  border: 0;
  cursor: pointer;
}
.header-filter-item-select-title {
  display: flex;
  width: max-content;
  gap: 5px;
}
.header-filter-item-select-title--search {
  margin-right: 0.5rem;
}
.filter-select-option {
  display: none;
}
.filter-select-option--active {
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: 5px;
  top: 2.5rem;
  left: 50%;
  min-width: 160px;
  padding: 1rem;
  transform: translateX(-50%);
  background-color: var(--main-purple);
  border-radius: 10px;
  box-shadow: var(--mainShadow);
  z-index: 99;
}
.header-filter-item__input {
  display: flex;
  height: calc(100% - 4px);
  width: 140px;
  margin-right: 2px;
  padding-left: 0.5rem;
  border: none;
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
  background-color: var(--body-main);
  color: #fff;
  box-sizing: border-box;
  font-family: 'Montserrat';
}
.filter-item-option {
  border-bottom: 1px solid rgba(255, 255, 255, 0);
  font-weight: normal;
  padding: 0.3rem 0;
}
.filter-item-option:hover {
  transition: var(--easeOutQuart);
  border-bottom: 1px solid var(--main-text);
}
.filter-item-option--active {
  font-weight: bold;
}
.button-filter {
  display: none;
}

@media screen and (max-width: 1000px) {
  .icon--show-mobile {
    display: block;
  }
  .header-filter-label-text {
    display: none;
  }
}
@media screen and (max-width: 740px) {
  .header-filter {
    margin: 0 0 35px 0;
  }
  .button-filter {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 35px;
    height: 35px;
    border-radius: 100%;
    background-color: var(--main-purple);
  }
  .header-filter-item {
    grid-row-start: 1;
  }
  .header-filter-item--show {
    display: flex;
    grid-row-start: 2;
  }
  .header-filter-item--hide {
    display: none;
  }
}
</style>
