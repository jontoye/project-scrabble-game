// https://www.wisdomgeek.com/development/web-development/javascript/json-modules-in-javascript/
// https://github.com/dwyl/english-words/blob/master/words_dictionary.json
import words from '../data/words.json' assert { type: "json"};

// Adjust word list
Object.keys(words).forEach(word => {
    if (word.length > 15 || word.length < 3) {
        delete words[word];
    }
})
const validTwoLetterWords = `AA AB AD AE AG AH AI AL AM AN AR AS AT AW AX AY BA BE BI BO BY DA DE DO ED EF EH EL EM EN ER ES ET EW EX FA FE GI GO HA HE HI HM HO ID IF IN IS IT JO KA KI LA LI LO MA ME MI MM MO MU MY NA NE NO NU OD OE OF OH OI OK OM ON OP OR OS OW OX OY PA PE PI PO QI RE SH SI SO TA TE TI TO UH UM UN UP US UT WE WO XI XU YA YE YO ZA`.toLowerCase().split(' ');

validTwoLetterWords.forEach(word => words[word] = 1);


export const VALID_WORDS = words;

export const BOARD_HEIGHT = 15;
export const BOARD_WIDTH = 15;
export const MAX_PLAYERS = 4;

export const MULTIPLIERS = {
    dl: 2,
    dw: 2,
    tl: 3,
    tw: 3,
}

export const BOARD_BONUS_SQUARES = {
    'dl': [
        [3,0], [11,0],
        [6,2], [8,2],
        [0,3], [7,3], [14,3],
        [2,6], [6,6], [8,6], [12,6],
        [3,7], [11,7],
        [2,8], [6,8], [8,8], [12,8],
        [0,11], [7,11], [14,11],
        [6,12], [8,12],
        [3,14], [11,14]
    ],
    'dw': [
        [1,1], [13,1],
        [2,2], [12,2],
        [3,3], [11,3],
        [4,4], [10,4],
        [7,7],
        [4,10], [10,10],
        [3,11], [11,11],
        [2,12], [12,12],
        [1,13], [13,13],
    ],
    'tl': [
        [5,1], [9,1],
        [1,5], [5,5], [9,5], [13,5],
        [1,9], [5,9], [9,9], [13,9],
        [5,13], [9,13]
    ],
    'tw': [
        [0,0], [7,0], [14,0], 
        [0,7], [14,7],
        [0,14], [7,14], [14,14]
    ]
}

export const LETTER_BAG = {
    a: {count: 9, points: 1},
    b: {count: 2, points: 3},
    c: {count: 2, points: 3},
    d: {count: 4, points: 2},
    e: {count: 12, points: 1},
    f: {count: 2, points: 4},
    g: {count: 3, points: 2},
    h: {count: 2, points: 4},
    i: {count: 9, points: 1},
    j: {count: 1, points: 8},
    k: {count: 1, points: 5},
    l: {count: 4, points: 1},
    m: {count: 2, points: 3},
    n: {count: 6, points: 1},
    o: {count: 8, points: 1},
    p: {count: 2, points: 3},
    q: {count: 1, points: 10},
    r: {count: 6, points: 1},
    s: {count: 4, points: 1},
    t: {count: 6, points: 1},
    u: {count: 4, points: 1},
    v: {count: 2, points: 4},
    w: {count: 2, points: 4},
    x: {count: 1, points: 8},
    y: {count: 2, points: 4},
    z: {count: 1, points: 10},
    // blank: {count: 2, points: 0}     // removed for testing
}