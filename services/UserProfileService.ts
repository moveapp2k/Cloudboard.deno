
import type { AuthInstance, AuthContext, AuthClient } from "./Authentication.tsx";
import { SupabaseClient } from "supabase";
import type { Database } from "../supabase-types.ts";
import { useContext } from "preact/hooks";

export type UserProfileClient = ReturnType<typeof get_userprofile_client>;
export type UserProfileRecord = Database["public"]["Tables"]["user_profiles"]["Row"];

export const get_userprofile_client = ( props: {  auth_client:AuthClient } ) => {
    
    const auth = props.auth_client;
    const create_mindmap = async (data:UserProfileRecord) => {
        return await auth.supabase.from("user_profiles").insert(data);
    }
    const get_mindmap = async (id:number) => {
       return await auth.supabase.from("user_profiles").select("*").match({id}).limit(1);  
    }
    const update_mindmap = async (id:number, data:UserProfileRecord ) => {
        return await auth.supabase.from("user_profiles").update(data).match({id});
    }
    const delete_mindmap = async (id:number) => {
        return await auth.supabase.from("user_profiles").delete().match({id});
    }
    return {
        create_mindmap,
        get_mindmap,
        update_mindmap,
        delete_mindmap
    }
}
