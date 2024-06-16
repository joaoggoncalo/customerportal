import {defineStore} from "pinia";

export const useActiveRelationStore = defineStore('activeRelationStore', {
    state: () => ({
        activeRelation:
            JSON.parse(localStorage.getItem("activeRelation")) ||
            {},
    }),

    getters: {
        getActiveRelation: state => state.activeRelation
    },

    actions: {
        setActiveRelation(relation){
            this.activeRelation = relation;
            localStorage.setItem("activeRelation", JSON.stringify(relation))
        },
        removeActiveRelation() {
            this.activeRelation = {};
            localStorage.removeItem("activeRelation");
        }
    }
})
