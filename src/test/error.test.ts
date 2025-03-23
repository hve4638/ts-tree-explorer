import TreeNavigate, { leaf } from '@/.';
import { TreeNavigateError } from '@/errors';

const TREE = {
    leaf1: '1',
    dir1 : {
        leaf1 : '2',
        '*' : {
            leaf1 : '3',
            '*' : '0'
        }
    },
}

describe('Subtree error', () => {
    let explorer:TreeNavigate;

    beforeEach(() => {
        explorer = TreeNavigate.from(TREE, { delimiter: ':', allowWildcard: true });
    });

    test('Leaf에 subtree 생성 시도', () => {
        expect(() => explorer.subtree('leaf1')).toThrow(TreeNavigateError);
    });
    test('잘못된 경로', () => {
        expect(() => explorer.subtree('no-dir')).toThrow(TreeNavigateError);
    });
});

