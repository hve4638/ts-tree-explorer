import { TreeNavigateError } from '@/errors';
import { TREE_LEAF_FLAG } from './data';
import { Leaf } from './type';

type Tree<LEAF=any> = {
    [key:string]:Tree|LEAF;
}

type TreeResult<LEAF=any> = {
    value:LEAF;
    path:string[]
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

    walk(path:string, options:WalkOptions = {}):TreeResult|null {
        const keys = path.split(this.#delimiter);
        const result = (
            path === ''
            ? { value : this.#tree, path : [] }
            : this.#find(keys, this.#tree)
        );
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

    /**
     * 재귀적으로 트리 탐색
     * 경로를 찾으면 해당 경로를 반환하고, 찾지 못하면 null을 반환
     * 
     * @param keys delimiter로 split된 path, 소비될 수 있음
     * @param tree
     */
    #find(keys:string[], tree:Tree):null|TreeResult {
        if (keys.length === 0) {
            return {
                value : tree,
                path : []
            } as TreeResult;
        }
        if (typeof tree !== 'object' || TreeNavigate.#isObjectLeaf(tree)) {
            return null;
        }

        const key = keys.splice(0, 1)[0];
        if (key in tree) {
            const result = this.#find(keys, tree[key]);
            if (result) {
                return { value : result.value, path : [key, ...result.path] };
            }
        }
        else if (this.#allowWildcard) {
            if ('*' in tree) {
                const result = this.#find(keys, tree['*']);
                if (result) {
                    return { value : result.value, path : ['*', ...result.path] };
                }
            }
            
            if (this.#allowRecursiveWildcard && '**/*' in tree) {
                return {
                    value : tree['**/*'],
                    path : ['**/*']
                } as TreeResult;
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