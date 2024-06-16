<template>
  <div class="dashboard mb-4">
    <v-container fluid>
      <v-row class="mb-2">
        <v-col cols="12" md="4">
          <v-card id="ticketsContainer" class="text-center bg-grey-lighten-3" border>
            <v-card-item :style="{ 'background-color': primary_color }">
              <div :class="`text-h5 mt-5 font-weight-light ${colorCalculation(primary_color)}`">{{ $t('tickets') }}:
                {{ tickets.length }}
              </div>
            </v-card-item>
            <v-card-actions :style="{ 'background-color': primary_color }" class="justify-center px-6 py-3">
              <router-link to="/account/tickets">
                <v-btn :style="{ 'background-color': primary_color}" :class="`${colorCalculation(primary_color)}`">
                  <span :class="`${colorCalculation(primary_color)}`">{{ $t('see_all_tickets') }}</span>
                  <v-icon end size="large" :class="`${colorCalculation(primary_color)}`">mdi-menu-right-outline</v-icon>
                </v-btn>
              </router-link>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <v-card id="recentTickets" :style="{ 'background-color': accent_color }" max-width="900px" min-width="">
        <v-card-title class="w-100" :style="{ 'background-color': accent_color }">
          <v-row>
            <v-card-item class="ma-1">
              <v-icon :class="`${colorCalculation(accent_color)}`">mdi-comment-multiple-outline</v-icon>
              <span :class="`font-weight-regular text-white ${colorCalculation(accent_color)}`">{{$t('recent_tickets') }}</span>
            </v-card-item>

            <v-spacer></v-spacer>

            <v-card-actions class="">
              <router-link to="/account/tickets">
                <v-btn :class="`${colorCalculation(accent_color)}`" :style="{ 'background-color': accent_color }">
                  <span> {{ $t('show_all') }}</span>
                  <v-icon end size="small">mdi-arrow-right</v-icon>
                </v-btn>
              </router-link>
            </v-card-actions>
          </v-row>
        </v-card-title>

        <v-table class="">
          <thead class="">
          <tr>
            <th class="text-left font-weight-bold text-grey-darken-4">{{ $t('ticket_number') }}</th>
            <th class="text-left font-weight-bold text-grey-darken-4">{{ $t('title') }}</th>
            <th class="text-left font-weight-bold text-grey-darken-4">{{ $t('date') }}</th>
            <th class="text-left font-weight-bold text-grey-darken-4">{{ $t('priority') }}</th>
            <th class="text-left font-weight-bold text-grey-darken-4">{{ $t('status') }}</th>
            <th class="text-left font-weight-bold text-grey-darken-4">{{ $t('type') }}</th>
          </tr>
          </thead>

          <tbody>
          <tr v-for="ticket in ticketData" :key="ticket.number" @click="goToTicket(ticket)" class="clickable">
            <td>{{ ticket.code }}</td>
            <td>{{ ticket.title }}</td>
            <td>{{ ticket.created_at }}</td>
            <td>
              <v-chip :class="{'Low': getPriority(ticket.priority_index) === 'Low', 'High': getPriority(ticket.priority_index) === 'High',
        'Medium': getPriority(ticket.priority_index) === 'Medium', 'TBD': getPriority(ticket.priority_index) === 'TBD'}"
                      class="status-badge text-white">{{ getPriority(ticket.priority_index) }}
              </v-chip>
            </td>
            <td>
              <v-chip :class="`${ticket.status} text-white status-badge`">{{ getStatus(ticket.status) }}</v-chip>
            </td>
            <td>{{ ticket.type_label }}</td>
          </tr>
          </tbody>
        </v-table>

      </v-card>
    </v-container>
  </div>
</template>


<script>
import {useActiveRelationStore} from "@/stores/activeRelationStore";
import {computed, onMounted, ref} from "vue";
import {useTenantStore} from "@/stores/tenantStore";
import {useUserStore} from "@/stores/userStore";
import {getTickets} from "@/cube-api-calls";
import {calculateTextColor} from "@/text-color";
import {useFavicon} from "@vueuse/core";

export default {
  setup() {
    const activeRelationStore = useActiveRelationStore();
    const activeRelationStoreRef = ref(activeRelationStore);
    const tenantStore = useTenantStore();
    const activeRelation = computed(() => activeRelationStoreRef.value.getActiveRelation);
    const relationId = computed(() => activeRelation.value.id);
    const relationName = computed(() => activeRelation.value.name);

    //tenantDesign
    const favicon = tenantStore.tenant.settings.favicon;
    const logo = tenantStore.tenant.settings.logo;
    const accent_color = tenantStore.tenant.settings.accent_color;
    const primary_color = tenantStore.tenant.settings.primary_color;

    onMounted(() => useFavicon(computed(() => tenantStore.tenant.settings.favicon).value));
    return {
      relationId,
      relationName,
      favicon,
      accent_color,
      primary_color,
      logo
    }
  },
  data() {
    return {
      tickets: [],
      sortDirection: 'desc'
    };
  },

  async created() {
    try {
      const response = await getTickets(this.relationId, useUserStore().token);
      this.tickets = response.data;
    } catch (error) {
      throw new Error(error);
    }
  },

  methods: {
    goToTicket(ticket) {
      this.$router.push({name: 'ticketDetails', params: {id: `${ticket.id}`}});
    },
    colorCalculation(theColor) {
      return calculateTextColor(theColor);
    },
    sortByDate(a, b) {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);

      if (dateA < dateB) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (dateA > dateB) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    }
  },
  computed: {
    getPriority() {
      return function (priorityIndex) {
        return priorityIndex === 0 ? 'Low' : priorityIndex &&
        priorityIndex === 1 ? 'Medium' : priorityIndex &&
        priorityIndex === 10 ? 'High' : priorityIndex &&
        priorityIndex === 34 ? 'TBD' : priorityIndex;
      }
    },
    getStatus() {
      return function (statusName) {
        return statusName === "finished" ? 'Finished' : statusName &&
        statusName === "todo" ? 'To-Do' : statusName &&
        statusName === "in_progress" ? 'In-Progress' : statusName
      }
    },
    ticketData() {
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      const newTickets = this.tickets.sort(this.sortByDate);
      return newTickets.slice(0, 4);
    },
  }
};
</script>


<style>
.clickable {
  cursor: pointer;
}

.status-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  width: 90px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  text-align: center;
}

.finished {
  border-left: 5px solid rgb(31, 187, 31);
}
.todo {
  border-left: 5px solid rgb(33, 144, 242);
}
.in_progress {
  border-left: #ffc400;
}
.v-chip.finished {
  background: rgb(31, 187, 31)
}
.v-chip.in_progress {
  background: #ffc400;
}
.v-chip.todo {
  background: rgb(33, 144, 242);
}
.Low {
  background: green;
}
.High {
  background: red;
}
.Medium {
  background: orange;
}
.TBD {
  background: #b7b7b7;
}
</style>
