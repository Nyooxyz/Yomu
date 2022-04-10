import json
import sys

id = 0


original_stdout = sys.stdout
for k in range(1,33):
    with open('C:/Users/floca/OneDrive/Desktop/Furo/Site/public/kanji_data/jlpt-5/%s.json' % k, encoding="utf-8") as json_file:
        data = json.load(json_file)
        
        with open('mySQLPageAllCorrect3.txt', 'a', encoding="utf-8") as f:
            sys.stdout = f
                        
            for i in range(20):
                print("(" + "'" + str(id) + "','" + data['data'][i]['slug'] + "','" +  data['data'][i]['japanese'][0]['reading'] + "','" + data['data'][i]['senses'][0]["english_definitions"][0] + "'),",end=' ')
                id += 1
                
        
            sys.stdout = original_stdout