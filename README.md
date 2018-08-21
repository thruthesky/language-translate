# Translate Language

## How to fix the default language code

* You can set the default language code by setting `LanguageTranslate.languageCode`.

```` typescript
export class AppComponent {
  constructor(
    public tr: LanguageTranslate
  ) {
    this.initializeApp();
    this.tr.languageCode = 'ko';
  }
````

## How to do language translation

```` html
{{ tr.t({'en': 'Mneu', 'ko': '메뉴'}, {}) }}
````
