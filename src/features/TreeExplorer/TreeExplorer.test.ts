import TreeExplorer from './TreeExplorer';
import { leaf } from './utils';

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

describe('TreeExplorer', () => {
    test('get', () => {
        const explorer = TreeExplorer.from(TREE, ':');
        expect(explorer.get('leaf1')).toBe('1');
        expect(explorer.get('dir1:leaf1')).toBe('2');
        expect(explorer.get('dir1:dir:leaf1')).toBe('3');
        expect(explorer.get('dir1:dir:leaf2')).toBe('0');
        expect(explorer.get('nodir:leaf1')).toBe('-1');
        expect(explorer.get('nodir:leaf2')).toBe('-2');

        expect(explorer.get('leaf1:leaf1')).toBe(null);
        expect(explorer.get('leaf1:leaf1:leaf1')).toBe(null);
        expect(explorer.get('dir1:leaf1:leaf1')).toBe(null);
        expect(explorer.get('dir1:dir:leaf1:leaf1')).toBe(null);
    });
    test('walk', () => {
        const explorer = TreeExplorer.from(TREE, ':');
        expect(explorer.walk('leaf1')?.path).toEqual(['leaf1']);
        expect(explorer.walk('dir1:leaf1')?.path).toEqual(['dir1', 'leaf1']);
        expect(explorer.walk('dir1:dir:leaf1')?.path).toEqual(['dir1', '*', 'leaf1']);
        expect(explorer.walk('dir1:dir:leaf2')?.path).toEqual(['dir1', '*', '*']);
        expect(explorer.walk('nodir:leaf1')?.path).toEqual(['*', 'leaf1']);
        expect(explorer.walk('nodir:leaf2')?.path).toEqual(['**/*']);
        
        expect(explorer.walk('leaf1:leaf1')).toBe(null);
        expect(explorer.walk('leaf1:leaf1:leaf1')).toBe(null);
        expect(explorer.walk('dir1:leaf1:leaf1')).toBe(null);
        expect(explorer.walk('dir1:dir:leaf1:leaf1')).toBe(null);
    });
    
    test('leaf', () => {
        const explorer = TreeExplorer.from(TREE, ':');
        expect(explorer.get('dir1')).toEqual(null);
        expect(explorer.get('dir1', { allowIntermediate:true })).toEqual({
            leaf1 : '2',
            '*' : {
                leaf1 : '3',
                '*' : '0'
            }
        });
        expect(explorer.get('leaf2')).toEqual({ leaf1 : '10' });
    });

    test('root', () => {
        const explorer = TreeExplorer.from(TREE, ':');
        expect(explorer.walk('')).toEqual(null);
    });
});

describe('Subtree from TreeExplorer', () => {
    test('get', () => {
        const explorer = TreeExplorer.from(TREE, ':');
        
        const subtree = explorer.subtree('dir1');
        expect(subtree.get('leaf1')).toBe('2');
        expect(subtree.get('dir:leaf1')).toBe('3');
        expect(subtree.get('dir:leaf2')).toBe('0');
    });
    test('wildcard tree', () => {
        const explorer = TreeExplorer.from(TREE, ':');
        
        const subtree = explorer.subtree('dir1:dir');
        expect(subtree.get('leaf1')).toBe('3');
        expect(subtree.get('leaf2')).toBe('0');
    });
});

