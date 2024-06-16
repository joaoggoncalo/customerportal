<template>
  <Navigation/>
  <div class="account ma-5">
    <router-view></router-view>

  </div>
</template>

<script>
import Navigation from '../components/Navigation.vue';
import {useTenantStore} from "@/stores/tenantStore";
import {computed, onMounted} from "vue";
import {useFavicon} from "@vueuse/core";
export default {
  components: {Navigation},
  setup() {
    const tenantStore = useTenantStore();
    const favicon = tenantStore.tenant.settings.favicon;

    onMounted(() => useFavicon(computed(() => tenantStore.tenant.settings.favicon).value));

    return {
      favicon
    }
  }
}
</script>

<style>
</style>
