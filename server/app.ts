const express = require('express');
const app = express();
const cors = require('cors');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const OpenAI = require("openai");
require('dotenv').config();

const PORT = process.env.PORT || 4000;
const openai = new OpenAI({ apiKey: process.env.API_KEY });

app.use(cors({
    origin: '*',
    methods: ["GET"],
    allowedHeaders: ['Content-Type'],
    credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: false }));


app.get('/getContent', async (req: any, res: any) => {
    try {

        const mainURL = decodeURIComponent(req.query.url);
        // const mainURL = "https://twitter.com/itsharshag/status/1764164056225546377";

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto("https://twitter.com/itsharshag/status/1764164056225546377");

        // console.log("\n\n\n");
        // console.log(await page.content());
        // console.log("\n\n\n");

        const data = await page.title();

        const regex = /on X:(.*?)(?=\/ X)/;

        const match = data.match(regex);
        const tweetContent = match ? match[1].trim() : "-";
        // console.log("\n\nTitle:\n", tweetContent);
        
        const regex2 = /^(.*?)(?=\s*on X:)/;
        const match2 = data.match(regex2);
        const userName = match2 ? match2[1].trim() : "-";
        
        // console.log("\n\nName:\n", userName);
        
        const urlRegex = /https:\/\/([^.]+)\.com\/([^\/]+)\/status/;
        const match3 = mainURL.match(urlRegex);
        const userID = match3 ? match3[2] : "-";
        
        
        const nextData = {
            userName: userName,
            userID: userID,
            tweetText: tweetContent,
            postedOn: "-"
        }
        if(nextData.tweetText == "-"){
            throw new Error("Puppeteer did not work.");
        }

        await browser.close();

        console.log(nextData);

        const browser2 = await puppeteer.launch();
        const page2 = await browser2.newPage();
        // await page2.goto(`https://twitter.com/itsharshag`);
        await page2.goto(`https://twitter.com/${nextData.userID}`);
        // console.log("\n\n\n");
        // // console.log(await page2.content());
        // console.log("\n\n\n");

        const page2Content = await page2.content();
        const $ = cheerio.load(page2Content);
        const userDescriptionDiv = $('div[data-testid="UserDescription"]');
        const userDesc = userDescriptionDiv.text();
        const userProfSpan = $('span[data-testid="UserProfessionalCategory"]');
        const userProf = userProfSpan.text();

        console.log(userDesc);
        console.log(userProf);
        

        await browser2.close();

        
        
        const dataReceived = {...nextData};
        
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
        
        const scrapedData = JSON.parse(responseContent);
        let { commitment, description, deadline, min_pay, max_pay, is_remote, location } = scrapedData;
        if(is_remote == '-'){
            is_remote = true;
        }

        console.log(responseContent);
        console.log(scrapedData);
        


        res.status(200).json({
            commitment: commitment ? commitment : "-",
            description: description ? description : "-",
            deadline: deadline ? deadline : "-",
            min_pay: min_pay ? min_pay : "-",
            max_pay: max_pay ? max_pay : "-",
            is_remote: is_remote ? is_remote : true,
            location: location ? location : "-",
            userID: nextData.userID,
            tweetContent: dataReceived.tweetText,
            postedOn: dataReceived.postedOn,
            userName: nextData.userName,
            userDescription: userDesc,
            org: userProf
        })
    }
    catch (error: any) {
        res.status(500).json({
            msg: "An unexpected error occured in final step!",
            error: error.message
        })
    }
})


app.listen(PORT, () => console.log(`Running on: ${PORT}`));