import TreeNavigate, { leaf } from '@/.';
import { TreeNavigateError } from '@/errors';

const TREE = {
    leaf1: '1',
    dir1 : {
        leaf2 : '2'
    },
    '*' : {
        leaf3 : '3'
    },
    '**/*' : '4'
}

describe('Subtree options : delimiter', () => {
    test('default delimiter', () => {
        const explorer = TreeNavigate.from(TREE);
        expect(explorer.get('leaf1')).toEqual('1');
        expect(explorer.get('dir1.leaf2')).toEqual('2');
    });
    test("default '.'", () => {
        const explorer = TreeNavigate.from(TREE, { delimiter: '.' });
        expect(explorer.get('leaf1')).toEqual('1');
        expect(explorer.get('dir1.leaf2')).toEqual('2');
    });
    test("default ':'", () => {
        const explorer = TreeNavigate.from(TREE, { delimiter: ':' });
        expect(explorer.get('leaf1')).toEqual('1');
        expect(explorer.get('dir1:leaf2')).toEqual('2');
    });
});

describe('Subtree options : allowWildcard', () => {
    test('allowWildcard : default', () => {
        const explorer = TreeNavigate.from(TREE);
        expect(explorer.get('other.leaf3')).toEqual(null);
        expect(explorer.get('other.no-leaf')).toEqual(null);
    });
    test("allowWildcard : true", () => {
        const explorer = TreeNavigate.from(TREE, { allowWildcard: true });
        expect(explorer.get('other.leaf3')).toEqual('3');
        expect(explorer.get('other.no-leaf')).toEqual('4');
    });
    test("allowWildcard : false", () => {
        const explorer = TreeNavigate.from(TREE, { allowWildcard: false });
        expect(explorer.get('other.leaf3')).toEqual(null);
        expect(explorer.get('other.no-leaf')).toEqual(null);
    });
});

describe('Subtree options : recursiveAllowWildcard', () => {
    test('recursiveAllowWildcard : default', () => {
        const explorer = TreeNavigate.from(TREE);
        expect(explorer.get('other.leaf3')).toEqual(null);
        expect(explorer.get('other.no-leaf')).toEqual(null);
    });
    test("recursiveAllowWildcard : ignored", () => {
        const explorer = TreeNavigate.from(TREE, { allowWildcard: false, allowRecursiveWildcard: true });
        expect(explorer.get('other.leaf3')).toEqual(null);
        expect(explorer.get('other.no-leaf')).toEqual(null);
    });
    test("recursiveAllowWildcard : true", () => {
        const explorer = TreeNavigate.from(TREE, { allowWildcard: true, allowRecursiveWildcard: true });
        expect(explorer.get('other.leaf3')).toEqual('3');
        expect(explorer.get('other.no-leaf')).toEqual('4');
    });
    test("recursiveAllowWildcard : false", () => {
        const explorer = TreeNavigate.from(TREE, { allowWildcard: true, allowRecursiveWildcard: false });
        expect(explorer.get('other.leaf3')).toEqual('3');
        expect(explorer.get('other.no-leaf')).toEqual(null);
    });
});

