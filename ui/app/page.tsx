import { prisma } from '../lib/prisma'
import { redirect } from "next/navigation";

export default async function Home() {
  
  async function addData (data: FormData) {
    "use server";
    const url = data.get("url")?.valueOf();
    
    
    try {
      if(typeof url !== "string" || url === ""){
        throw new Error("Invalid URL.");
      }
      console.log("Start: ", url);
      const encodedURL = encodeURIComponent(url);
      const res = await fetch(`https://scraper-2mg4.onrender.com/getContent?url=${encodedURL}`);
      const response = await res.json();
      console.log(response);
  
      if(res.status != 200){
        throw new Error("Something went wrong with the OpenAI servers.\nPlease try again.");
      }
  
      console.log("got data from main backend");
      
  
      const commitment = await response.commitment;
      const description = await response.description;
      const deadline = await response.deadline;
      let min_pay = await response.min_pay;
      min_pay = parseInt(min_pay);
      let max_pay = await response.max_pay;
      max_pay = parseInt(max_pay);
      let is_remote = await response.is_remote;
      if(is_remote != false){
        is_remote = true;
      }
      const location = await response.location;
      const userID = await response.userID;
      const tweetContent = await response.tweetContent;
      const postedOn = await response.postedOn;
      const userName = await response.userName;
      const userDescription = await response.userDescription;
      const org = await response.org;
      
      if(!description || !userName || !userID){
        throw new Error("Something went wrong while scraping the tweet.");
      }
  
      await prisma.Tweet.create({
        data: {
          content: tweetContent ? tweetContent : "-",
          userid: userID ? userID : "-",
          location: location ? location : "-",
          deadline: deadline ? deadline : "-"
        }
      })
  
      await prisma.Author.create({
        data: {
          userid: userID ? userID : "-",
          name: userName ? userName : "-",
          description: userDescription ? userDescription : "-",
          org: org ? org : "-"
        }
      })
  
      await prisma.Gig.create({
        data: {
          commitment: commitment ? commitment : "-",
          description: description ? description : "-",
          location: location ? location : "-",
          postedOn: postedOn ? postedOn : "-",
          min_pay: min_pay ? min_pay : "-",
          max_pay: max_pay ? max_pay : "-",
          is_remote: is_remote ? is_remote : true
        }
      })

      console.log("Data added.");

       
    } 
    catch (error) {      
      console.log("Error in addData: ", error);   
      redirect('/failure');   
    }

    redirect('/success'); 
     
  }
  




  return (
    <main className="flex flex-col justify-start items-center w-screen min-h-screen h-auto overflow-x-hidden overflow-y-auto">

      <div className="w-[80vw] ">
        <h1 className="mb-12 text-4xl sm:text-7xl text-center font-bold mt-12 sm:mt-20">Tweet Scraper</h1>
      </div>

      <form action={addData} className="flex flex-col w-screen justify-center items-center mb-4 gap-2">
        <input
          type="text"
          name="url"
          placeholder="Enter Tweet URL"
          className="mr-2 px-2 outline-none border-[1px] border-gray-500 rounded-[10px] w-[90vw] sm:w-[60vw] h-[6vh]"
        />
        <button
          type="submit"
          className="bg-blue-300 hover:bg-blue-500 text-xl font-bold px-2 py-1 sm:px-4 rounded-[10px] border-[1px] border-gray-500 text-black text-center flex flex-row justify-center items-center"
        >
          Fetch
        </button>
      </form>

    </main>
  );
};

