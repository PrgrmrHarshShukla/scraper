const express = require('express');
const app = express();
const cors = require('cors');
const puppeteer = require('puppeteer');
const OpenAI = require("openai");
require('dotenv').config();

const PORT = process.env.PORT || 4000;
const openai = new OpenAI({ apiKey: process.env.API_KEY });

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3000/api/add', 'https://oppscraper.vercel.app'],
    methods: ["GET"],
    allowedHeaders: ['Content-Type'],
    credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: false }));



app.get('/getContent', async (req: any, res: any) => {
    try {
        const URL = decodeURIComponent(req.query.url);

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(URL)

        const userNameEl = await page.$('div[data-testid="User-Name"]');
        const userName = await page.evaluate(
            (el: HTMLElement | null) => el ? el.innerText : "-", userNameEl
        );

        const tweetTextEl = await page.$('div[data-testid="User-Name"]');
        const tweetText = await page.evaluate(
            (el: HTMLElement | null) => el ? el.innerText : "-", tweetTextEl
        );


        
        const nextData = {
            userName: userName.split('\n')[0],
            userID: userName.split('\n')[1] ? userName.split('\n')[1].substring(1) : "-",
            tweetText: tweetText,
            postedOn: "-"
        }
        
        

        res.redirect(307, '/extractDetails?data=' + JSON.stringify(nextData));
        await browser.close();
    } 
    catch (error: any) {
        res.status(500).json({
            msg: "An unexpected error occured in an intermediate step!",
            errMsg: error.message,
            error: error
        })
    }
})


app.get('/extractDetails', async (req: any, res: any) => {
    try {
        const dataReceived = JSON.parse(req.query.data);
        
        const completion = await openai.chat.completions.create({
            messages: [{ role: "assistant", content: `${dataReceived.tweetText}\n This is a tweet about a hiring or a gig or a hackathon or a startup program. Extract following details:
            1. commitment(full-time, part-time, freelance), 
            2. description, 
            3. location, 
            4. deadline, 
            5. min_pay, 
            6. max_pay, 
            7. is_remote 
            The fields which are not specified in the tweet will have - as the value. Return a JSON with only the specified fields and their values.` }],
            model: "gpt-3.5-turbo",
        });

        const responseContent = completion.choices[0].message['content'];
        
        const userID = dataReceived.userID;
        const browser = await puppeteer.launch();
        const page2 = await browser.newPage();
        await page2.goto(`https://twitter.com/${userID}`);

        const userTitleEl = await page2.$('div[data-testid="UserName"]');
        const userTitle = await page2.evaluate(
            (el: HTMLElement | null) => el ? el.innerText : "-", userTitleEl
        );
        const userDescEl = await page2.$('div[data-testid="UserDescription"]');
        const userDesc = await page2.evaluate(
            (el: HTMLElement | null) => el ? el.innerText : null, userDescEl
        );
        const userProfEl = await page2.$('div[data-testid="UserProfessionalCategory"]');
        const userProf = await page2.evaluate(
            (el: HTMLElement | null) => el ? el.innerText : "-", userProfEl
        );

        const scrapedData = JSON.parse(responseContent);
        const { commitment, description, deadline, min_pay, max_pay, is_remote, location } = scrapedData;


        res.status(200).json({
            commitment: commitment ? commitment : "-",
            description: description ? description : "-",
            deadline: deadline ? deadline : "-",
            min_pay: min_pay ? min_pay : "-",
            max_pay: max_pay ? max_pay : "-",
            is_remote: is_remote ? is_remote : true,
            location: location ? location : "-",
            userID: userID,
            tweetContent: dataReceived.tweetText,
            postedOn: dataReceived.postedOn,
            userName: userTitle.split('\n')[0],
            userDescription: userDesc,
            org: userProf
        })
    } 
    catch (error) {
        res.status(500).json({
            msg: "An unexpected error occured in final step!",
            error: error
        })
    }
})


app.listen(PORT, () => console.log(`Running on: ${PORT}`));