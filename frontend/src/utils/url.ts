export const getBaseURL = () => {
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        // Always use port 3001 for backend as per user request
        return `http://${hostname}:3001/api`;
    }
    return 'http://192.168.15.12:3001/api';
};
