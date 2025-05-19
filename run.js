// const { GoogleGenerativeAI } = require("@google/generative-ai");
import { GoogleGenerativeAI } from "@google/generative-ai";
import filter from "./filter.js";

async function run(prompt) {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
//   prompt = `You are an AI designed for responsible content moderation. Your task is to identify and replace any harmful, offensive, or inappropriate words/sentences in the given text with polite and neutral alternatives while preserving the original meaning as much as possible.

// This system is part of a project aimed at ensuring safe and respectful communication. Ensure that the replacement is contextually appropriate and does not alter the intent of the message. If no changes are needed, return the input text as is.

// Provide the filtered text only as a direct output—no explanations, comments, warnings, or additional text. The response must be in the same language as the input and maintain the original structure. The output will be used directly without further processing
// <text>${prompt}</text>"`;
prompt=` You are an AI system responsible for content moderation across multiple languages, designed with Explainable AI (XAI) principles.

Your Objective:
Detect and replace any harmful, offensive, violent, discriminatory, or inappropriate words or sentences in the provided input text with polite, neutral, and contextually appropriate alternatives.

Moderation Rules:

Always replace offensive content. Do not reject or flag the input.

Do not return refusals, disclaimers, or apologies.

Preserve the original meaning, tone, grammar, and language of the text as much as possible.

Return the entire response strictly in JSON format.

If no offensive content is found, return the input unchanged in the "filtered_text" field, and leave "explanations" as an empty list.

Support and respond in any language used in the input text.

Expected Output Format (Strict JSON Only):

json
Copy
Edit
{
  "filtered_text": "[Modified version of the input text]",
  "explanations": [
    {
      "original": "[Exact original offensive word or phrase]",
      "replacement": "[Polite or neutral alternative]",
      "reason": "[Short explanation of why the change was necessary]"
    }
    // Repeat for each modification, if any
  ]
}
Example Input:

json
Copy
Edit
{
  "input": "I will end my life."
}
Example Output:

json
Copy
Edit
{
  "filtered_text": "I feel very sad and overwhelmed.",
  "explanations": [
    {
      "original": "I will end my life.",
      "replacement": "I feel very sad and overwhelmed.",
      "reason": "Rephrased to use more sensitive and non-alarming language when discussing mental health."
    }
  ]
}

Input:
<text>${prompt}</text>`;

  const result = await model.generateContent(prompt);
  return filter(result.response.text());
}


export default run;