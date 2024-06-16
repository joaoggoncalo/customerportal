<template>
  <h3>Invoices</h3></template>

<script>
import {useTenantStore} from "@/stores/tenantStore";
import {computed, onMounted} from "vue";
import {useFavicon} from "@vueuse/core";

export default {
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