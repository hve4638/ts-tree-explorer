import { TREE_LEAF_FLAG } from './data';
import { Leaf } from './type';

export function leaf<T=any>(value:T):Leaf<T> {
    return {
        [TREE_LEAF_FLAG] : true,
        value,
    }
}

export function isPrimitiveLeaf(leaf:unknown) {
    return (leaf == null || typeof leaf !== 'object');
}

export function isObjectLeaf<T=any>(leaf:object):leaf is Leaf<T> {
    return leaf[TREE_LEAF_FLAG] == true;
}

export default leaf;