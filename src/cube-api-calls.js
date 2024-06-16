import axios from 'axios';
import router from "@/router";
import {removeAccountData} from "@/account-details-deletion";

const baseUrl = '';

//general calls

async function postItem(url, body) {
    try {
        return await axios.post(`${baseUrl}${url}`, body, {
            'Content-Type': 'application/json'
        });
    } catch (error) {
        throw new Error(error);
    }
}

async function postAccountItem(url, body, token) {

    try {
        const response = await axios.post(`${baseUrl}${url}`, body, {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
        return response;
    } catch (error) {
        if(error.response.status===401){ //if unauthorized, direct to 401 page
            console.log("unauthorized");
            removeAccountData()
            await router.push('/401');
        }
        throw new Error(error);
    }
}

export async function getAccountItems(url, token) {
    try {
        const response = await axios.get(`${baseUrl}${url}`, {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
        console.log(response.status);
        if(response.status===200){
            console.log("yay");
        }
        return response;
    } catch (error) {
        if(error.response.status===401){ //if unauthorized, direct to 401 page
            console.log("unauthorized");
            removeAccountData()
            await router.push('/401');
        }
        throw new Error(error);
    }
}

// Profile
export async function getProfileInfo(relationId, token) {
    return getAccountItems(`/relations/${relationId}`, token);
}

// Tickets
export async function postTicket(relationId, body, token) {
    const url = `/relations/${relationId}/work_orders`;
    await postAccountItem(url, body, token)
}

export async function getTickets(relationId, token) {
    return await getAccountItems(`/relations/${relationId}/work_orders`, token)
}

export async function getTicketById(relationId, ticketId, token){
    return await getAccountItems(`/relations/${relationId}/work_orders/${ticketId}`, token)
}

// Attachments
export async function getAttachments(relationId, ticketId, token){
    return await getAccountItems(`/relations/${relationId}/work_orders/${ticketId}/attachments`, token)
}

export async function postAttachment(relationId, ticketId, body, token){
    const url = `/relations/${relationId}/work_orders/${ticketId}/attachments`
    await postAccountItem(url, body, token)
}

// Comments
export async function getComments(relationId, ticketId, token){
    return await getAccountItems(`/relations/${relationId}/work_orders/${ticketId}/events`, token)
}

export async function postComment(relationId, ticketId, body, token){
    const url = `/relations/${relationId}/work_orders/${ticketId}/events`
    await postAccountItem(url, body, token)
}