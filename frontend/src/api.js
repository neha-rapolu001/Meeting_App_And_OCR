import axios from 'axios';

const BASE_URL = 'http://localhost:8000/';
//const BASE_URL = 'https://meeting-app-and-ocr.ue.r.appspot.com/';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

export const signup = (formData) => api.post('signup/', formData);
export const signup_approve = (formData) => api.post('signup-approve/', formData);
export const login = (formData) => api.post('login/', formData);
export const tasks_create = (formData) => api.post('tasks/', formData);
export const tasks_view = () => api.get('tasks/');
export const meeting_create = (formData) => api.post('meeting/', formData);
export const meeting_ocr = (image) => api.post('meeting/ocr', image);
export const meeting_view = () => api.get('meeting/');
export const meeting_read = (pk) => api.get(`meeting/${pk}`);
export const meeting_update = (pk, formData) => api.put(`meeting/${pk}`, formData);
export const person_view = (id) => api.get(`get_person/${id}`);
export const add_person= (formData) => api.post('person/', formData);
export const delete_person= (id) => api.delete(`person/${id}`);

export const delete_request = (id) => api.delete(`deleterequest/${id}/`);
export const deny_request = (id) => api.get(`approve_status_on_deny/${id}/`);
export const deny_restore = (id) => api.get(`restore_status/${id}/`);
export const approve_status_on_approve = (id) => api.get(`approve_status_on_approve/${id}/`);

export const addChurch = (formData) => api.post('church/', formData);
export const update_church_data = (id,formdata) => api.put(`edit-church/${id}`,formdata);
export const delete_church_data = (id) => api.delete(`edit-church/${id}`);
export const delete_user = (id) => api.delete(`deleteuser/${id}/`);
export const get_users=(cid)=>api.get(`users/${cid}`);
export const update_user =(formData) => api.post("updateuser/", formData);
export const edit_church =(formData) => api.put(`edit-church/${formData.church_id}`, formData);
export const delete_church =(id) => api.delete(`edit-church/${id}`);
export const check_email_exists =(formData) => api.post("signup/check-email/", formData);
export const check_church_exists =(formData) => api.post("church/check-exists/", formData);

export const delete_subscription = (id) => api.delete(`subscription/${id}`);
export const get_subscriptions = () => api.get('subscription/');
export const subscription_view = (id) => api.get(`subscription/${id}`);
export const add_subscription = (formData) => api.post('subscription/', formData);
export const update_subscription = (id,formData) => api.put(`subscription/${id}/`, formData);

export const chargeCard = (formData) => api.post("charge/",formData);
export const get_all_payments = () => api.get("payments/");
export const update_payment = (formData) => api.post("updatepayment/",formData);
export const get_payment_card_details = (formData) => api.post("getcardinfo/", formData);



export const user_requests=(cid)=>api.get(`requests/${cid}`);
export const get_church_data=()=>api.get('church/');
// export const meeting_delete = (pk) => api.put(`api/meeting//${pk}`);
export const task_view = (id) => api.get(`tasks/${id}`);
export const tasks_delete = (id, formData) => api.delete(`tasks/${id}/`, formData);
export const tasks_update = (id, formData) => api.put(`tasks/${id}`, formData);
// export const tasks_delete = () => api.post('tasks/');
export const logout = () => api.post('logout/');
export const forgotPassword = (email) => api.post('forgot-password/', { email });


export const getCookie = (name) => {
    const cookies = document.cookie.split('; ');
    for (let cookie of cookies) {
        const [cookieName, cookieValue] = cookie.split('=');
        if (cookieName === name) {
            return decodeURIComponent(cookieValue);
        }
    }
    return null;
};

let lastMeetingTaskId = parseInt(localStorage.getItem('lastMeetingTaskId')) || 0;

function generateUniqueMeetingTaskId() {
    lastMeetingTaskId += 1;
    localStorage.setItem('lastMeetingTaskId', lastMeetingTaskId);
    return `task_${lastMeetingTaskId}`;
}



export const updateCookie = (name, value) => {
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/;`;
};

export const isSuperUser = () => {
    return getCookie('priv') == 1 ;
}

export const isAdmin = () => {
    return getCookie('priv') == 2 ;
}

export const isLeader = () => {
    return getCookie('priv') == 3 ;
}

export const uploadImage = (file) => {
    const formData = new FormData();
    formData.append('image', file);

    return api.post('upload/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};
