export function removeAccountData(){
    localStorage.removeItem("token");
    localStorage.removeItem("userRelations");
    localStorage.removeItem("activeRelation");
    localStorage.removeItem("detailsFetchedAt");
}