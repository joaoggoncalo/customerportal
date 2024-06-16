<template>
  <v-app>
    <v-main>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script>
import './cube-api-calls.js'

export default {
  name: 'App',

  data: () => ({
    //
  }),
}
</script>