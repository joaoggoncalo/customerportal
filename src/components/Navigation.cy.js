import { createI18n } from 'vue-i18n'
import { mount } from '@cypress/vue'
import { createPinia } from 'pinia'  // Make sure to import createPinia
import Navigation from './Navigation.vue'
import en from "../stores/en"
import nl from "../stores/nl"
import {useTenantStore} from "@/stores/tenantStore";

const i18n = createI18n({
  locale: 'en', // set locale
  fallbackLocale: 'en', // set fallback locale
  messages: {
    en: en,
    nl: nl
  }
})

// Create a new instance of Pinia
const pinia = createPinia();

describe('<Navigation />', () => {

  let pinia;

  beforeEach(() => {
    pinia = createPinia();  // create a new Pinia instance
    const tenantStore = useTenantStore(pinia);  // pass the pinia instance

    // mock the store's state
    tenantStore.setTenant({
      settings: {
        logo: 'testLogo.png',
        accent_color: 'blue',
        primary_color: 'red'
      }
    });
  });

  it('renders', () => {
    mount(Navigation, {
      global: {
        plugins: [i18n, pinia]  // use the pinia instance
      }
    })
  });

  it('allows the user to log out', () => {
    mount(Navigation, {
      global: {
        plugins: [i18n, pinia]  // use the pinia instance
      }
    });

    cy.get('#logoutButton').should('exist');
    // Simulate the logout action
    cy.get('#logoutButton').click();
  });


  it('User must be able to switch between active relations. ', () => {
    mount(Navigation, {
      global: {
        plugins: [i18n, pinia]  // use the pinia instance
      }
    });

    cy.get('#activeRelation').should('exist');
  });


  it('User must be able to switch the language in the customer portal from Dutch to English and viceversa. ', () => {
    mount(Navigation, {
      global: {
        plugins: [i18n, pinia]  // use the pinia instance
      }
    });

    cy.get('#activeLanguage').should('exist');
  });
})
