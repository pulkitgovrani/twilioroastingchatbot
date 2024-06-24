import express from 'express'; 
//import twilio from 'twilio'
//import MessagingResponse from twilio.twiml.MessagingResponse;
//import MessagingResponse from 'twilio/lib/twiml/MessagingResponse';
import twilio from 'twilio';
import bodyParser from 'body-parser';
import cors from 'cors';
import axios from 'axios';
import fs from'fs';

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
const apiKey = "";
  const genAI = new GoogleGenerativeAI(apiKey);
const accountSid = '';
const authToken = '';
const client = new twilio(accountSid, authToken);
const app = express(); 
const port = 3000;

app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());


const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: "you are a ai bot that gives funny replies to encourage user to work on the problem and his goal , tease the user's work goal to make him laugh that makes other laugh  after seeing , keep the message short in 1-2  lines and make him and others laugh ",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

// const model = genAI.getGenerativeModel({
//   model: "gemini-1.5-flash",
//   systemInstruction: "You are an ai bot that encourages users to work on their goal but in a funny way by teasing the user a bit on his goals . Give funny replies but also give replies that don't fall in harm category , harrassment category , sexually explicit category . give replies that pokes user a bit on his work goals by replying in a funny way on his goal\n\nUser Input: \"I'm building a startup and coding the MVP.\"\nRoast: \"Building a startup? You sure - just dont code the most vague product\"\nInstructions: You are an AI bot that humorously teases users about their work goals. Your responses should be funny and light-hearted, never harsh or offensive. Keep the messages short (1-2 lines), focusing on making the user laugh.\n\nUser Input: \"I'm trying to learn a new programming language.\"\nRoast: \"Learning a new language? will you learn or just say it !\"\nInstructions: You are an AI bot that humorously teases users about their work goals. Your responses should be funny and light-hearted, never harsh or offensive. Keep the messages short (1-2 lines), focusing on making the user laugh.\n\nUser Input: \"I'm stuck on a bug and can't figure it out.\"\nRoast: \"Stuck on a bug? Looks like your code is trying to ghost you like others !\"\nInstructions: You are an AI bot that humorously teases users about their work goals. Your responses should be funny and light-hearted, never harsh or offensive. Keep the messages short (1-2 lines), focusing on making the user laugh.\n\nUser Input: \"I will make my startup a billion-dollar company.\"\nRoast: \"A billion-dollar company? I wonder how much you dream and execute!\"\nInstructions: You are an AI bot that humorously teases users about their work goals. Your responses should be funny and light-hearted, never harsh or offensive. Keep the messages short (1-2 lines), focusing on making the user laugh.\n",
// });

// const generationConfig = {
//   temperature: 1,
//   topP: 0.95,
//   topK: 64,
//   maxOutputTokens: 8192,
//   responseMimeType: "text/plain",
// };


async function run(incomingMsg) {
  const chatSession = model.startChat({
    generationConfig,
 // safetySettings: Adjust safety settings
 // See https://ai.google.dev/gemini-api/docs/safety-settings
    history: [
      {
        role: "user",
        parts: [
          {text: "i am working out to be fit \n"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "\"Working out\" huh? More like \"working on getting out of bed before noon.\"  You're gonna need more than wishful thinking to achieve that physique, buddy. \n"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "i will make it , i will go to gym from tomorrow"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "\"Tomorrow\" is a powerful word. Just like your motivation will be tomorrow, and the day after that, and the day after that... \n"},
        ],
      },
    ],
  });
  //console.log("heree")
  const chat = incomingMsg + "";
  //console.log(chat)
  const result = await chatSession.sendMessage(chat);
  //const result = await chatSession.sendMessage(incomingMsg);
  console.log(result.response.text())
  return result.response.text();
}



let tasks = [];
var count = 0;
app.post('/api/tasks', async (req, res) => {
  const newTasks = req.body;
  console.log(newTasks);
  const no = newTasks[0].number;
  const text = newTasks[0].text;
  const reminder = newTasks[0].reminder/60000;
   let message = text + "task scheduled with reminder of " + reminder + "minutes"
   const response= await run(message)

  sendWhatsAppMessage(no, response)
  res.status(200).send({ message: 'Tasks received and reminders set' });
});

function  scheduleReminder(task) {
  if (!task.reminder) return null;

  return setTimeout(async () => {
    // const message = await run(task.text)
    const message =  await run(`Reminder for Task: ${task.text}`)
     sendWhatsAppMessage(task.number, message)
    // Optionally, you can perform additional actions when the reminder fires
  }, task.reminder);
}


app.post('/incoming', async (req, res) => {
  const message = req.body;
  console.log(`Received message from ${message.From}: ${message.Body}`);
  // const twiml = new MessagingResponse();

 const body = message.Body.toLowerCase().trim();
 //let response = ""
  const response= await run(message.body);
 // console.log(response)
  sendWhatsAppMessage(message.From, response);
  res.status(200).send('OK'); 
});

async function sendWhatsAppMessage(to, message) {
  try {
    const response = await client.messages.create({
      body: message,
      from: '', // Your Twilio Sandbox Number
      to: ``,
    });
    console.log(`Message sent to ${to}: ${response.sid}`);
  } catch (error) {
    console.error(`Failed to send message: ${error}`);
  }
}



app.listen(port, () => { 
    console.log(`Server running on http://localhost:${port}`); 
});