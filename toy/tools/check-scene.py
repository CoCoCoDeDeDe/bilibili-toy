import json

def check_refs(name, path):
    d = json.load(open(path, encoding='utf-8'))
    errors = 0
    for i, x in enumerate(d):
        for field in ['_parent', 'node', 'scene']:
            if field in x and isinstance(x[field], dict) and '__id__' in x[field]:
                ref = x[field]['__id__']
                if ref < 0 or ref >= len(d):
                    print(f'ERROR [{i}] {x.get("__type__","")}.{field} -> __id__ {ref} out of bounds')
                    errors += 1
        for list_field in ['_components', '_children']:
            if list_field in x and isinstance(x[list_field], list):
                for cref in x[list_field]:
                    if isinstance(cref, dict) and '__id__' in cref:
                        ref = cref['__id__']
                        if ref < 0 or ref >= len(d):
                            print(f'ERROR [{i}] {list_field} -> __id__ {ref} out of bounds')
                            errors += 1
    print(f'{name}: {len(d)} objects, {errors} reference errors')

check_refs('StartScene', 'bilibili-toy/assets/scenes/StartScene.scene')
check_refs('GameScene', 'bilibili-toy/assets/scenes/GameScene.scene')
