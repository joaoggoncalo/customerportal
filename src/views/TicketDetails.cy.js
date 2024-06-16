import TicketDetails from './TicketDetails.vue'
import {createI18n} from "vue-i18n";
import en from "@/stores/en";
import nl from "@/stores/nl";
import {mount} from "@cypress/vue";
import {createPinia} from "pinia";
import {useTenantStore} from "@/stores/tenantStore";
import {shallowMount} from "@vue/test-utils";

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

describe('<TicketDetails />', () => {
  beforeEach(() => {
    cy.login().then(() => {
      cy.fetchRelationData();
    });
  });
  it('renders', () => {
    mount(TicketDetails, {
      global: {
        plugins: [i18n, pinia],
      },
    })
  })

  it('The system must allow a user to add messages on an existing ticket.  ', () => {
    mount(TicketDetails, {
      global: {
        plugins: [i18n, pinia],
      },
    })
    cy.get('#panelAddComments').should('exist');
  });
  it('Sent attachements should be displayed in the timeline of the ticket that it is relationed to. ', () => {
    cy.get('@token').then((token) => {
      cy.get('@relationId').then((relationId) => {
        // Make the API call using cy.request()
        cy.request({
          method: 'GET',
          url: `https://cube-testing.solidpartners.nl/cp/relations/${relationId}/work_orders/741/attachments`,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).then((response) => {
          // Assert that the API response has a 200 status code
          expect(response.status).to.eq(200);
        });
      });
    });
    mount(TicketDetails, {
      global: {
        plugins: [pinia, i18n],
      },
    });
    cy.get('#panelAttachments')
        .should('exist');

  });
  it('The system must allow a user to add messages on an existing ticket.  ', () => {
    mount(TicketDetails, {
      global: {
        plugins: [i18n, pinia],
      },
    })
    cy.get('#panelAddComments').should('exist');
  });
  it('User should be able to send attachements while sending a comment about a specific ticket. ', () => {
    mount(TicketDetails, {
      global: {
        plugins: [i18n, pinia],
      },
    })
    cy.get('#attachmentsFileInput').should('exist');
  });


  it('has a downloadFile method', () => {
    const wrapper = shallowMount(TicketDetails, {
      global: {
        plugins: [i18n, pinia],
      }
    });
    expect(typeof wrapper.vm.downloadFile).to.equal('function');
  })
})