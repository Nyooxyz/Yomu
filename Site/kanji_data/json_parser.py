import json
import sys

original_stdout = sys.stdout
for k in range(1,34):
    with open('%s.json' % k, encoding="utf-8") as json_file:
        data = json.load(json_file)
        
        with open('one%s.json' % k, 'w', encoding="utf-8") as f:
            sys.stdout = f
            for i in range(20):
                print('{')
                print('"question":','"'+data['data'][i]['slug']+'",')
                print('"answer":','"'+data['data'][i]['japanese'][0]['reading']+'"')
                print('},')
            sys.stdout = original_stdout