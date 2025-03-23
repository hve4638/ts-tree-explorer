import { TREE_LEAF_FLAG } from './data';
import { Leaf } from './type';

export function leaf<T=any>(value:T):Leaf<T> {
    return {
        [TREE_LEAF_FLAG] : true,
        value,
    }
}

export default leaf;