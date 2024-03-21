"use server";


import { prisma } from "../lib/prisma";

export default async function add(url: any) {
    
    try {        
      if(typeof url !== "string" || url === ""){
        throw new Error("Invalid URL.");
      }

      const encodedURL = `http://localhost:3000/api/getContent?url=${url}`
      
      const res = await fetch(encodedURL);
      
      const response = await res.json();
      if(res.status != 200){
        throw new Error(`API error: ${response.msg}`);
      }


  
      const commitment = await response.commitment;
      const description = await response.description;
      const deadline = await response.deadline;
      let min_pay = await response.min_pay;
      let max_pay = await response.max_pay;
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
      
      if(description == "-"){
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

      return 200;
    } 
    catch (error: any) {   
      console.log("Error in add: ", error.message);
      return 500;   
    }
}