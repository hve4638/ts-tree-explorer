import TreeNavigate, { leaf } from '@/.';

const TREE = {
    leaf1: '1',
    dir1 : {
        leaf1 : '2',
    },
    leaf2 : leaf({
        leaf1 : '10',
    }),
    leaf3 : leaf('11'),
    '*' : {
        leaf1 : '-1',
    },
    '**/*' : '-2'
}

describe('trace', () => {
    let explorer:TreeNavigate;

    beforeEach(() => {
        explorer = TreeNavigate.from(TREE, { delimiter: ':', allowWildcard: true });
    });

    const tables:[string, object][] = [
        [
            'leaf1',
            {
                find: true,
                isLeaf: true,
                value: '1',
                path: ['leaf1'],
                tracePath: ['leaf1']
            }
        ],
        [
            'dir1',
            {
                find: true,
                isLeaf: false,
                value: { leaf1 : '2', },
                path: ['dir1'],
                tracePath: ['dir1']
            }
        ],
        [
            'dir1:leaf1:leaf2',
            {
                find: false,
                isLeaf: false,
                value: undefined,
                path: undefined,
                tracePath: ['dir1', 'leaf1']
            }
        ],
        [
            'dir:leaf1',
            {
                find: true,
                isLeaf: true,
                value: '-1',
                path: ['*', 'leaf1'],
                tracePath: ['dir', 'leaf1']
            }
        ],
    ]

    for (const [path, expected] of tables) {
        test(`path : '${path}'`, () => {
            const actual = explorer.trace(path);
            expect(actual).toEqual(expected);
        });
    }
});
