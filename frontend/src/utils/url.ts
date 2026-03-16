export const getBaseURL = () => {
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        // Internal access uses 3001, external redirection uses 9002
        const isInternal = hostname === '192.168.15.12' || hostname === 'localhost' || hostname === '127.0.0.1';
        const port = isInternal ? '3001' : '9002';
        return `http://${hostname}:${port}/api`;
    }
    return 'http://192.168.15.12:3001/api';
};
