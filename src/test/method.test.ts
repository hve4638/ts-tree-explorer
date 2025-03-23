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
    leaf3 : leaf('11'),
    '*' : {
        leaf1 : '-1',
    },
    '**/*' : '-2'
}

describe('TreeNavigate', () => {
    let explorer:TreeNavigate;

    beforeEach(() => {
        explorer = TreeNavigate.from(TREE, { delimiter: ':', allowWildcard: true });
    });

    test('get', () => {
        // get() 은 leaf 값 반환, 없으면 null 반환
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
    
    test('middle node', () => {
        // allowIntermediate가 false인 경우, 중간 노드 접근 시 null 반환
        expect(explorer.get('dir1')).toEqual(null);
        expect(explorer.get('dir1', { allowIntermediate:true })).toEqual({
            leaf1 : '2',
            '*' : {
                leaf1 : '3',
                '*' : '0'
            }
        });
    });

    test('명시적 leaf', ()=>{
        // object는 중간 노드와 모호하므로 leaf()로 명시적으로 지정 필요 
        expect(explorer.get('leaf2')).toEqual({ leaf1 : '10' });
        expect(explorer.get('leaf2:leaf1')).toEqual(null);
        expect(explorer.get('leaf2:value')).toEqual(null);
    })

    test('명시적 leaf', ()=>{
        // object가 아니더라도 명시적으로 leaf() 지정 가능
        expect(explorer.get('leaf3')).toEqual('11');
    })

    test('no path', () => {
        expect(explorer.walk('')).toEqual(null);
    });
});
