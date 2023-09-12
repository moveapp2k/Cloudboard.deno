
const depth_deliminator = '  ' // 2 spaces
const id_deliminator = '__' // 2 spaces
const description_deliminator = ':::'

type MindmapShape = "square" | "circle" | "bang" | "cloud" | "hex" | "rounded" | "";


// for the sake of sanity all id will start and end width 2 "_"
const getId = (text: string) => {
  const id = text.substring(
    text.indexOf(id_deliminator) + id_deliminator.length, 
    text.lastIndexOf(id_deliminator)
  );
  return id;
}

const getTitle = (text: string) => {
  const title = text.substring(
    text.indexOf('"') + 1, 
    text.lastIndexOf('"')
  );
  return title;
}

const getShape = (_text: string): MindmapShape => {
  const text = _text.trim();
  if (text.endsWith("}}") ) return "hex";
  if (text.endsWith(")"))   return "rounded"
  if (text.endsWith("))"))  return "circle"
  if (text.endsWith("("))   return "cloud"
  if (text.endsWith("(("))  return "bang"
  if (text.endsWith("]"))   return "square"
  return "";
}

const getShapeStart = (shape:MindmapShape) => {
  switch (shape){
    case "":
      return "";
    case "hex":
      return "{{";
    case "rounded":
      return "(";
    case "circle":
      return "((";
    case "square":
        return "[";
    case "cloud":
        return ")";
    case "bang":
        return "))";
  }
}


const getShapeEnd = (shape:MindmapShape) => {
  switch (shape){
    case "":
      return "";
    case "hex":
      return "}}";
    case "rounded":
      return ")";
    case "circle":
      return "))";
    case "square":
        return "]";
    case "cloud":
        return "(";
    case "bang":
        return "((";
  }
}


export type MindmapTree = {
  root:Mindmap,
  all_topics:Mindmap[]
}

export class Mindmap {
  /**
   * Parses a mindmap into a list of topics and a root topic
   * @param text the mind map
   * @returns a topic tree
   */
  static PARSE(text: string): MindmapTree {

    const all_topics: Mindmap[] = [];
    const entries = text.split("\n").filter(t => t.toLowerCase() != 'mindmap');

    entries.forEach((raw, i) => {
      const raw_parts = raw.split(description_deliminator)
      // Remove ending or leading spaces
      const _t = raw_parts[0]
      const t = _t.trim();
      const depth = (_t.length - t.length) / 2
      const id: string = getId(t);
      const title: string = getTitle(t)
      const shape = i == 0 ? 'cloud' : getShape(t)
      const description = raw_parts[1];
      const topic = new Mindmap(id, title, description, shape);
      // Ued internally
      topic._depth = depth;
      topic._index = i;

      all_topics.push(topic);
      // Ignore the first "root" entry
      if (i > 0) {
        // sort the topics descending to find the most line topic that is 1 level up
        const parent = [...all_topics].sort((a, b) => b._index - a._index).find(topic => topic._depth === depth - 1)
        parent?.addSubTopic(topic)
      }
    })
    return { root:all_topics[0], all_topics}
  }
  /**
   * Creates a tree from a root topic
   * @param root the root topic
   * @returns a topic tree
   */
  static TREE(root:Mindmap):MindmapTree{
    const all_topics:Mindmap[] = [];
    function walkTopics(topic: Mindmap) {
      if (!topic) return
      all_topics.push(topic)
      topic.subtopics.forEach(subtopic => walkTopics(subtopic));
    }
    walkTopics(root);
    return { root, all_topics};
  }
  /**
   * Creates a mindmap string from a root topic
   * @param topic 
   * @returns 
   */
  static STRINGIFY(topic: Mindmap, withDescription:boolean = false) {
    let mindmap = `mindmap`;
    function walkTopics(topic: Mindmap) {
      mindmap = mindmap + '\n' + topic.toString(withDescription)
      topic.subtopics.forEach(subtopic => walkTopics(subtopic));
    }
    walkTopics(topic);
    return mindmap;
  }


  title: string;
  description: string;

  id: string;
  private subtopics: Mindmap[] = []
  parent?: Mindmap
  shape: MindmapShape
  // how deep in the tree we are
  private _depth = 0;
  get depth(){
    return this._depth;
  }
  // how far down in the items are wee
  private _index!: number;
  get index (){
    return this._index;
  }
  /**
   * 
   * @param id id of the node
   * @param title standard title of the node
   * @param description Additional data to show this might end up as right text
   * @param shape shape of the node
   * @param subtopics children of the node
   */
  constructor(id: string, title: string, description?: string, shape?: MindmapShape, subtopics: Mindmap[] = []) {
    this.id = id;
    this.title = title;
    this.description = description ?? '';
    this.shape = shape ?? '';
    this.subtopics = [];
  
    subtopics.forEach( t => this.addSubTopic(t))
  }
  addSubTopic(topic:Mindmap){
    this.subtopics.push(topic);
    topic.parent = this;
    topic._depth = this._depth + 1;
  }
  /**
   * For rendering with 
   * @returns 
   */
  toString(withDescription = false) {
    let depth_str = '';
    for( let i = 0; i <= this._depth; i++){
      depth_str = depth_str + depth_deliminator;
    }
    // Do i add description here
    const str = `${depth_str}${id_deliminator}${this.id}${id_deliminator}${getShapeStart(this.shape)}"${this.title}"${getShapeEnd(this.shape)}${withDescription ? description_deliminator + this.description : ''}`;
    return str; 
  }
}

export const SAMPLE_TOPIC_1 = new Mindmap('hello', 'world', 'this is my description', 'circle', []);