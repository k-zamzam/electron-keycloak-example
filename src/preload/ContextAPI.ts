interface ContextAPI {
    login: (url: string) => void;
    getAppVersion: () => Promise<string>;
}

export default ContextAPI;