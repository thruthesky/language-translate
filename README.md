# language-translate
Angular Language Translate Module

## TODO list

각 템플릿에서 언어별로 코딩을 할 수 있도록 한다. 이렇게 하면 솔직히 http 로 json 을 로드하는 부담도 없고, 각 템플릿마다 지정하므로 용량도 작고,

사실 코딩을 해 보니, email 과 같은 소수의 부분만 겹치지 대부분 겹치지 않음.


예)

{{ ln.t({ ko: '....', 'en': '...', 'ch': '....'}, {'name' => 'User Name'})}}