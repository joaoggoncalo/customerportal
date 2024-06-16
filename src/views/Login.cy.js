import { createPinia } from 'pinia';
import { mount } from '@cypress/vue';
import Login from './Login.vue';
import { UserManager } from 'oidc-client';
import { PublicClientApplication } from "@azure/msal-browser";
import {createI18n} from "vue-i18n";
import en from "@/stores/en";
import nl from "@/stores/nl";
class MsalUserManager {
  constructor(msalApplication, loginRequest) {
    this.msalApplication = msalApplication;
    this.loginRequest = loginRequest;
  }

  async signIn() {
    return await this.msalApplication.loginPopup(this.loginRequest);
  }

  getUser() {
    const accounts = this.msalApplication.getAllAccounts();
    if (accounts.length > 0) {
      return Promise.resolve(accounts[0]);
    }
    return Promise.resolve(null);
  }
}

const i18n = createI18n({
  locale: 'en', // set locale
  fallbackLocale: 'en', // set fallback locale
  messages: {
    en: en,
    nl: nl
  }
})
function hexToRGB(hex) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
    return r + r + g + g + b + b;
  });
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})` : null;
}

const googleConfig = {
  authority: "https://accounts.google.com",
  client_id: "",
  client_secret: "",
  redirect_uri: "http://localhost:5173",
  response_type: "code",
  scope: "openid profile email"
};

const microsoftConfig = {
  auth: {
    clientId: "",
    authority: "https://login.microsoftonline.com/common/",
  },
};
const googleUserManager = new UserManager(googleConfig);
const pca = new PublicClientApplication(microsoftConfig);
const microsoftUserManager = new MsalUserManager(pca, {
  scopes: ["user.read"],
  redirectUri: "http://localhost:5173",
});

let pinia = createPinia();
describe('<Login />', () => {


  it('should call microsoftUserManager.signIn when the Microsoft login button is clicked', () => {
    cy.stub(microsoftUserManager, 'signIn').as('microsoftSignIn');
    mount(Login, {
      global: {
        plugins: [pinia],
        provide: {
          googleUserManager,
          microsoftUserManager,
        },
      },
    });

    cy.get('#microsoft-login-btn').click({force: true});
    cy.get('@microsoftSignIn').should('have.been.calledOnce');
  });


  it('renders', () => {
    // Now mount the component and you should have access to the store
    mount(Login, {
      global: {
        plugins: [pinia],
        provide: {
          googleUserManager,
          microsoftUserManager,
        },
      },
    });
  });

  it('has Google and Microsoft login buttons', () => {
    mount(Login, {
      global: {
        plugins: [pinia],
        provide: {
          googleUserManager,
          microsoftUserManager,
        },
      },
    });

    cy.get('#google-login-btn').should('exist');
    cy.get('#microsoft-login-btn').should('exist');
  });




  it('should show an error message if the user is unauthorized', () => {
    const errorMessage = 'You are an unauthorized user for this Customer Portal';

    mount(Login, {
      global: {
        plugins: [pinia],
        provide: {
          googleUserManager,
          microsoftUserManager,
        },
      },
      data() {
        return {
          errorMessage: '',
        };
      },
      mounted() {
        // Simulate an unauthorized response
        this.errorMessage = errorMessage;
      },
    });

    cy.get('.errorText').should('contain', errorMessage);
  });

  it('should call googleUserManager.signinRedirect when the Google login button is clicked', () => {
    cy.stub(googleUserManager, 'signinRedirect').as('googleSignIn');
    mount(Login, {
      global: {
        plugins: [pinia],
        provide: {
          googleUserManager,
          microsoftUserManager,
        },
      },
    });

    cy.get('#google-login-btn').should('exist').click({force: true});
    cy.get('@googleSignIn').should('have.been.calledOnce');
  });
  it('The Customer Portal must have the same house style as the tenant. The house style must be composed of a primary color, secondary color, logo, favicon' , () => {
    cy.request('https://cube-testing.solidpartners.nl/cp/getTenant/localhost')
        .then((response) => {
          const tenant = response.body.settings;
          const primaryColorRGB = hexToRGB(tenant.primary_color);
          const accentColorRGB = hexToRGB(tenant.accent_color);

          mount(Login, {
            global: {
              plugins: [pinia],
              provide: {
                googleUserManager,
                microsoftUserManager,
              },
            },
          });

          // Check primary color
          cy.get('v-app')
              .should('have.attr', 'style')
              .and('contain', primaryColorRGB);

          // Check accent color
          cy.get('.circle')
              .should('have.attr', 'style')
              .and('contain', accentColorRGB);

          // Check logo
          cy.get('v-img')
              .should('have.attr', 'src')
              .and('eq', tenant.logo);
        });
  });


});
