import { TreeNavigateError } from '@/errors';
import { TREE_LEAF_FLAG } from './data';
import { Leaf } from './type';

type Tree<LEAF=any> = {
    [key:string]:Tree|LEAF;
}

type WalkResult<LEAF=any> = {
    value:LEAF;
    path:string[]
}

type TraceResult<LEAF=any> = {
    find:false;
    isLeaf:false;
    value:undefined;
    nodePath:string[];
    tracePath:string[];
    untracePath:string[];
} | {
    find:true;
    isLeaf:boolean;
    value:LEAF;
    nodePath:string[];
    tracePath:string[];
    untracePath:string[];
}

type TreeExplorerOptions = {
    /**
     * Delimiter for path.
     * 
     * (deafult: '.')
     */
    delimiter?:string;
    /**
     * Allow using wildcard(*) in path.
     * 
     * (default: false)
     */
    allowWildcard?:boolean;
    /**
     * Allow using recursive wildcard(**\/*) in path.
     * 
     * When allowWildcard is false, this option is ignored.
     * 
     * (default: true)
     */
    allowRecursiveWildcard?:boolean;
}

type WalkOptions = {
    /**
     * Allow returning intermediate nodes from the tree
     * 
     * If true, it returns the intermediate node when the path is not a leaf node.
     * If false, it returns null when the path is not a leaf node.
     * 
     * (default: false)
     */
    allowIntermediate?:boolean;
}

type FindOptions = {
    treePath:string[]
}

class TreeNavigate<LEAF=any> {
    #tree:Tree<LEAF> = {};
    #delimiter:string = '.';
    #allowWildcard:boolean = false;
    #allowRecursiveWildcard:boolean = true;

    private constructor() {}

    static from<LEAF>(tree:Tree<LEAF>, options:TreeExplorerOptions = {}):TreeNavigate {
        const explorer = new TreeNavigate<LEAF>();

        explorer.#tree = tree;
        explorer.#delimiter = options.delimiter ?? '.';
        explorer.#allowWildcard = options.allowWildcard ?? false;
        explorer.#allowRecursiveWildcard = options.allowRecursiveWildcard ?? true;

        return explorer;
    }

    subtree(path:string):TreeNavigate<LEAF> {
        const keys = path.split(this.#delimiter);
        const result = this.#find(keys, this.#tree);
        if (!result) {
            throw new TreeNavigateError(`Path '${path}' does not exist`);
        }
        if (TreeNavigate.#isPrimitiveLeaf(result.value) || TreeNavigate.#isObjectLeaf(result.value)) {
            throw new TreeNavigateError(`Path '${path}' is not a subtree`);
        }

        const subtree = result.path.reduce((tree, key) => tree[key] as Tree<LEAF>, this.#tree);
        const explorer = new TreeNavigate<LEAF>();
        explorer.#tree = subtree;
        explorer.#delimiter = this.#delimiter;
        explorer.#allowWildcard = this.#allowWildcard;

        return explorer;
    }

    /**
     * 트리를 탐색하며 
     */
    get(path:string, options?:WalkOptions):LEAF|null {
        return this.walk(path, options)?.value ?? null;
    }

    walk(path:string, options:WalkOptions = {}):WalkResult|null {
        if (path === '') {
            if (options.allowIntermediate) {
                return {
                    value : this.#tree,
                    path : []
                }
            }
            return null;
        }

        const keys = path.split(this.#delimiter);
        const result = this.#find(keys, this.#tree);
        if (!result) {
            return null;
        }

        const leaf = result.value;
        if (TreeNavigate.#isPrimitiveLeaf(leaf)) {
            return result;
        }
        else if (TreeNavigate.#isObjectLeaf<LEAF>(leaf)) {
            return {
                value : leaf.value,
                path : result.path
            }
        }
        else if (options.allowIntermediate) {
            return result;
        }
        else {
            return null;
        }
    }

    trace(path:string):TraceResult<LEAF> {
        const keys = path.split(this.#delimiter);
        const options = { treePath:[] };
        const walkResult = this.#find(keys, this.#tree, options);

        let isLeaf:boolean;
        let value:LEAF;

        if (walkResult) {
            const leaf = walkResult.value;
            
            if (TreeNavigate.#isPrimitiveLeaf(leaf)) {
                isLeaf = true;
                value = leaf;
            }
            else if (TreeNavigate.#isObjectLeaf<LEAF>(leaf)) {
                isLeaf = true;
                value = leaf.value;
            }
            else {
                isLeaf = false;
                value = leaf;
            }
        
        
            return {
                find : true,
                isLeaf,
                value,
                nodePath : walkResult?.path ?? [],
                tracePath : options.treePath,
                untracePath : keys
            }
        }
        else {
            return {
                find : false,
                isLeaf : false,
                value: undefined,
                nodePath : [],
                tracePath : options.treePath,
                untracePath : keys
            }
        }
    }

    /**
     * 재귀적으로 트리 탐색
     * 경로를 찾으면 해당 경로를 반환하고, 찾지 못하면 null을 반환
     * 
     * @param keys delimiter로 split된 path, 소비될 수 있음
     * @param tree
     */
    #find(keys:string[], tree:Tree, options:FindOptions={ treePath:[] }):null|WalkResult {
        const { treePath } = options;
        const key = keys.shift();
        if (key == undefined) {
            return {
                value : tree,
                path : []
            } as WalkResult;
        }
        if (typeof tree !== 'object' || TreeNavigate.#isObjectLeaf(tree)) {
            keys.unshift(key);
            return null;
        }
        treePath.push(key);

        if (key in tree) {
            const result = this.#find(keys, tree[key], options);
            if (result) {
                return { value : result.value, path : [key, ...result.path] };
            }
        }
        else if (this.#allowWildcard) {
            if ('*' in tree) {
                const result = this.#find(keys, tree['*'], options);
                if (result) {
                    return { value : result.value, path : ['*', ...result.path] };
                }
            }
            
            if (this.#allowRecursiveWildcard && '**/*' in tree) {
                return {
                    value : tree['**/*'],
                    path : ['**/*']
                } as WalkResult;
            }
        }

        return null;
    }
    
    static #isPrimitiveLeaf(leaf:unknown) {
        return (leaf == null || typeof leaf !== 'object');
    }
    
    static #isObjectLeaf<T=any>(leaf:object):leaf is Leaf<T> {
        return leaf[TREE_LEAF_FLAG] == true;
    }
}

export default TreeNavigate;