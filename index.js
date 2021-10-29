import express from 'express';
import read from './jsonFileStorage.js';

const app = express();
const FILENAME = 'data.json';

const getRecipeByIndex = (req, res) => {
  read(FILENAME, (err, data) => {
    if (err) {
      console.error('Read error', err);
      res.status(500).send(err);
      return;
    }
    const recipe = data.recipes[req.params.index];
    if (recipe) {
      let content = '';
      Object.keys(recipe).forEach((key) => { content += `<p><strong>${key}</strong>: ${recipe[key]}</p>\n`; });
      const html = `
      <html>
        <body>
          ${content}
        </body>
      </html>
      `;
      res.status(200).send(html);
    } else {
      res.status(404).send('Sorry, we cannot find that!');
    }
  });
};

app.get('/recipe/:index', getRecipeByIndex);

app.listen(3004);
