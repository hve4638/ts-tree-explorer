import { TREE_LEAF_FLAG } from './data';

export type Leaf<T=any> = {
    [TREE_LEAF_FLAG]:true;
    value:T;
}
