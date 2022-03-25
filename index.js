const _ = require('lodash');
const EasyDocx = require('node-easy-docx')

const easyDocx = new EasyDocx({
    path: 'de_mau_azota.docx'
});

function combineTextInRow(row) {
    if (!row) {
        return '';
    }
    const { items } = row;
    if (!items) {
        return row.text;
    }
    return items.reduce((text, item) => {
        const itemText = item.text || '';
        return text + itemText;
    }, '');
}

function getAnswersInRow(row) {
    if (!row) {
        return '';
    }
    const answers = [];
    const { items } = row;
    if (!items) {
        return '';
    }
    let answer = '';
    for (const item of items) {
        if ('text' in item == false) {
            if (answer) {
                answers.push(answer);
                answer = '';
            }
        } else {
            answer += item.text;
        }
    }

    if (answer != '') {
        answers.push(answer);
    }

    return answers;
}

function checkIsQuestion(data) {
    return /^Câu \d+/.test(data);
}

function checkIsAnswer(data) {
    return /^[ABCDabcd]\./.test(data);
}

function convertToAnswerObj(answers) {
    return answers.reduce((acc, answer) => {
        const opt = answer[0];
        acc[opt] = answer.replace(/^[ABCDabcd.]+ ?/g, '');
        return acc;
    }, {});
}

easyDocx.parseDocx()
    .then(data => {
        for (let i = 0; i < data.length;) {
            let question = combineTextInRow(data[i]);
            let isQuestion = checkIsQuestion(question);
            if (!isQuestion) {
                i++;
                continue;
            }
            let j = i;
            do {
                j += 1;
                const tmp = combineTextInRow(data[j]);
                if (tmp) {
                    if (!checkIsAnswer(tmp)) {
                        i++;
                        question += ' ' + tmp;
                    } else {
                        break;
                    }
                } else {
                    i++;
                }
            } while(j < data.length);

            console.log(question);
            let answers = [];
            do {
                i += 1;
                const tmp = combineTextInRow(data[i]);
                isQuestion = checkIsQuestion(tmp);
                if (isQuestion || tmp == '') {
                    break;
                }

                answers = answers.concat(getAnswersInRow(data[i]));
            } while(i < data.length);

            answers = _.compact(answers);
            answers = convertToAnswerObj(answers);
            console.log(answers);
        }
    })
    .catch(err => {
        console.error(err)
    })