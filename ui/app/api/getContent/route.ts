import OpenAI from "openai";
import cheerio from "cheerio";
import puppeteer from "puppeteer";
import path from "path";

const openai = new OpenAI({ apiKey: process.env.API_KEY });


const wait = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


export async function GET(req: Request) {
  try {
    const link = new URL(req.url);
    const fullURL: any = link.searchParams.get("url");
    const mainURL = decodeURIComponent(fullURL);

    // const browserPath = path.resolve(__dirname, "../../../../../browser/chrome.exe");
    // const browserPath2 = path.resolve("./browser/chrome.exe");

    const localChromePath = process.env.LOCAL_BROWSER_PATH;

    const browser = await puppeteer.launch({
      // executablePath: browserPath2,
      // executablePath: browserPath,
      executablePath: localChromePath,
      headless: false,
    });
    const page = await browser.newPage();
    await page.goto(mainURL);
    await wait(10000);

    try {
      await page.waitForNavigation({
        timeout: 10000,
        waitUntil: "networkidle0",
      });
    } catch (e) {}

    const data = await page.title();

    const regex = /on X:(.*?)(?=\/ X)/;

    const match = data.match(regex);
    const tweetContent = match ? match[1].trim() : "-";

    const regex2 = /^(.*?)(?=\s*on X:)/;
    const match2 = data.match(regex2);
    const userName = match2 ? match2[1].trim() : "-";

    const urlRegex = /https:\/\/([^.]+)\.com\/([^\/]+)\/status/;
    const match3 = mainURL.match(urlRegex);
    const userID = match3 ? match3[2] : "-";

    const nextData = {
      userName: userName,
      userID: userID,
      tweetText: tweetContent ? tweetContent : "-",
      postedOn: "-",
    };
    if (nextData.tweetText == "-") {
      throw new Error("Puppeteer did not work.");
    }

    await browser.close();

    const browser2 = await puppeteer.launch({
      executablePath: localChromePath,
      headless: true,
    });
    const page2 = await browser2.newPage();
    await page2.goto(`https://twitter.com/${nextData.userID}`);
    // await wait(10000);
    try {
      await page2.waitForNavigation({
        timeout: 10000,
        waitUntil: "networkidle0",
      });
    } catch (e) {}

    const page2Content = await page2.content();
    const $ = cheerio.load(page2Content);
    const userDescriptionDiv = $('div[data-testid="UserDescription"]');
    const userDesc = userDescriptionDiv.text();
    const userProfSpan = $('span[data-testid="UserProfessionalCategory"]');
    const userProf = userProfSpan.text();

    await browser2.close();

    console.log("Scraped tweet data.");

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "assistant",
          content: `${nextData.tweetText}\n This is a tweet about a hiring or a gig or a hackathon or a startup program. Extract following details:
            1. commitment(full-time, part-time, freelance),
            2. description,
            3. location,
            4. deadline,
            5. min_pay,
            6. max_pay,
            7. is_remote 
            The fields which are not specified in the tweet will have - as the value. Return a JSON with only the specified fields and their values.`,
        },
      ],
      model: "gpt-3.5-turbo",
    });

    const responseContent: any = completion.choices[0].message["content"];
    const scrapedData = JSON.parse(responseContent);
    const {
      commitment,
      description,
      deadline,
      min_pay,
      max_pay,
      is_remote,
      location,
    } = scrapedData;

    return Response.json(
      {
        commitment: commitment ? commitment : "-",
        description: description ? description : "-",
        deadline: deadline ? deadline : "-",
        min_pay: min_pay ? min_pay : "-",
        max_pay: max_pay ? max_pay : "-",
        is_remote: is_remote ? is_remote : true,
        location: location ? location : "-",
        userID: nextData.userID,
        tweetContent: nextData.tweetText,
        postedOn: "-",
        userName: nextData.userName,
        userDescription: userDesc,
        org: userProf,
      },
      {
        status: 200,
      }
    );
  } catch (error: any) {
    return Response.json(
      {
        msg: error.message,
      },
      {
        status: 500,
      }
    );
  }
}
