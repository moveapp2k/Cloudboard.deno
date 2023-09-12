
import type { AuthInstance, AuthContext, AuthClient } from "./Authentication.tsx";
import { SupabaseClient } from "supabase";
import type { Database } from "../supabase-types.ts";
import { useContext } from "preact/hooks";

export type MindmapClient = ReturnType<typeof get_mindmap_client>;
export type MindmapRecord = Database["public"]["Tables"]["mind_maps"]["Row"];


export const decodeMindmapId = (encoded:string) => {
    return parseInt(encoded, 16);
}

export const encodeMindmapId = (id:number) => {
    return (id).toString(16);
}

export interface getMindMapClientOptions {
    auth_ctx : AuthContext
}
export const get_mindmap_client = ( props: {  auth_client:AuthClient } ) => {
    
    const auth = props.auth_client;

    const create_mindmap = async (data:MindmapRecord) => {
        return await auth.supabase.from("mind_maps").insert(data);
    }
    const get_mindmap = async (id:number) => {
       return await auth.supabase.from("mind_maps").select("*").match({id}).limit(1);  
    }
    const update_mindmap = async (id:number, data:MindmapRecord ) => {
        return await auth.supabase.from("mind_maps").update(data).match({id});
    }
    const delete_mindmap = async (id:number) => {
        return await auth.supabase.from("mind_maps").delete().match({id});
    }
    return {
        create_mindmap,
        get_mindmap,
        update_mindmap,
        delete_mindmap
    }
}
