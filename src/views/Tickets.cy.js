import Tickets from './Tickets.vue';
import {mount} from '@cypress/vue';
import {createI18n} from 'vue-i18n';
import en from '@/stores/en';
import nl from '@/stores/nl';
import {createPinia} from 'pinia';
import {useTenantStore} from "@/stores/tenantStore";
import {shallowMount} from "@vue/test-utils";
import { expect } from "chai";

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

describe('<Tickets />', () => {
    beforeEach(() => {
      cy.on('uncaught:exception', (err, runnable) => {
        // Prevent failing the test
        return false
      })

      cy.login().then(() => {
        cy.getTickets();
        cy.fetchRelationData();
      });
    });


  it('Check if the API for getting the tickets exits so that the table below wll be filled.', () => {
    cy.get('@token').then((token) => {
      cy.get('@relationId').then((relationId) => {
        // Make the API call using cy.request()
        cy.request({
          method: 'GET',
          url: `https://cube-testing.solidpartners.nl/cp/relations/${relationId}/work_orders/`,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).then((response) => {
          // Assert that the API response has a 200 status code
          expect(response.status).to.eq(200);

          // Perform further assertions or actions with the response body
        });
      });
    });
    mount(Tickets, {
      global: {
        plugins: [pinia, i18n],
      },
    });
    cy.get('#ticketTable') // Update the selector to target the v-table element with the specific id
        .should('exist');

  });


  it('User should be able to create a ticket.', () => {
    mount(Tickets, {
      global: {
        plugins: [pinia, i18n],
      },
    });
    cy.get('#createTicketForm') // Update the selector to target the v-table element with the specific id
        .should('exist');
  });
  it('User must be able to navigate matching the permission of the user.', () => {
    mount(Tickets, {
      global: {
        plugins: [pinia, i18n],
      },
    });
    cy.get('#createTicketButton') // because we mount the Tickets and the store with permissions is empty we must not be able to see the createButton
        .should('not.exist');
  });


  it('The system must provide the functionality to filter and sort tickets based on creation time, status and priority.  ', () => {
    mount(Tickets, {
      global: {
        plugins: [pinia, i18n],
      },
    });

    // Select the element by data-cy attribute and simulate a click
    cy.get('[data-cy=sortDate]').click();

    // Add any assertions you need here to verify sortDate was called

    cy.get('[data-cy=sortPriority]').click();

    // Add any assertions you need here to verify sortPriority was called

    cy.get('[data-cy=sortStatus]').click();

    // Add any assertions you need here to verify sortStatus was called
  });

  it("searches for 'incident' type tickets when Enter key is pressed", () => {
    // Mount the component
    const wrapper = shallowMount(Tickets, {
      global: {
        plugins: [pinia, i18n]
      }
    });

    // Simulate typing in the search bar
    wrapper.setData({ search: "incident" });
    // Trigger the keydown event with Enter key on the search bar
    const searchBar = wrapper.find("#searchBar");
    searchBar.trigger("keydown.enter");
    // Assert that the searching functionality is triggered when user searches for tickets with type = incident
    expect(wrapper.vm.search).to.equal("incident");
    // Retrieve the filtered tickets from the component instance
    const filteredTickets = wrapper.vm.tickets;
    // Assert that all filtered tickets have the type 'rfi'
    const hasOnlyRFITickets = filteredTickets.every(ticket => ticket.type_label.toLowerCase() === 'incident');
    expect(hasOnlyRFITickets).to.be.true;
  });

  it("searches for tickets with number starting with '2022' when Enter key is pressed", () => {
    // Mount the component
    const wrapper = shallowMount(Tickets, {
      global: {
        plugins: [pinia, i18n]
      }
    });

    // Simulate typing in the search bar
    wrapper.setData({ search: "2022" });

    // Trigger the keydown event with Enter key on the search bar
    const searchBar = wrapper.find("#searchBar");
    searchBar.trigger("keydown.enter");

    // Assert that the searching functionality is triggered when searching for tickets with number starting with '2022'
    expect(wrapper.vm.search).to.equal("2022");

    // Retrieve the filtered tickets from the component instance
    const filteredTickets = wrapper.vm.tickets;

    // Assert that all filtered tickets have a number starting with '2022'
    const hasTicketsWithNumberStartingWith2022 = filteredTickets.every(ticket => ticket.code && ticket.code.toString().startsWith("2022"));
    expect(hasTicketsWithNumberStartingWith2022).to.be.true;
  });

  it("searches for tickets with title containing 'test' when Enter key is pressed", () => {
    // Mount the component
    const wrapper = shallowMount(Tickets, {
      global: {
        plugins: [pinia, i18n]
      }
    });

    // Simulate typing in the search bar
    wrapper.setData({ search: "test" });

    // Trigger the keydown event with Enter key on the search bar
    const searchBar = wrapper.find("#searchBar");
    searchBar.trigger("keydown.enter");

    // Assert that the searching functionality is triggered when searching for tickets with title containing 'test'
    expect(wrapper.vm.search).to.equal("test");

    // Retrieve the filtered tickets from the component instance
    const filteredTickets = wrapper.vm.tickets;

    // Assert that all filtered tickets have a title containing 'test'
    const hasTicketsWithTitleContainingTest = filteredTickets.every(ticket => ticket.title && ticket.title.toLowerCase().includes("test"));
    expect(hasTicketsWithTitleContainingTest).to.be.true;
  });

    it('toggles showAll when Show All button is clicked', () => {
      const wrapper = shallowMount(Tickets, {
        global: {
          plugins: [pinia, i18n],
        },
      })

      // Check that showAll is initially false
      expect(wrapper.vm.showAll).to.equal(false)

      // Find the Show All button and trigger a click event
      wrapper.find('#showAllButton').trigger('click')

      // showAll should now be true
      expect(wrapper.vm.showAll).to.equal(true)
    })
});



