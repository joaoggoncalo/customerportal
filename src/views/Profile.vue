<template>
  <v-container fluid>
    <!-- header -->
    <v-row class="mb-5 pa-5 text-grey-darken-3">
      <v-col>
        <h1>{{$t('profile')}}</h1>
      </v-col>
    </v-row>

    <v-row>
      <!-- contact info -->
      <v-col id="contactInfo" cols="12" sm="6">
        <v-card class="pa-2">
          <v-card-item>
            <v-card-title class="text-grey-darken-3 mb-5">{{$t('organization_information')}}</v-card-title>
            <v-card-text v-for="detail in profile.contact_details" :key="detail.id">
              <strong class="text-grey-darken-3">{{$t(detail.label)}}</strong>
              <br>
              <a v-if="detail.type === 'website'" :href="`https://${detail.value}`">{{ detail.value }}</a>
              <span v-else>{{ detail.value }}</span>
            </v-card-text>
          </v-card-item>
        </v-card>
      </v-col>


      <!-- google maps -->
      <v-col cols="12" sm="6">
        <v-row>
          <v-card class="mb-5 w-100" v-for="address in profile.addresses" :key="address.id">
            <v-card-title>
              {{ address.street }} {{ address.number }}
              <br>
              {{ address.zipcode }}, {{ address.city }}, {{ $t(address.country.name) }}
            </v-card-title>
            <iframe v-if="address.geoLocation" :src="`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${address.geoLocation.lat},${address.geoLocation.lng}`" width="100%" height="500" style="border:0;" allowfullscreen="" loading="lazy"></iframe>
          </v-card>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>


<script>
import axios from 'axios';
import {useTenantStore} from "@/stores/tenantStore";


import {useUserStore} from "@/stores/userStore";
import {useActiveRelationStore} from "@/stores/activeRelationStore";
import {computed, onMounted, ref} from "vue";
import {getProfileInfo} from "@/cube-api-calls";
import {useFavicon} from "@vueuse/core";

export default {
  setup() {
    const activeRelationStore = useActiveRelationStore();
    const activeRelationStoreRef = ref(activeRelationStore);
    const userStore = useUserStore();
    const userStoreRef = ref(userStore);

    const activeRelation = computed(() => activeRelationStoreRef.value.getActiveRelation);
    const token = computed(() => userStoreRef.value.getToken);
    const profile = ref({});
    const apiKey = '';

    const tenantStore = useTenantStore();
    const accent_color = tenantStore.tenant.settings.accent_color;
    const primary_color = tenantStore.tenant.settings.primary_color;
    const favicon = tenantStore.tenant.settings.favicon;

    onMounted(async () => {
      try {
        const response = await getProfileInfo(activeRelation.value.id, token.value);
        profile.value = response.data;
        useFavicon(computed(() => tenantStore.tenant.settings.favicon).value);

        for (const address of profile.value.addresses) {
          const formattedAddress = `${address.street} ${address.number}, ${address.city}, ${address.country.name}`;
          const location = await getGeoInfo(formattedAddress);
          if (location) {
            // Here we add the geolocation information to the address object
            address.geoLocation = location;
          }
        }
      } catch (error) {
        console.error('Error occurred: ', error);
      }
    });

    const getGeoInfo = async (address) => {
      try {
        const responseGoogleApi = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${apiKey}`
        );
        if (responseGoogleApi.data.results[0]) {
          const location = responseGoogleApi.data.results[0].geometry.location;
          return location;
        } else {
          console.log('No results for this address: ', address);
        }
      } catch (error) {
        console.error('Error occurred getting geolocation for the address: ', address, error);
      }
      // We add a delay to avoid the OVER_QUERY_LIMIT error
      await new Promise(resolve => setTimeout(resolve, 50));
    };
    return {
      profile,
      getGeoInfo,
      apiKey,
      accent_color,
      primary_color,
      favicon
    }
  },
};
</script>

<style>
.text-color{
  color: #0061ba;
}
</style>

