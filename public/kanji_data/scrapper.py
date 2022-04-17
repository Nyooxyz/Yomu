import requests
import json
import sys
import re

id = 600

for k in range(1,89):
    r=requests.get("https://jisho.org/api/v1/search/words?keyword=%23jlpt-n3&page="+str(k))
    original_stdout = sys.stdout
    if r.status_code == 200 and 'application/json' in r.headers.get('Content-Type',''):
        for item in r.json().get('data'):
            with open('mySQLPageN3.txt', 'a', encoding="utf-8") as f:
                sys.stdout = f 
                
                print("(" + "'" + str(id) + "','" + item['slug'] + "','" +  item['japanese'][0]['reading'] + "','" + item['senses'][0]["english_definitions"][0] + "'),",end=' ')
                id += 1
                sys.stdout = original_stdout
            