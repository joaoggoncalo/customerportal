<template>
  <div>
    <div v-if="isLoading" class="loading-overlay">
      <v-progress-circular indeterminate v-bind:color="primary_color"></v-progress-circular>
      <p> Processing your data...</p>
    </div>
    <v-app :style="{backgroundColor: primary_color}" v-if="!isLoading">
      <v-container class="d-flex align-center justify-center fill-height">
        <v-avatar class="circle" :style="getCircleStyle(200, { top: '-5%', left: '-5%' }, { fill: true, fillColor: accent_color})"></v-avatar>
        <v-avatar class="circle" :style="getCircleStyle(150, { bottom: '20%', right: '10%' }, { fill: true, fillColor: accent_color})"></v-avatar>
        <v-avatar class="circle" :style="getCircleStyle(300, { bottom: '10%', right: '60%' }, { fill: false, border: true, borderColor: accent_color})"></v-avatar>
        <v-avatar class="circle" :style="getCircleStyle(300, { bottom: '-5%', right: '-5%' }, { fill: false, border: true, borderColor: accent_color })"></v-avatar>
        <v-avatar class="circle" :style="getCircleStyle(100, { bottom: '70%', right: '40%' }, { fill: false, border: true, borderColor: accent_color })"></v-avatar>

        <v-card rounded="lg" class="pa-6">
          <v-img v-bind:src="logo" alt="logo"></v-img>
          <v-card-title class="text-center" :style="{color: primary_color}">Log in with one of the providers:</v-card-title>
          <p v-if="errorMessage" class="errorText text-center text-red-lighten-1">{{ errorMessage }}</p>
          <v-card-actions class="justify-center">
            <div>
              <v-btn id="google-login-btn" size="x-large" v-bind:color="primary_color" variant="outlined" icon="mdi-google" @click="loginGoogle">
                <v-icon size="x-large" icon="mdi-google"></v-icon>
              </v-btn>

              <v-btn id="microsoft-login-btn" style="margin: 25px" size="x-large" v-bind:color="primary_color" variant="outlined" icon="mdi-microsoft-windows" @click="loginMicrosoft">
                <v-icon size="x-large" icon="mdi-microsoft-windows"></v-icon>
              </v-btn>
            </div>
          </v-card-actions>

        </v-card>
      </v-container>
    </v-app>
  </div>
</template>

<script>
import {ref, inject, onMounted, computed} from 'vue';
import {useRouter} from "vue-router";
import {useActiveRelationStore} from '../stores/activeRelationStore'
import {useUserStore} from '../stores/userStore.js'
import {useTenantStore} from '../stores/tenantStore';
import {useUserRelationsStore} from "../stores/userRelationsStore";
import {useFavicon} from "@vueuse/core";

export default {
  name: 'LoginPage',
  setup() {
    const tenantData = ref(null);
    const googleUserManager = inject('googleUserManager');
    const microsoftUserManager = inject('microsoftUserManager');
    const user = ref(null);
    const router = useRouter();
    const userRelations = useUserRelationsStore();
    const activeRelationStore = useActiveRelationStore();
    const userStore = useUserStore();
    const tenantStore = useTenantStore();
    const errorMessage = ref("");
    const isLoading = ref(false);
    const designSettings = computed(() => {
      if(tenantStore.tenant && tenantStore.tenant.settings) {
        const logo = tenantStore.tenant.settings.logo;
        const accent_color = tenantStore.tenant.settings.accent_color;
        const primary_color = tenantStore.tenant.settings.primary_color;
        return { logo, accent_color, primary_color };
      } else {
        return { logo: "", accent_color: "", primary_color: "" };
      }
    });

    const { logo, accent_color, primary_color } = designSettings.value;

    onMounted(() => initializePage(tenantStore, googleUserManager, microsoftUserManager, user, router, userStore, activeRelationStore, userRelations, errorMessage));

    return {
      loginGoogle: () => googleUserManager.signinRedirect(),
      loginMicrosoft: () => loginMicrosoftUser(microsoftUserManager, userStore, router, errorMessage),
      getCircleStyle: (size, position, options = {}) => getCircleStyle(size, position, accent_color, options),
      user,
      accent_color,
      primary_color,
      logo,
      errorMessage,
      isLoading,
    };

    function extractDesignSettings(tenantStore) {
      const logo = tenantStore.tenant.settings.logo;
      const accent_color = tenantStore.tenant.settings.accent_color;
      const primary_color = tenantStore.tenant.settings.primary_color;
      return { logo, accent_color, primary_color };
    }

    function computeLogoUrl(tenantStore) {
      return computed(() => {
        if (tenantStore.tenant.value && tenantStore.tenant.value.settings && tenantStore.tenant.value.settings.logo) {
          return tenantStore.tenant.value.settings.logo;
        }
        return "";
      });
    }

    function getCircleStyle(size, position, accent_color, options) {
      const { fill = true, fillColor = accent_color, border = true, borderColor = accent_color } = options;
      const style = {
        width: `${size}px`,
        height: `${size}px`,
        ...position,
      };

      if (fill) {
        style.background = fillColor;
      }
      if (border) {
        style.border = `2px solid ${borderColor}`;
      }
      return style;
    }

    async function initializePage(tenantStore, googleUserManager, microsoftUserManager, user, router, userStore, activeRelationStore, userRelations, errorMessage ) {
      await getTenantDesign(tenantStore);
      getUser(googleUserManager, microsoftUserManager, user);
      handleLoginRedirects(router, googleUserManager, userStore, activeRelationStore, userRelations, errorMessage);
    }

    async function getTenantDesign(tenantStore) {
      const response = await fetch(`https://cube-testing.solidpartners.nl/cp/getTenant/localhost`);
      tenantData.value = await handleResponse(response);
      tenantStore.setTenant(tenantData.value);
      useFavicon(computed(() => tenantStore.tenant.settings.favicon).value);
    }

    async function getUser(googleUserManager, microsoftUserManager, user) {
      googleUserManager.getUser().then(u => user.value = u);
      microsoftUserManager.getUser().then(u => user.value = u);
    }

    function handleLoginRedirects(router, googleUserManager, userStore, activeRelationStore, userRelations, errorMessage) {
      if (window.location.href.indexOf('code=') > -1 && window.location.href.indexOf('state=') > -1 && window.location.href.indexOf('google') > -1) {
        isLoading.value = true;
        googleUserManager.signinRedirectCallback().then(loggedInUser => handleGoogleLogin(loggedInUser, router, userStore, activeRelationStore, userRelations, errorMessage));
      }
    }

    async function handleGoogleLogin(loggedInUser, router, userStore, activeRelationStore, userRelations, errorMessage) {
      if (loggedInUser) {
        const responseData = await performGoogleLogin(loggedInUser, errorMessage);
        processLoginResponse(responseData, router, userStore, activeRelationStore, userRelations);
      }
    }

    async function performGoogleLogin(loggedInUser, errorMessage) {
      const googleData = getGoogleData(loggedInUser);
      const tokenGoogle = await fetch('https://cube-testing.solidpartners.nl/cp/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(googleData)
      });

      return await handleResponse(tokenGoogle, errorMessage);
    }

    function getGoogleData(loggedInUser) {
      console.log(loggedInUser.access_token);
      return {
        ap: "google",
        token: loggedInUser.access_token,
        email: loggedInUser.profile.email
      };
    }

    function processLoginResponse(responseData, router, userStore, activeRelationStore, userRelations) {
      if(responseData) {
        storeLoginData(responseData, userStore, activeRelationStore, userRelations);
        navigateToDashboard(userStore, router);
      }
    }

    function storeLoginData(responseData, userStore, activeRelationStore, userRelations) {
      const newRelations = responseData.relations.map(relation => ({
        id: relation.id,
        name: relation.name,
        permissions: relation.permissions
      }));

      userStore.setToken(responseData.token);
      activeRelationStore.setActiveRelation(newRelations[0]);
      userRelations.setUserRelations(newRelations);
    }

    function navigateToDashboard(userStore, router) {
      if (userStore.getToken) {
        router.push('/account/dashboard');
        isLoading.value = false;
      }
    }

    async function loginMicrosoftUser(microsoftUserManager, userStore, router, errorMessage) {
      isLoading.value = true;
      try {
        const loggedInUser = await microsoftUserManager.signIn();
        if (loggedInUser) {
          const responseData = await performMicrosoftLogin(loggedInUser, errorMessage);
          userStore.setToken(responseData.token);
          navigateToDashboard(userStore, router);
        }
      } catch (err) {
        errorMessage.value = "Something went wrong while logging in with Microsoft. Please try again later.";
        console.error(err);
      }
    }

    async function performMicrosoftLogin(loggedInUser, errorMessage) {
      const microsoftData = getMicrosoftData(loggedInUser);

      const tokenMicrosoft = await fetch('https://cube-testing.solidpartners.nl/cp/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(microsoftData)
      });

      return await handleResponse(tokenMicrosoft, errorMessage);
    }

    function getMicrosoftData(loggedInUser) {
      const email = loggedInUser.idTokenClaims;
      return {
        ap: "microsoft",
        token: loggedInUser.accessToken,
        email: email.preferred_username
      };
    }

    async function handleResponse(response, errorMessage) {
      if (response.ok) {
        return response.json();
      } else if (response.status === 401 ) {
        isLoading.value = false;
        errorMessage.value = "You are an unauthorized user for this Customer Portal";
        throw new Error('Unauthorized');
      } else {
        isLoading.value = false;
        console.error('Response failed');
        throw new Error('Response failed');
      }
    }
  }
};
</script>


<style scoped>
.circle {
  position: absolute;
}
.loading-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
}
</style>

