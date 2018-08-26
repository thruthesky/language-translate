/**
 * @file language-translate
 * @desc translate
 */
import { Injectable } from '@angular/core';

interface LanguageText {
    ko?: string;
    en?: string;
    ch?: string;
    jp?: string;
}
type LanguageCode = string;


@Injectable({
    providedIn: 'root'
})
export class LanguageTranslate {

    languageCode: LanguageCode = 'en';
    constructor(

    ) {
        this.languageCode = this.correctLanguageCode(<any>this.getBrowserLanguage());
    }



    /**
     *
     * Returns a string after patching error information.
     * @param str Error string
     * @param info Error information to patch into the string
     *
     *
     *
     * @return patched string
     *
     * @code
     *      _.patchmarker( 'Unknown #no', {no: 123} ) // returns 'Unknown 123'
     *
     */
    patchMarker(str, info: object = null): string {

        if (info === null || typeof info !== 'object') {
            return str;
        }
        const keys = Object.keys(info);
        if (!keys.length) {
            return str;
        }

        for (const k of keys) {
            str = str.replace('#' + k, (<string>info[k]));
        }
        return str;
    }


    /**
     * Simply Returns the text of the code.
     *
     * @param code code. The code will be transformed to uppercase.
     *
     * @example How to display texts on template
     *          {{ fire.getText() | json }}
     */
    // getText(code?: string): string {
    //     code = code.toUpperCase();
    //     const ln = this.languageCode;
    //     if ( texts !== void 0 && texts[code] !== void 0 && texts[code][ln] !== void 0 ) {
    //         return texts[code][ln];
    //     } else {
    //         return code;
    //     }
    // }

    correctLanguageCode(lc: LanguageCode): LanguageCode {
        if (lc === 'ko' || lc === 'en' || lc === 'jp' || lc === 'ch') {

        } else {
            lc = 'en';
        }
        return lc;
    }
    /**
     * Returns translated text string.
     * @param code code to translate
     * @param info information to add on the translated text
     *
     */
    translate(code: LanguageText, info?): string {
        // console.log('lang: ', this.languageCode);
        const ln = this.correctLanguageCode(this.languageCode);
        let str = code[ln];
        if ( ! str ) {
            str = code['en'];
        }
        return this.patchMarker(str, info);
    }

    /**
     * Alias of translate()
     * @param code same as translate()
     * @param info same as transate()
     */
    t(code: LanguageText, info?: any): string {
        // console.log('code', code);
        return this.translate(code, info);
    }


    /**
     * Returns browser language
     *
     * @param full If it is true, then it returns the full language string like 'en-US'.
     *              Otherwise, it returns the first two letters like 'en'.
     *
     * @returns
     *      - the browser language like 'en', 'en-US', 'ko', 'ko-KR'
     *      - null if it cannot detect a language.
     */
    getBrowserLanguage(full = false): string {
        const nav = window.navigator;
        const browserLanguagePropertyKeys = ['language', 'browserLanguage', 'systemLanguage', 'userLanguage'];
        let ln: string = null;
        // support for HTML 5.1 "navigator.languages"
        if (Array.isArray(nav.languages)) {
            for (let i = 0; i < nav.languages.length; i++) {
                const language = nav.languages[i];
                if (language && language.length) {
                    ln = language;
                    break;
                }
            }
        }
        // support for other well known properties in browsers
        for (let i = 0; i < browserLanguagePropertyKeys.length; i++) {
            const language = nav[browserLanguagePropertyKeys[i]];
            if (language && language.length) {
                ln = language;
                break;
            }
        }
        if (ln) {
            if (full === false) {
                ln = ln.substring(0, 2);
            }
        }
        return ln;
    }


}
