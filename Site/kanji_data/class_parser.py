import json
import sys

original_stdout = sys.stdout
for k in range(1,33):
    with open('C:/Users/floca/OneDrive/Desktop/Furo/Site/kanji_data/jlpt-5/%s.json' % k, encoding="utf-8") as json_file:
        data = json.load(json_file)
        
        with open('page%s.html' % k, 'w', encoding="utf-8") as f:
            sys.stdout = f
            for i in range(20):
                print('<div class="card">')
                print('<div class="'+ data['data'][i]['slug'] + ' kanji-smol">')
                print(data['data'][i]['slug'])
                print('</div>')
                print('<div class="hira-smol">')
                print(data['data'][i]['japanese'][0]['reading'])
                print('</div>')
                print('<div class="translation">')
                print(data['data'][i]['senses'][0]["english_definitions"][0])
                print('</div>')
                print('<div class="progress-bar-smol">')
                print('<div class="percent-progress">')
                print('</div>')
                print('<div class="percent-bar">')
                print('</div>')
                print('</div>')
                print('</div>')
            sys.stdout = original_stdout
            