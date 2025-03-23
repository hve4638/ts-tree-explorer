import TreeNavigate, { leaf } from '@/.';

const TREE = {
    leaf1: '1',
    dir1 : {
        leaf1 : '2',
        '*' : {
            leaf1 : '3',
            '*' : '0'
        }
    },
    leaf2 : leaf({
        leaf1 : '10',
    }),
    '*' : {
        leaf1 : '-1',
    },
    '**/*' : '-2'
}

describe('Subtree', () => {
    let explorer:TreeNavigate;

    beforeEach(() => {
        explorer = TreeNavigate.from(TREE, { delimiter: ':', allowWildcard: true });
    });

    test('get', () => {
        const subtree = explorer.subtree('dir1');
        expect(subtree.get('leaf1')).toBe('2');
        expect(subtree.get('dir:leaf1')).toBe('3');
        expect(subtree.get('dir:leaf2')).toBe('0');
    });
    
    test('wildcard tree', () => {
        const subtree = explorer.subtree('dir1:dir');
        expect(subtree.get('leaf1')).toBe('3');
        expect(subtree.get('leaf2')).toBe('0');
    });
});

