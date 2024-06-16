import Dashboard from './Dashboard.vue'
import {createI18n} from "vue-i18n";
import { mount } from '@cypress/vue'
import en from "@/stores/en";
import nl from "@/stores/nl";
import {createPinia} from "pinia";
import {useTenantStore} from "@/stores/tenantStore";


const i18n = createI18n({
  locale: 'en', // set locale
  fallbackLocale: 'en', // set fallback locale
  messages: {
    en: en,
    nl: nl
  }
});

const pinia = createPinia();

const tenantStore = useTenantStore(pinia);  // pass the pinia instance

// mock the store's state
tenantStore.setTenant({
  settings: {
    logo: 'testLogo.png',
    favicon: 'favicon.png',
    accent_color: 'blue',
    primary_color: 'red'
  }
});
describe('<Dashboard />', () => {

  it('Dashboard must contain user’s amount of tickets, and recent tickets. ', () => {
    mount(Dashboard, {
      global: {
        plugins: [pinia, i18n],
      },
    });

    cy.get('#recentTickets').should('exist');
    cy.get('#ticketsContainer').should('exist');
  });
})