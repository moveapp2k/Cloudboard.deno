import { Signal, signal, useSignalEffect } from '@preact/signals';
import { useContext, useEffect } from 'preact/hooks';
import { Mindmap, type MindmapTree } from '../../models/MindMap.ts';
import {  get_mindmap_client } from '../../services/MindMapService.ts';
import { AuthAppInstance, get_auth_client, type AuthInstance } from '../../services/AuthServices/AuthenticationService';
import type { SyntheticEvent } from 'react';
import { useRef } from 'react';
import mermaidAPI from 'mermaid';
import { createPopper } from '@popperjs/core';


interface NewMindmapModalProps {
  ctx: MindmapContext
}

/**
 * The Mindmap app created by the MindMapAppInstance
 * @param props 
 * @returns 
 */
 export const MindmapApp = ( props:{ctx:MindmapContext} ) => {

  const { editor_state, model_signal } = useContext(props.ctx)

  function _handleZoomChange(e: SyntheticEvent) {
    editor_state.value.zoom = parseInt((e.target as HTMLInputElement).value);
  }
  
  function _handleBoardNameChange(e: SyntheticEvent) {
    editor_state.value.zoom = parseInt((e.target as HTMLInputElement).value);
  }
  return <div className="flex">
      <div className='grid w-full h-[calc(100vh_-_100px)] overflow-hidden'>
        <div className="border p-3 rounded-t-2xl border-b-0 bg-zinc-950">
          <div className="grid grid-cols-2 gap-1 w-fit">
            <div className="form-control w-full max-w-xs">
              <label className="label">
                <span className="label-text">Name</span>
              </label>
              <input type="text" placeholder="Type here" value={editor_state.value.title} onChange={_handleBoardNameChange} className="input input-bordered w-full max-w-xs" />
            </div>
            <div className="form-control w-full max-w-xs">
              <label className="label">
                <span className="label-text">Zoom</span>
              </label>
              <input type="number" className="input input-bordered w-full max-w-xs" value={editor_state.value.zoom} onChange={_handleZoomChange} />
            </div>
            <div className="form-control">
              <button onClick={() => {}}>💾</button>
            </div>
          </div>
        </div>
        <MindMapStage ctx={props.ctx}  />
        <NewMindmapModal ctx={props.ctx} />
      </div>
    </div>
}



export interface MindMapEditorState {
  new_board_opened: boolean,
  zoom: number,
  title: string,
  description: string,
  saving: boolean,
  has_error: boolean,
  log: string[],
  auto_save: boolean,
}



export type MindmapContext = ReturnType<typeof  getMindmapContext>
export function getMindmapContext(model_signal: Signal<MindmapTree | null>, editor_state: Signal<{ new_board_opened: boolean; zoom: number; title: string; description: string; saving: boolean; has_error: boolean; log: never[]; }>) {
  return createContext({
    model_signal,
    editor_state
  });
}



export interface MindmapAppInstanceProps {
  mindmap_id?: number;
  supabaseUrl: string;
  supabaseKey: string;
  auth: AuthInstance
}


/**
 * Creates an instance of the mind map app with a context for all other components
 * @param props
 * @returns
 */
export function MindMapAppInstance(props: MindmapAppInstanceProps) {

  const _handleAuthChange = (event: string, session: any) => {

  }
  const _handleModelChange = (model: MindmapTree | null) => {
    // Auto save?
  }
  const _handleEditorChange = (editor_state: MindMapEditorState ) => {

  }
  const auth_client = get_auth_client(props.supabaseUrl, props.supabaseKey, (event, session) => _handleAuthChange(event, session));

  const mindmap_client = get_mindmap_client({ auth_client });

  const model_signal = signal<MindmapTree | null>(null);


  const editor_signal = signal({
    new_board_opened: false,
    mind_map_exists: false,
    zoom: 1,
    title: '',
    description: '',
    saving: false,
    has_error: false,
    log: [],
    auto_save:true,
  });


  model_signal.subscribe(_handleModelChange);
  editor_signal.subscribe(_handleEditorChange);



  const getMindmap = async (id: number) => {
    const { data, error } = await mindmap_client.get_mindmap(id);
    if (error) {
      console.error(error);
    } else {
      model_signal.value = data && data.length > 0 && data[0].content != null
        ? Mindmap.PARSE(data[0].content ?? '')
        : null;
      
      editor_signal.value = {
        new_board_opened : data.length == 0,
        description: data.length > 0 && data[0].description ? data[0].description : '',
        title: data.length > 0 && data[0].title ? data[0].title : '',
        mind_map_exists: data.length > 0,
        zoom:  1,
        saving: false,
        has_error: false,
        log: [],
        auto_save:true,
      };
    }
  }
  

  const ctx = getMindmapContext(model_signal, editor_signal);
  const val = useContext(ctx);

  return <>
  <AuthAppInstance auth_instance={props.auth} onAuthStateChangeCb={(event, session) => _handleAuthChange(event, session)} supabaseKey={props.supabaseKey} supabaseUrl={props.supabaseUrl}>
      <ctx.Provider value={val}>
        <MindmapApp ctx={ctx} />
      </ctx.Provider>
    </AuthAppInstance>
  
  </>

}
export function MindmapNav(props: { opened: boolean; ctx:MindmapContext }) {
  const app_ctx = useContext(props.ctx);

  const ui = !app_ctx.model_signal.value
    ? <></>
    : app_ctx.model_signal.value.all_topics.map((t, i) => {
      return <>
        {t.id.length == 0 ||
          <div className="card w-full bg-base-100 shadow-xl" key={i}>
            <figure></figure>
            <div className="card-body">
              <h2 className="card-title">
                {t.title}
                <div className="badge badge-secondary">NEW</div>
              </h2>
              <p>{t.description}</p>
              <div className="card-actions justify-end">
                <div className="badge badge-outline">Fashion</div>
                <div className="badge badge-outline">Products</div>
              </div>
            </div>
          </div>}
      </>;
    })

  return <>
    <nav title="Mindmap Navigation" role='navigation' style={{ width: props.opened ? '320px' : '' }} className={`h-screen overflow-y-scroll px-2 bg-gray-400 border border-black transition-all grid grid-flow-row-dense gap-4`}>
      <div className={'diag-wrapper'}>
        <div className="diag-head">
          <button className="py-2 px-4 rounded bg-blue-900 hover:bg-blue-600 text-white font-bold">Close</button>
        </div>
      </div>
      {ui}
    </nav>
  </>;
}


/**
 * Represents the area of the application containing the mind map rendered by mermaid
 * @param props 
 * @returns 
 */
 export function MindMapStage(props: {ctx: MindmapContext}) {
  const ctx = useContext(props.ctx);
  const { model_signal } = ctx;
 const mermaid_ref = useRef<HTMLDivElement>(null);
/**
* Sets up popper and other events
* @param _el 
* @param index 
* @returns 
*/
 const bootstrapTopics = (_el: Element, index: number) => {
   if (model_signal.value === null) return;

   const el = _el as HTMLElement;
   // @ts-ignore
   const topic = model_signal.value.all_topics[index];

   const tooltip_el = document.querySelector(`#descriptions #${topic.id}.tooltip-data`) as HTMLElement;
   // TODO add pointer events to mindmap, add popover,
   const popper = createPopper(el, tooltip_el, { placement: 'right' });
   popper.update();
   el.style.cursor = 'pointer';
   tooltip_el.hidden = true;
   console.log('boostrapping')
   el.onclick = () => {
     document.querySelectorAll(`#descriptions .tooltip-data`).forEach(_tt => {
       const tt = _tt as HTMLElement;
       tt.hidden = true;
     });

     if (el.matches('[active]')) {
       tooltip_el.hidden = true;
       el.removeAttribute('active');
     } else {
       tooltip_el.hidden = false;
       el.setAttribute('active', 'true');

     }
   };

   document.querySelector('.descriptions.opacity-0')?.classList.remove('opacity-0');

 };
 // Once mermaid is ready
 const postRenderCallback = (id: string) => {
   if (model_signal.value === null) return;
   console.log('Mermaid running')
   const graph = document.querySelector(`#${id}`) as HTMLElement;
   const topics_elements = [...graph.querySelectorAll(".mindmap-node")];
   // Topics in the tree and the element they spawn have the same index
   topics_elements.forEach((_el, i) => bootstrapTopics(_el, i));
 };

 // this Effect renders mermaid js when ever the root topic prop changes
 useEffect(
   () => {
       console.log('Pre mermaid ref')
     if (mermaid_ref.current) {
       if (model_signal.value === null) return;
       console.log('mermaid\r\n', mermaid_ref.current.innerText )
       mermaid_ref.current.removeAttribute('data-processed');
       mermaid_ref.current.querySelector('svg')?.remove();
       // Initialize Mermaid
       mermaidAPI.initialize({ deterministicIds: true, htmlLabels: true });
       // Run Mermaid
       console.log('Pre mermaid run')
       mermaidAPI.run({ querySelector: ".mermaid", postRenderCallback });
     }

   },
   // end use effect
   [mermaid_ref.current, model_signal.value]
 );

   let mermaid_data = '';
   
   if (model_signal !== null !== null && model_signal.value) {
     mermaid_data = Mindmap.STRINGIFY(model_signal.value.root,false)
       
   }
 
   // Lets draw this thing
 return <>
   <div className="w-full grid-bg overflow-scroll h-screen">
     <div className="mermaid w-full" ref={mermaid_ref}>
       {mermaid_data}
     </div>
     <div id="descriptions" className="descriptions opacity-0">
       {model_signal?.value?.all_topics.map((t,i) => <MindmapToolTip key={i} data={t} ctx={props.ctx} />)}
     </div>
   </div>
 </>;
}

export function MindmapToolTip(props: { data: Mindmap, ctx: MindmapContext }) {
  
  let title = props.data.title;

  function _handleTitleChange(ev: SyntheticEvent) {
    const input = (ev.target as HTMLInputElement);
    title = input.value;
  }

  
  function _handleSubmitTitleChange(ev: SyntheticEvent) {
    ev.preventDefault();
    console.log('submitting title change')
    // props.ctx.updateModel(props.data.id, (t) => {
    //   if (t) {
    //     t.title = title;
    //   }
    // });
  }


  return <>
    {props.data.title.length == 0 ||
      <div id={props.data.id} className="tooltip-data" style={{ padding: "10px", backgroundColor: 'white', color: 'black' }}>
        <div>

          <form onSubmit={_handleSubmitTitleChange}>
              <input name='title' type="text" onChange={_handleTitleChange} />
            </form>
        </div>
        <div>
          {props.data.description}
        </div>
      </div>}

  </>;
}


export default function NewMindmapModal(props:NewMindmapModalProps) {
    
  const { editor_state, model_signal } = useContext(props.ctx)
  
  const dialog_ref = useRef(null)

  const templates = [
      {
          title: 'empty',
          description: 'A blank mindmap',
      }
  ];
  const _handleNewTemplate = async (e:SyntheticEvent|null, template:any) => {
      console.log(e,template)
      const test_map = new Mindmap('first', 'first', 'first', 'cloud');
      model_signal.value = Mindmap.TREE(test_map);
      _handleCloseDialogue(); 

  }

  const _handleCloseDialogue = () => {
      if (dialog_ref.current){
          (dialog_ref.current as HTMLDialogElement).close();
          console.log('closed')
      }
  }

  const _handleOpenDialogue = () => {
      if (dialog_ref.current){
          (dialog_ref.current as HTMLDialogElement).showModal();
          console.log('opened')
      }
  }

  useEffect(() => {
      const dialog = dialog_ref.current as HTMLDialogElement | null
      if (!dialog) return
      if (editor_state.value.new_board_opened){
          _handleOpenDialogue()
      }
  },[]);

  return (
  <dialog  ref={dialog_ref} className="min-h-[400px] w-screen max-w-5xl">
      <nav className="flex justify-between align-center px-2 h-10 border-1 border-black">
          <h3 className="leading-0">New Mind Map</h3>
      </nav>
      {templates.map((t,i) => {
          return <>
              <button className="h-20   px-2 py-4 flex flex-col hover:bg-slate-700 transition-all" key={i} onClick={(e) => _handleNewTemplate(e, t)}>
                  <span>{t.title}</span>
                  <span>{t.description}</span>
              </button>
          </>
      })}
  </dialog>
  )
}