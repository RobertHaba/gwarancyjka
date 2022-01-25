<template>
  <div class="header-filter-item header-filter-item--filter">
    <label class="header-filter-item__label" :for="selectItemData.title"
      ><span
        class="icon icon--show-mobile"
        :class="'icon--' + selectItemData.id.toLowerCase()"
      ></span>
      <span class="header-filter-label-text">{{
        selectItemData.title
      }}</span></label
    >
    <ul class="header-filter-item__select">
      <div
        class="header-filter-item-select-title"
        @click="toggleDropdown(selectItemData)"
        tabindex="0"
      >
        <p>{{ selectItemData.activeOption.title }}</p>
        <span class="icon icon--arrow-down"></span>
      </div>
      <div
        class="filter-select-option"
        :class="{ 'filter-select-option--active': selectItemData.show }"
        :id="'filterSelect' + selectItemData.id"
      >
        <li
          class="filter-item-option"
          :class="{
            'filter-item-option--active':
              selectItemData.title === selectItemData.activeOption.title,
          }"
          tabindex="0"
          v-for="itemData in selectItemData.options"
          @click="
            (selectItemData.activeOption = itemData),
              itemData.filterFunction(itemData.type)
          "
          :key="itemData.id"
          :data-filter-value="itemData.type"
        >
          <p>{{ itemData.title }}</p>
        </li>
      </div>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    filterProps: Object,
  },
  data() {
    return {
      activeDropdown: null,
      selectItemData: this.filterProps,
    };
  },
  methods: {
    toggleDropdown(filterSelectItem) {
      if (filterSelectItem.show) {
        filterSelectItem.subShow = true;
      }
      const closeDropdownByClick = () => {
        if (this.activeDropdown && filterSelectItem.show) {
          const optionList = document.getElementById(
            'filterSelect' + this.activeDropdown
          );
          optionList.classList.remove('filter-select-option--active');
          window.removeEventListener('click', closeDropdownByClick);
          this.activeDropdown = null;
          filterSelectItem.show = false;
          filterSelectItem.subShow = false;
        } else if (!filterSelectItem.subShow) {
          filterSelectItem.show = true;
          this.activeDropdown = filterSelectItem.id;
        }
      };
      if (!filterSelectItem.subShow) {
        window.addEventListener('click', closeDropdownByClick);
      }
    },
  },
};
</script>

<style></style>
