# Tree Navigate

Navigating nested object structures using path notation.

## Install

```bash
npm install tree-navigate
```

## Example

```ts
import TreeNavigate from 'tree-navigate'

const explorer = TreeNavigate.from({
    'file' : 'item1',
    'directory' : {
        'file1' : 'item2',
        'file2' : 'item3',
    },
    '*' : 'item4'
});

console.log(explorer.get('file')); // output : item1
console.log(explorer.get('directory.file1')); // output : item2
console.log(explorer.get('directory.file2')); // output : item3
console.log(explorer.get('other')); // output : item4
```

custom delimiter

```ts
import TreeNavigate from 'tree-navigate'

const explorer = TreeNavigate.from({
    'directory' : {
        'file1' : 'item1',
        'file2' : 'item2',
    }
}, { delimiter : ':' });

console.log(explorer.get('directory:file1')); // output : item1
console.log(explorer.get('directory:file2')); // output : item2
```

walk

```ts
import TreeNavigate from 'tree-navigate'

const explorer = TreeNavigate.from({
    'file' : 'item1',
    'directory' : {
        'file1' : 'item2',
        'file2' : 'item3',
    },
    '*' : 'item4'
});

console.log(explorer.get('file')); // {output : { value: 'item1', path: ['file'] }
console.log(explorer.walk('directory:file1')); // output : { value: 'item2', path: ['directory', 'file1'] }
console.log(explorer.walk('directory.file2')); // output : { value: 'item3', path: ['directory', 'file2'] }
console.log(explorer.walk('other')); // output : { value: 'item4', path: ['*'] }
```

