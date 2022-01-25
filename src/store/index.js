import { createStore } from 'vuex';
import { reactive } from 'vue';
import { supabase } from '../supabase/init';
export const store = reactive({
  user: null,
});
export default createStore({
  state() {
    return {
      user: false,
      allWarrantyData: [],
      searchWarrantyData: [],
      mainTemplates: [],
      categories: [],
      year: '',
      profileBrandData: null,
      realTimeSubscribe: undefined,
      update: 0,
      cardLimit: 6,
      allCardsInDBLength: null,
      today: null,
      loadingCards: true,
      loadingCategories: true,
      viewCardType: [true],
      alertData: null,
      printPageData: null,
    };
  },
  getters: {
    sortedCategories: (state) => {
      return state.categories.sort((a, b) => a.title.localeCompare(b.title));
    },
  },
  mutations: {
    setUserAuth(state, authData) {
      state.user = authData;
    },
    async signOut(state,router) {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        router.push('/login');
      } catch (error) {
        console.log(error);
      }
    },
    async getDataFromDB(state, query) {
      try {
        const { data, error } = await supabase
          .from('Cards')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(query.length)
          .in(query.name, query.value);
        if (error) throw error;
        state.loadingCards = false;
        state.allWarrantyData = data;
      } catch (error) {
        console.log(error);
      }
      this.commit('setDBCardsLength', query);
    },
    updateViewCardType(state, type) {
      state.viewCardType = type;
    },
    updateCardLimit(state, length) {
      state.cardLimit += length;
    },
    async getSearchDataFromDB(state, query) {
      if (query.value) {
        try {
          const { data, error } = await supabase
            .from('Cards')
            .select('*')
            .textSearch(query.search, query.value, {
              config: 'english',
              type: 'phrase',
            });
          if (error) throw error;
          if (data.length > 0) {
            state.searchWarrantyData = data;
          } else if (data.length === 0 && query.value !== '') {
            state.searchWarrantyData = 'empty';
          }
        } catch (error) {
          console.log(error);
        }
      } else {
        state.searchWarrantyData = null;
      }
    },
    updateBrandDataFromDB(state, brandDB) {
      state.profileBrandData = brandDB;
    },
    async updateProfileLogo(state, path) {
      try {
        const { data, error } = await supabase.storage
          .from('image')
          .download(path);
        if (error) throw error;
        console.dir(data);
        state.profileBrandData.logo = URL.createObjectURL(data);
      } catch (error) {
        console.log(error);
      }
    },
    setMainTemplates(state, templates) {
      state.mainTemplates = templates;
      state.categories = [];
      this.commit('setCategories');
    },
    updateTemplates(state, template) {
      state.mainTemplates.find((oldTemplate) => {
        if (oldTemplate.uuid === template.uuid) {
          return template;
        }
      });
    },
    setCategories(state) {
      state.mainTemplates.forEach((template) => {
        state.categories.push({
          title: template.category,
          default: template.default,
          uuid: template.uuid,
        });
      });
      state.loadingCategories = false;
    },
    updateCategories(state, template) {
      state.categories.forEach((category) => {
        if (category.uuid === template.uuid) {
          category.title = template.category;
        }
      });
      state.mainTemplates.forEach((templateItem) => {
        if (templateItem.uuid === template.uuid) {
          templateItem.title = template.category;
        }
      });
    },
    updateDeafultCategory(state, template) {
      state.update++;
      state.mainTemplates.forEach((templateItem) => {
        if (templateItem.uuid === template.uuid) {
          templateItem.default = true;
        } else {
          templateItem.default = false;
        }
      });
      state.categories.forEach((categoryItem) => {
        if (categoryItem.uuid === template.uuid) {
          categoryItem.default = true;
        } else {
          categoryItem.default = false;
        }
      });
    },
    async setDBCardsLength(state, query) {
      try {
        const { data, error } = await supabase
          .from('Cards')
          .select('active')
          .in(query.name, query.value);
        if (error) throw error;
        state.allCardsInDBLength = data.length;
      } catch (error) {
        console.log(error);
      }
    },
    setYear(state, newYear) {
      state.year = newYear;
    },
    setTodayDate(state, today) {
      state.today = today;
    },
    changeAlertData(state, data) {
      state.alertData = data;
    },
    setPrintPageData(state, data) {
      state.printPageData = data;
    },
    dataBaseSupscription(state, payload) {
      if (payload.eventType === 'INSERT') {
        state.allWarrantyData.unshift(payload.new);
        state.allCardsInDBLength++;
      } else if (payload.eventType === 'DELETE') {
        state.allWarrantyData = state.allWarrantyData.filter(
          (item) => item.uuid !== payload.old.uuid
        );
        state.allCardsInDBLength--;
      } else if (payload.eventType === 'UPDATE') {
        state.allWarrantyData.forEach((item, i) => {
          if (item.uuid === payload.old.uuid) {
            state.allWarrantyData[i] = payload.new;
          }
        });
      }
    },
  },
});
