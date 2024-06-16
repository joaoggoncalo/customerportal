import {defineStore} from "pinia";

export const useUserRelationsStore = defineStore('userRelationsStore', {
    state: () => ({
        userRelations:
            JSON.parse(localStorage.getItem("userRelations")) ||
            []
    }),

    getters: {
        getUserRelations: state => state.userRelations
    },

    actions: {
        setUserRelations(userRelations){
            this.userRelations = userRelations;
            localStorage.setItem("userRelations", JSON.stringify(userRelations))
        },
        removeUserRelations() {
            this.userRelations = [];
            localStorage.removeItem("userRelations");
        }
    }
})
