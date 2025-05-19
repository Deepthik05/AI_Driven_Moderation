import express from 'express';
import multer from 'multer';
import * as Jimp from 'jimp';  // Import everything as an object
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import bodyParser from 'body-parser';
import run from './run.js';
import run2 from './run2.js';
import blur from './blur.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { log } from 'console';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: './public/uploads/', // Folder where images will be stored
  filename: (req, file, cb) => {
      const uniqueName = uuidv4() + path.extname(file.originalname); // Generate UUID
      cb(null, uniqueName);
  }
});

const upload = multer({ storage: storage });

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image'), false);
  }
};

// Serve static files from 'public'
app.use(express.static('public'));

// Parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Route for text moderation
app.post('/moderate-text', async(req, res) => {
  const text = req.body.text;
  console.log(req.body);
  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }
  
  const moderatedText = await run(text);
  console.log(moderatedText);
  res.json({ text: JSON.parse(moderatedText) });
});

// Route for image moderation
app.post('/moderate-image', upload.single('image'), async(req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
}

const path="C:/Users/HP/OneDrive/Desktop/cont/public/uploads/"+req.file.filename;
console.log(path);
const result=(await run2(path));
console.log("=============================\n"+result);
await blur(path,'public/images/'+req.file.filename,JSON.parse(result).sensitive_regions);
// console.log(newpath);

res.json({ 
  generated_image: req.file.filename,
  "results":JSON.parse(result).sensitive_regions
 });
});

  async function deleteFilesInFolder(folderPath) {
    try {
      const files = await fs.promises.readdir(folderPath);
      await Promise.all(files.map(file => fs.promises.unlink(path.join(folderPath, file))));
      // console.log('All files deleted.');
  } catch (err) {
      console.error('Error:', err);
  }
}

// Start the server
app.listen(port, async() => {
  
    await deleteFilesInFolder(path.join(__dirname, 'public/images'));
    await 3
    
    
    
    3
    deleteFilesInFolder(path.join(__dirname, 'public/uploads'));


  console.log(`Server running at http://localhost:${port}`);
});