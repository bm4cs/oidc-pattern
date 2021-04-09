import { Action, Reducer } from 'redux';
import { AppThunkAction } from './';
import Keycloak, { KeycloakInstance } from 'keycloak-js';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface AuthenticationState {
    keycloak?: KeycloakInstance;
    authenticated: boolean;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

interface GetAuthenticationAction {
    type: 'GET_AUTHENTICATION'
}

interface AuthenticateUserAction {
    type: 'AUTHENTICATE_USER';
    keycloak: KeycloakInstance;
    authenticated: boolean;
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
export type KnownAction = GetAuthenticationAction | AuthenticateUserAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    authenticateUser: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        // Only load data if it's something we don't already have (and are not already loading)

        const appState = getState();
        // debugger;

        if (appState && appState.authentication && !appState.authentication.authenticated) {

            // keycloak.json from the KC management UI for the client
            // saved off in public/keycloak.json
            const keycloak = Keycloak('/keycloak.json');
            keycloak.init({onLoad: 'login-required'}).then(authenticated => {
                dispatch({ type: 'AUTHENTICATE_USER', keycloak: keycloak, authenticated: authenticated });
            })

            // dispatch({ type: 'GET_AUTHENTICATION' });
        }

        dispatch({ type: 'GET_AUTHENTICATION' });
    }
};

// ----------------
// REDUCER - For a given state and action, returns the new state. To support time travel, this must not mutate the old state.

const unloadedState: AuthenticationState = { authenticated: false };

export const reducer: Reducer<AuthenticationState> = (state: AuthenticationState | undefined, incomingAction: Action): AuthenticationState => {
    if (state === undefined) {
        return unloadedState;
    }

    const action = incomingAction as KnownAction;
    switch (action.type) {
        case 'GET_AUTHENTICATION':
            return {
                keycloak: state.keycloak,
                authenticated: state.authenticated
            };
        case 'AUTHENTICATE_USER':
            return {
                keycloak: action.keycloak,
                authenticated: action.authenticated
            };
    }

    return state;
};
