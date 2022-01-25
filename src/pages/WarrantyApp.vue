<template>
  <section class="app" v-if="appReady">
    <div
      class="app-layout"
      v-if="
        this.$store.state.profileBrandData &&
        !this.$store.state.loadingCards &&
        !this.$store.state.loadingCategories
      "
    >
      <HeaderMenu />
      <HeaderFilter />
      <WarrantyCardList />
      <Alert v-if="this.$store.state.alertData" />
    </div>
    <div v-else>Loading..</div>
  </section>
</template>

<script>
import HeaderMenu from '@/components/HeaderMenu.vue';
import HeaderFilter from '@/components/HeaderFilter.vue';
import WarrantyCardList from '@/components/WarrantyCardList.vue';
import Alert from '@/components/Alert.vue';
import { supabase } from '../supabase/init';
import { ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import axios from 'axios';
export default {
  name: 'warrantyApp',
  components: {
    HeaderMenu,
    HeaderFilter,
    WarrantyCardList,
    Alert,
  },
  mounted() {},
  setup() {
    const user = supabase.auth.user();
    const store = useStore();
    const appReady = ref(false);
    const router = useRouter();
    // If user does not exist, need to make app ready
    if (user) {
      store.commit('setUserAuth', user);
      appReady.value = true;
    }
    // Runs when there is a auth state change
    // if user is logged in, this will fire
    supabase.auth.onAuthStateChange((_, session) => {
      store.commit('setUserAuth', session);
      appReady.value = true;
    });
    const getData = async () => {
      const query = {
        name: 'active',
        value: [true],
        length: 6,
      };
      store.commit('getDataFromDB', query);
      let brandData = null;
      try {
        const { data, error } = await supabase.from('Brand').select('*');
        if (error) throw error;
        brandData = data;
        store.commit('updateBrandDataFromDB', data[0]);
        store.commit('updateProfileLogo', brandData[0].logo);
      } catch (error) {
        router.push({ name: 'FirstLogin' });
        console.log(error);
      }
    };
    const getYear = async () => {
      return await axios
        .get('http://worldclockapi.com/api/json/utc/now')
        .then((res) => {
          store.commit('setTodayDate', res.data.currentDateTime);
          store.commit('setYear', res.data.ordinalDate.split('-')[0]);
        })
        .catch(() => {
          const date = new Date();
          store.commit('setYear', date.getFullYear());
        });
    };

    const getMainTemplateID = async () => {
      try {
        const { data, error } = await supabase
          .from('Templates')
          .select('*')
          .eq('main', true);
        if (error) throw error;
        store.commit('setMainTemplates', data);
      } catch (error) {
        console.log(error);
      }
    };
    const realTimeDBUpdate = () => {
      store.state.realTimeSubscribe = supabase
        .from(`Cards`)
        .on('*', (payload) => {
          store.commit('dataBaseSupscription', payload);
        })
        .subscribe();
    };
    getData();
    getYear();
    getMainTemplateID();
    realTimeDBUpdate();
    return { appReady };
  },
};
</script>
<style scoped>
.app {
  position: relative;
  display: flex;
  justify-content: center;
  width: 100%;
  height: auto;
  padding: 50px;
  background-color: var(--body-main);
}
.app-layout {
  position: relative;
  width: 100%;
  height: 100vh;
}
@media screen and (max-width: 740px) {
  .app {
    padding: 1.5rem;
    padding-bottom: 0;
    overflow: auto;
  }
}

</style>
