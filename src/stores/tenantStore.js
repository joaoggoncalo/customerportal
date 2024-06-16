import { defineStore } from 'pinia';

export const useTenantStore = defineStore('tenant', {
    state: () => ({
        tenant:
            JSON.parse(localStorage.getItem("tenant")) ||
            {},
    }),

    getters: {
        getTenant: state => state.tenant
    },

    actions: {
        setTenant(tenant){
            this.tenant = tenant;
            localStorage.setItem("tenant", JSON.stringify(tenant));
        }
    }
});
