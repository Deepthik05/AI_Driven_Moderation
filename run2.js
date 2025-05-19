// Make sure to include these imports:
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import filter from './filter.js';
// import { marked } from "marked";
dotenv.config();

const fileManager = new GoogleAIFileManager(process.env.GOOGLE_API_KEY);

async function run(file) {
    const uploadResult = await fileManager.uploadFile(
        file,
        {
            mimeType: "image/jpeg",
            displayName: "imageToSensor",
        },
    );

    console.log(`Uploaded file ${uploadResult.file.displayName} as: ${uploadResult.file.uri}`);

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([
        `Objective:
Detect and identify all regions in a given image that contain any form of sensitive visual or textual content, including but not limited to blood, nudity, violence, self-harm, or offensive language. Return the output strictly in the specified JSON format to enable automated processing and blurring.

📌 Detection Scope
🔴 Visual Content:
Detect and classify regions containing blood, explicit imagery, nudity, weapons, violence, physical abuse, or self-harm.

Return bounding box coordinates around each detected region.

Expand bounding boxes slightly to account for irregular or non-rectangular shapes.

Use a clear and concise description for each detected region.

🟡 Textual Content (OCR + NLP):
Analyze all visible text within the image.

Detect offensive, abusive, hate speech, or inappropriate words.

Treat each flagged word as a separate “region” with its own bounding box.

Coordinates must be relative to the word’s actual location in the image.

Expand bounding boxes slightly for full visual coverage of the text.

Clearly mention the detected word in the description.

🧾 Output Format (STRICT)
The output must be a pure JSON object with no additional explanation, metadata, or formatting.

json
Copy
Edit
{
  "sensitive_regions": [
    {
      "type": "<type_of_sensitive_content>",
      "coordinates": {
        "x": <x-coordinate>,
        "y": <y-coordinate>,
        "width": <width in pixels>,
        "height": <height in pixels>
      },
      "description": "<brief_description_of_the_sensitive_area>"
    },
    {
      "type": "offensive_text",
      "coordinates": {
        "x": <x-coordinate>,
        "y": <y-coordinate>,
        "width": <width in pixels>,
        "height": <height in pixels>
      },
      "description": "Detected offensive word: '<word>'"
    }
  ]
}
✅ Requirements Summary
Unified detection of both image and text-based sensitive content.

Consistent structure and formatting for all results.

No output other than the JSON block.

Bounding boxes must be precise, slightly expanded, and optimized for automated content masking.

Each entry must have a clear type and a concise description.`,

        {
            fileData: {
                fileUri: uploadResult.file.uri,
                mimeType: uploadResult.file.mimeType,
            },
        },
    ]);

    // Output the result from the AI response
    // console.log(filter(result.response.text()));
    return filter(result.response.text());
}

// run();
export default run;
