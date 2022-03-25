const _ = require('lodash');
const EasyDocx = require('node-easy-docx')

const easyDocx = new EasyDocx({
    path: 'test.docx'
});

function getQuestion(row) {
    if (!row) {
        return '';
    }
    const { items } = row;
    if (!items) {
        return '';
    }
    return items.reduce((text, item) => {
        return text + item.text;
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

function checkIsQuestion(question) {
    return /^Câu \d+/.test(question);
}

easyDocx.parseDocx()
    .then(data => {
        // console.log(JSON.stringify(data, null, 2));
        // JSON data as result
        for (let i = 0; i < data.length;) {
            const question = getQuestion(data[i]);
            let isQuestion = checkIsQuestion(question);
            if (!isQuestion) {
                i++;
                continue;
            }

            console.log(question);
            let answers = [];
            do {
                i += 1;
                const tmp = getQuestion(data[i]);
                isQuestion = checkIsQuestion(tmp);
                if (isQuestion || tmp == '') {
                    break;
                }

                answers = answers.concat(getAnswersInRow(data[i]));
            } while(i < data.length);

            console.log(answers);
        }
    })
    .catch(err => {
        console.error(err)
    })