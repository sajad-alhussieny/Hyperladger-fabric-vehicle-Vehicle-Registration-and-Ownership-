import { AxiosError } from 'axios';


export const errorInterceptor = (error: AxiosError) => {

    if (error.message === 'Network Error') {
        return Promise.reject(new Error('Error.'));
    }

    if (error.response?.status === 401) {
        // Do something
    }

    return Promise.reject(error);
};
