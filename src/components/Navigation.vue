<template>
  <nav>
    <v-navigation-drawer v-model="drawer" color="white">
      <v-row no-gutters>
        <v-col class="mt-6 text-center">
          <v-img v-bind:src="logo" alt="logo"></v-img>
        </v-col>
      </v-row>

      <v-list v-if="permittedPages" v-bind:color="primary_color">
        <v-list-item
            v-for="link in permittedPages"
            :key="link.text"
            router
            :to="link.route">
          <v-list-item-action class="active">
            <v-icon color="grey-darken-3" class="mx-3">{{ link.icon }}</v-icon>
            <v-list-item-title color="grey-darken-3">{{ $t(link.textKey) }}</v-list-item-title>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-toolbar v-bind:color="primary_color">
      <v-app-bar-nav-icon :class="`${colorCalculation(primary_color)}`" @click="drawer = !drawer">
      </v-app-bar-nav-icon>

      <v-toolbar-title :class="`${colorCalculation(primary_color)}`">
        <span class="font-weight-light">{{ $t('welcomeMessage') }}</span>
      </v-toolbar-title>


      <v-menu id="activeRelation" location="bottom">
        <template v-slot:activator="{ props }">
          <v-btn variant="flat" v-bind:color="primary_color" :class="`${colorCalculation(primary_color)}`" size="small"
                 v-bind="props">
            <span v-if="activeRelation" class="d-none d-sm-flex ma-2">{{ activeRelation.name }}</span>
            <v-icon class="ma-1">mdi-account-switch-outline</v-icon>
          </v-btn>
        </template>
        <v-list-item class="bg-white border" v-for="(item, index) in relations" :key="index"
                     @click="selectRelation(item)">
          <v-list-item-title>{{ item.name }}</v-list-item-title>
        </v-list-item>
      </v-menu>


      <v-menu id="activeLanguage" location="bottom">
        <template v-slot:activator="{ props }">
          <v-btn variant="flat" v-bind:color="primary_color" :class="`${colorCalculation(primary_color)}`" size="small"
                 v-bind="props">
            <span class=" d-none d-sm-flex ma-2">{{ $t('active_language') }} </span>
            <v-icon class="ma-1">mdi-translate</v-icon>
          </v-btn>
        </template>
        <v-list-item class="bg-white border" v-for="language in languages" :key="language.code"
                     @click="changeLanguage(language.code)">
          <v-list-item-title>{{ language.title }}</v-list-item-title>
        </v-list-item>

      </v-menu>


      <v-btn id="logoutButton" v-bind:color="primary_color" :class="`${colorCalculation(primary_color)}`" :key="logout" router
             :to="loginRoute">
        <span class="d-none d-sm-flex" @click="logout()">{{ $t('signOut') }}</span>
        <v-icon>mdi-exit-to-app</v-icon>
      </v-btn>
    </v-toolbar>
  </nav>
</template>

<script>

import {useActiveRelationStore} from '@/stores/activeRelationStore.js';
import {ref} from "vue";
import {useUserRelationsStore} from "@/stores/userRelationsStore";
import {useUserStore} from "@/stores/userStore";
import {useTenantStore} from '../stores/tenantStore';
import {calculateTextColor} from "@/text-color";
// import mixins from "@/stores/mixins";

export default {
  setup() {
    const relationsStore = useUserRelationsStore();
    const tenantStore = useTenantStore();
    const userStore = useUserStore();
    const activeRelationStore = useActiveRelationStore();

    return {
      userStore,
      activeRelationStore,
      relationsStore,
      tenantStore
    }
  },
  data() {
    return {
      drawer: true,
      languages: [
        {title: 'English', code: 'en'},
        {title: 'Nederlands', code: 'nl'},
      ],
      pages: [
        {icon: "mdi-view-dashboard", textKey: "dashboard", route: "/account/dashboard"},
        {icon: "mdi-account", textKey: "profile", route: "/account/profile"},
        {icon: "mdi-clipboard-text", textKey: "tickets", route: "/account/tickets", permission: "customer:ticket:show"},
        {icon: "mdi-receipt", textKey: "invoices", route: "/account/invoices", permission: "customer:invoice:show"},
        {
          icon: "mdi-toolbox-outline",
          textKey: "services",
          route: "/account/services",
          permission: "customer:service:show"
        },
        {icon: "mdi-account-group", textKey: "team", route: "/account/teams", permission: "customer:team:show"}
      ],
      loginRoute: "/"
    };
  },
  methods: {
    changeLanguage(lang) {
      this.$i18n.locale = lang;
    },
    colorCalculation(theColor) {
      return calculateTextColor(theColor);
    },
    selectRelation(relation) {
      const activeRelationStoreRef = ref(this.activeRelationStore);
      activeRelationStoreRef.value.setActiveRelation(relation);
      window.location.reload();
    },
    logout() {
      this.activeRelationStore.removeActiveRelation();
      this.relationsStore.removeUserRelations();
      this.userStore.removeToken();
    },
  },
  computed: {
    permittedPages() {
      let activePermissions = "";
      if (this.activeRelation && this.activeRelation.permissions) {
        activePermissions = this.activeRelation.permissions;
      }
      return this.pages.filter((page) => activePermissions.includes(page.permission) || !page.permission);
    },
    activeRelation() {
      const activeRelationStoreRef = ref(this.activeRelationStore);
      return activeRelationStoreRef.value.getActiveRelation; // always up to date
    },
    relations() {
      const relationStoreRef = ref(this.relationsStore);
      return relationStoreRef.value.getUserRelations;
    },
    logo() {
      return this.tenantStore.tenant.settings.logo
    },

    accent_color() {
      return this.tenantStore.tenant.settings.accent_color
    },

    primary_color() {
      return this.tenantStore.tenant.settings.primary_color
    }
  }
};

</script>

<style scoped>

</style>
