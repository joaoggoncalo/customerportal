import Profile from './Profile.vue'
import {createI18n} from "vue-i18n";
import en from "@/stores/en";
import nl from "@/stores/nl";
import {createPinia} from "pinia";
import {mount} from "@cypress/vue";
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
describe('<Profile />', () => {
  beforeEach(() => {
    cy.login()
    cy.fetchRelationData()
  });


  it('renders', () => {
    mount(Profile, {
      global: {
        plugins: [pinia, i18n],
      },
  })
})
  it('should display contact info', () => {
    // Get the token
    cy.get('@token').then((token) => {
      // Get the relationId
      cy.get('@relationId').then((relationId) => {
        // Make a request to fetch the profile
        cy.request({
          method: 'GET',
          url: `https://cube-testing.solidpartners.nl/cp/relations/${relationId}`,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).then((response) => {
          // Assert that the API response has a 200 status code
          expect(response.status).to.eq(200);

          // Mount the Profile component
          mount(Profile, {
            global: {
              plugins: [pinia, i18n],
            },
            propsData: { profile: response.body },
          });

          // After the Profile component has been mounted, check that the contact info is present
          cy.get('#contactInfo').should('exist');
        });
      });
    });
  });
});
