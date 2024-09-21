import Keycloak from "keycloak-js";

const _kc = new Keycloak({
    url: import.meta.env.VITE_KEYCLOAK_URL,
    realm: import.meta.env.VITE_KEYCLOAK_REALM,
    clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID
});

const redirectUri = 'http://localhost/keycloak-redirect';

const initKeycloak = (onCallBack: () => void) => {
    _kc.init({
        onLoad: 'check-sso',
        responseMode: 'query',
        checkLoginIframe: false,
        redirectUri: redirectUri,
    }).then((_authenticated) => {
        onCallBack();
    }).catch(console.error);
}

const init = () => {
    _kc.init({});
}

const getLoginUrl = () : string => {
    return _kc.createLoginUrl();
}

const getName = () => _kc.tokenParsed?.name;

const login = () => _kc.login();

const logout = () => _kc.logout();

const isLoggedIn = () => _kc.authenticated;
 

export const KeycloakService = {
    initKeycloak,
    getName,
    login,
    logout,
    getLoginUrl,
    init,
    isLoggedIn
}