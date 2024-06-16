import {useTenantStore} from './tenantStore';
import {computed} from 'vue';
export default {
    beforeMount() {
        const tenantStore = useTenantStore();
        // Assuming tenantStore is globally accessible
        const favicon = computed(() => tenantStore.tenant.settings.favicon);
        this.updateFavicon(favicon.value);
    },

    methods: {
        updateFavicon(href) {
            let link = document.querySelector("link[rel*='icon']") || document.createElement('link');
            link.type = 'image/x-icon';
            link.rel = 'shortcut icon';
            link.href = href;

            document.getElementsByTagName('head')[0].appendChild(link);
        }
    }
}
