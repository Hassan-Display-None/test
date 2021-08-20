// const { Telegraf } = require('telegraf');
const { Composer } = require('micro-bot')
const axios = require('axios');



// const bot = new Telegraf("");
const bot = new Composer;


// Take the data from google sheet and store it in a data object and push each data to allData obj

let allData = {};
let data = {};
let inlineKeyboard = {};
let innerKeyboardArr = [];
let innerKeyboardObj = {};

function addHearToClass(className) {
    bot.hears(`${className}`, (ctx) => {
        bot.telegram.sendMessage(ctx.message.from.id, `${className} Lectures`, {
            reply_markup: {
                inline_keyboard: inlineKeyboard[className],
            }
        }); 
    });
}
function makeAction(lectureName, fileLink) {
    bot.action(`${lectureName}`, (ctx) => {
        ctx.answerCbQuery();
        bot.telegram.sendDocument(ctx.update.callback_query.from.id, fileLink);
    })
}

function classMaker(courseType, googleSheetData, i, n) {
    if (allData[courseType][googleSheetData[i][n]] === undefined)
    {
        allData[courseType][googleSheetData[i][n]] = [];
        inlineKeyboard[googleSheetData[i][n]] = [];
    }

    data['admin_name'] = googleSheetData[i][1];
    data['lecture_name'] = googleSheetData[i][n+1];
    data['file_link'] = googleSheetData[i][n+2];
    

    allData[courseType][googleSheetData[i][n]].push(data);

    data = {};

}

setInterval(() => {
    axios.get('https://script.google.com/macros/s/AKfycbyNNd4rwGckadsCdfOKGP4fuUX78jzX1gdqX4mIqZx3iMSmOawwjPGLBR7sc2saUQH4pg/exec').then((response) => {
    let googleSheetData = response.data.GoogleSheetData;
    allData = {};
    inlineKeyboard = {};

    allData["first_course"] = {};
    allData["second_course"] = {};

    for(let i = 1; i < googleSheetData.length; i++)
    {
        let courseType = googleSheetData[i][2];

        if(courseType === 'first_course')
        {   
            classMaker(courseType, googleSheetData, i, 3);
        } 
        else if (courseType === 'second_course')
        {
            classMaker(courseType, googleSheetData, i, 7);
        }
    }

    for(classCourse in allData)
    {
        for(className in allData[classCourse])
        {               
            for(let i = 0; i < allData[classCourse][className].length; i++)
            {
                

                innerKeyboardObj['text'] = allData[classCourse][className][i]['lecture_name'];
                innerKeyboardObj['callback_data'] = allData[classCourse][className][i]['lecture_name'];

                makeAction(allData[classCourse][className][i]['lecture_name'], allData[classCourse][className][i]['file_link']);
                innerKeyboardArr.push(innerKeyboardObj);

                if(innerKeyboardArr.length === 3)
                {
                    inlineKeyboard[className].push(innerKeyboardArr);
                    innerKeyboardArr = [];
                }
                innerKeyboardObj = {};

            }

            inlineKeyboard[className].push(innerKeyboardArr);
            addHearToClass(className);
            innerKeyboardArr = [];
        }

    }

}).catch((err) => {
    console.log(err);
})
}, 100000);

// sets all bot commands


let commandsMessage = `
Welome to BME 3 PDF storing bot.\n
/help - To get all the commands.
/first_course - All files for first course classes.
/second_course - All files for second course classes.
/add_file - to add new file (only Admins).\n
Made by @devhassan2001.
Profile photo designer @jakm0.
`

// start command
bot.command('/start', (ctx) => {
    bot.telegram.sendMessage(ctx.message.from.id, commandsMessage)
});

// help command 
bot.command('/help', (ctx) => {
    bot.telegram.sendMessage(ctx.message.from.id, commandsMessage);
})

// first_course command
bot.command('/first_course', (ctx) => {
    bot.telegram.sendMessage(ctx.message.from.id, `Chose one of these classes ${String.fromCodePoint('0x1F447')}`, {
        reply_markup: {
            keyboard: [
                [
                    {text: 'Mems_Design'},
                    {text: 'Biomechanics'},
                ],
                [
                    {text: 'Engineering_analysis'},
                    {text: 'حقوق'},
                ],
                [
                    {text: 'Biosignals'},
                    {text: 'Medical_Devices'},
                ],
                [
                    {text: 'Electronics'},
                ],
            ],
            resize_keyboard: true,
        }
    });

});


// second_course command
bot.command('/second_course', (ctx) => {
    bot.telegram.sendMessage(ctx.message.from.id, `Chose one of these classes ${String.fromCodePoint('0x1F447')}`, {
        reply_markup: {
            keyboard: [
                [
                    {text: 'Nothing'},
                ],
            ],
            resize_keyboard: true,
        }
    });

});

// add_file command
let fileLink = null;
bot.command('/add_file', (ctx) => {
    bot.telegram.sendMessage(ctx.message.from.id, 'Please send the file');
})
bot.on('document', (ctx) => {
    fileLink = ctx.message.document.file_id;
    bot.telegram.sendMessage(ctx.message.from.id, 'Are you sure you want to add this file?', {
        reply_markup: {
            inline_keyboard: [
                [
                    {text: 'yes', callback_data: 'yes'},
                    {text: 'no', callback_data: 'no'},
                ]
            ]
        }
    });
})

bot.action('yes', (ctx) => {
    ctx.answerCbQuery();
    bot.telegram.sendMessage(ctx.update.callback_query.from.id, fileLink);
    setTimeout(() => {
        bot.telegram.sendMessage(ctx.update.callback_query.from.id, 'copy the code above and add it to the link of the lecture field in the form below');
    }, 500)
    setTimeout(() => {
        bot.telegram.sendMessage(ctx.update.callback_query.from.id, 'https://forms.gle/zwCtHrcVfg4LYScz6');
    }, 1000)
    setTimeout(() => {
        bot.telegram.sendMessage(ctx.update.callback_query.from.id, 'After 1 hour the file will be added to the bot. That all, Thanks');
    }, 1500)

    fileLink = null;
});
bot.action('no', (ctx) => {
    bot.telegram.sendMessage(ctx.update.callback_query.from.id, 'Ok fine!');
});


bot.hears('malak', (ctx) => {
    for(let i = 0; i < 20; i++)
    {
        bot.telegram.sendMessage('1019280709', 'هكرتجججج');
    }
})

// bot.launch();
// immense-hollows-99923
// https://git.heroku.com/immense-hollows-99923.git
module.exports = bot;