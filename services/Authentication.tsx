import { createClient, type User, type Session } from "supabase-js";
import { Signal, signal } from "@preact/signals";
// Setting
export const AUTH_COOKIE_NAME = "auth";
export const AFTER_AUTH_PATH = "/";
export const AFTER_LOGIN_PATH = "/auth/post-login";
export const AFTER_LOGOUT_PATH = "/";


// Context
export type AuthInstance = {
    user: User | null,
    session: Session | null,
}


/**
 * Creates a cookie string from the user and session data
 * @param data login response from supabase
 * @returns string cookie 
 */
export function create_auth_cookie(data: AuthInstance): string {
    return objectToBase64(data);
}

/**
 * Creates a cookie string from the user and session data
 * @param cookie cookie string
 * @returns 
 */
export function get_auth_from_cookie(cookie: string) {
    const data = base64ToObject(cookie) as AuthInstance;
    return data;
}


function objectToBase64(obj: any) {
    // Convert the object to a JSON string
    const jsonString = JSON.stringify(obj);
    // Encode the JSON string as base64
    const base64String = btoa(jsonString);
    // Return the base64 encoded string
    return base64String;
}

function base64ToObject(base64String: string) {
    // Decode the base64 string to a JSON string
    const jsonString = atob(base64String);
    // Parse the JSON string to an object
    const obj = JSON.parse(jsonString);
    // Return the object
    return obj;
}


/**
 * 
 * @param cookie 
 * @returns 
 */
export function getAuthInstance(cookie?: string | null): AuthInstance {
    if (!cookie) {
        return {
            user: null,
            session: null,
        };
    }

    const { user, session } = get_auth_from_cookie(cookie);

    return {
        user,
        session,
    }
}

function parse_cookie(cookie_str: string) {
    let cookieObject: Record<string, string> = {};
    let cookieArray = cookie_str.split('; ');
    for (let i = 0; i < cookieArray.length; i++) {
        let cookiePair = cookieArray[i].split('=');
        cookieObject[cookiePair[0]] = cookiePair[1];
    }
    return cookieObject;
}

/**
 * Client side only function to get the auth cookie
 * @returns 
 */
export function get_client_session_cookie(cookie: string) {
    const parsed_cookie = parse_cookie(cookie) as { [AUTH_COOKIE_NAME]: string };
    return getAuthInstance(parsed_cookie.auth);
}


export function get_auth_clientside() {
    return get_client_session_cookie(document.cookie)
}


export type AuthClient = ReturnType<typeof get_auth_client>;
export function get_auth_client(supabaseUrl: string, supabaseKey: string, onAuthStateChangeCb?: (event: AuthChangeEvent, session: Session | null) => void) {

    const supabase = new SupabaseClient<Database>(supabaseUrl, supabaseKey);

    supabase.auth.onAuthStateChange((event, session) => {
        if (onAuthStateChangeCb){ 
            onAuthStateChangeCb(event, session);
        }
    })


    const login = async (email: string, password: string, retUrl?:string) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (!error) {
            supabase.auth.startAutoRefresh();
        }
        return { data, error };
    }


    const loginToken = async (token: string, retUrl?:string) => {
        try {
            const { data, error } = await supabase.auth.refreshSession({ refresh_token: token });
            if (!error) {
                supabase.auth.startAutoRefresh();
                return { data, error };
            }
        } catch (e) {
            console.log(e)
        }
        return null;
    }


    const logout = () => {
        return supabase.auth.signOut({
            scope: "global"
        })
    }

    const signUp = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (!error) {

        }
        return { data, error };
    }
    const forgotPassword = async (email: string) => {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email);
        if (!error) {

        }
        return { data, error };
    }

    return {
        supabase,
        login,
        loginToken,
        logout,
        signUp,
        forgotPassword

    }
}




export type AuthContext = ReturnType<typeof getAuthCTX>;
export const getAuthCTX = (supabaseUrl: string, supabaseKey: string, onAuthStateChangeCb: (event: AuthChangeEvent, session: Session | null) => void) => createContext({
    client: get_auth_client(supabaseUrl, supabaseKey, onAuthStateChangeCb),
    instance: signal<AuthInstance|null>(null),
});

export interface AuthAppInstanceProps {
    supabaseUrl: string;
    supabaseKey: string;
    auth_instance: AuthInstance; 
    children?: JSX.Element[] | JSX.Element;
    onAuthStateChangeCb: (event: AuthChangeEvent, session: Session | null) => void
}
/**
 * Creates an instance of the mind map app with a context for all other components
 * @param props 
 * @returns 
 */
export function AuthAppInstance(props: AuthAppInstanceProps) {

    const ctx: AuthContext = getAuthCTX(props.supabaseUrl, props.supabaseKey, props.onAuthStateChangeCb);
    const auth = useContext(ctx);
    return <ctx.Provider value={auth}>
        {props.children}
    </ctx.Provider>

}


