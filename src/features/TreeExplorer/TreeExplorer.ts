import { TREE_LEAF_FLAG } from "./data";
import { Leaf } from "./type";

type Tree<LEAF=any> = {
    [key:string]:Tree|LEAF;
}

type TreeResult<LEAF=any> = {
    value:LEAF;
    path:string[]
}

type WalkOptions = {
    /**
     * 트리에서 중간 노드를 반환하도록 허용
     */
    allowIntermediate?:boolean;
}

class TreeExplorer<LEAF=any> {
    #tree:Tree<LEAF> = {};
    #splitChar:string = '.';
    #allowWildcard:boolean = true;

    static from<LEAF>(tree:Tree<LEAF>, splitChar:string='.', allowWildcard:boolean = true):TreeExplorer {
        const explorer = new TreeExplorer<LEAF>();

        // structedClone() 은 fast-deep-equal에서 제대로 비교할 수 없는 문제가 존재하므로 대신 JSON.parse(JSON.stringify())를 사용
        explorer.#tree = JSON.parse(JSON.stringify(tree));
        explorer.#splitChar = splitChar;
        explorer.#allowWildcard = allowWildcard;

        return explorer;
    }

    private constructor() {}

    subtree(path:string):TreeExplorer<LEAF> {
        const keys = path.split(this.#splitChar);
        const result = this.#find(keys, this.#tree);
        if (!result) {
            throw new Error(`Path '${path}' does not exist`);
        }
        if (TreeExplorer.#isPrimitiveLeaf(result.value) || TreeExplorer.#isObjectLeaf(result.value)) {
            throw new Error(`Path '${path}' is not a subtree`);
        }

        const subtree = result.path.reduce((tree, key) => tree[key] as Tree<LEAF>, this.#tree);
        const explorer = new TreeExplorer<LEAF>();
        explorer.#tree = subtree;
        explorer.#splitChar = this.#splitChar;
        explorer.#allowWildcard = this.#allowWildcard;

        return explorer;
    }

    get(path:string, options?:WalkOptions):LEAF|null {
        return this.walk(path, options)?.value ?? null;
    }

    walk(path:string, options:WalkOptions = {}):TreeResult|null {
        const keys = path.split(this.#splitChar);
        const result = (
            path === ''
            ? { value : this.#tree, path : [] }
            : this.#find(keys, this.#tree)
        );
        if (!result) {
            return null;
        }

        const leaf = result.value;
        if (TreeExplorer.#isPrimitiveLeaf(leaf)) {
            return result;
        }
        else if (TreeExplorer.#isObjectLeaf<LEAF>(leaf)) {
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
        if (typeof tree !== 'object') {
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
            
            if ('**/*' in tree) {
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

export default TreeExplorer;