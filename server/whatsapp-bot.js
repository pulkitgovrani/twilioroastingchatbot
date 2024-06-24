import express from 'express';
import bodyParser from 'body-parser';
import twilio from "twilio";
import axios from 'axios';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";


  const genAI = new GoogleGenerativeAI(apiKey);
  
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: "you are a ai bot that roasts user to work on the problem and his goal by roasting him , roast the user a bit more brutally that makes other laugh  after seeing , keep the message short in 1-2  lines and make him roast ",
  });
  
  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };


const accountSid = '';
const authToken = '';
const whatsappFrom = '';
const twilioClient = new twilio(accountSid, authToken);

const apiKey = "";;

// Express setup
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/webhook', async (req, res) => {
  const from = req.body.From;
  const userMessage = req.body.Body;

  try {
    // Generate response using Google Generative AI API
    const response = await axios.post(
      'https://api.generativeai.google.com/v1/models/gemini-1.5-flash:generate',
      {
        prompt: `Roast this user: "${userMessage}"`,
        temperature: 1,
        top_p: 0.95,
        top_k: 64,
        max_output_tokens: 8192,
        system_instruction: "you are an ai bot that roasts users to work on their goals by roasting them a bit more brutally to make others laugh. Keep the message short in 1-2 lines and make it a roast."
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const roastMessage = response.data.choices[0].text.trim();

    // Send the roast message back to the user on WhatsApp
    await twilioClient.messages.create({
      from: whatsappFrom,
      to: from,
      body: roastMessage
    });

    res.status(200).send('Message sent');
  } catch (error) {
    console.error('Error generating or sending roast message:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`WhatsApp bot running on port ${port}`);
});
