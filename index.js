import express from 'express';
import read from './jsonFileStorage.js';

const app = express();
app.set('view engine', 'ejs');

const FILENAME = 'data.json';

const getAllRecipes = (req, res) => {
  read(FILENAME, (err, data) => {
    if (err) {
      console.error('Read error', err);
      res.status(500).send(err);
      return;
    }

    const categories = [...new Set(data.recipes.map((recipe) => recipe.category ?? 'Uncategorised'))];
    console.log(categories);

    res.status(200).render('index', { recipes: data.recipes, categories });
  });
};

const getRecipeByIndex = (req, res) => {
  read(FILENAME, (err, data) => {
    if (err) {
      console.error('Read error', err);
      res.status(500).send(err);
      return;
    }

    const recipe = data.recipes[req.params.index];
    if (!recipe) {
      res.status(404).send('Sorry, we cannot find that!');
      return;
    }

    res.status(200).render('recipe', recipe);
  });
};

const getRecipesByCategory = (req, res) => {
  read(FILENAME, (err, data) => {
    if (err) {
      console.error('Read error', err);
      res.status(500).send(err);
      return;
    }

    const { category } = req.params;
    let recipes = data.recipes.map((recipe, index) => ({ ...recipe, index }));
    if (category === 'uncategorised') recipes = recipes.filter((el) => !el.category);
    else recipes = recipes.filter((el) => el.category?.toLowerCase() === category);

    if (recipes.length === 0) {
      res.status(404).send('Sorry, we cannot find that!');
      return;
    }

    res.status(200).render('category', { recipes });
  });
};

// const getRecipesByYield = (req, res) => {
//   read(FILENAME, (err, data) => {
//     if (err) {
//       console.error('Read error', err);
//       res.status(500).send(err);
//       return;
//     }

//     const yieldNum = Number(req.params.num);
//     if (Number.isNaN(yieldNum) || yieldNum <= 0) {
//       res.status(404).send('Sorry, we cannot find that');
//       return;
//     }

//     const recipes = data.recipes.filter((el) => Number(el.yield) === yieldNum);
//     let content = '';
//     if (recipes.length > 0) {
//       recipes.forEach((recipe) => {
//         Object.keys(recipe).forEach((key) => { content += `<p><strong>${key}</strong>: ${getInnerContent(key, recipe)}</p>`; });
//         content += '<hr>';
//       });
//     } else content = `<p>No recipes of yield ${yieldNum}</p>`;

//     const html = `
//       <html>
//         <body>
//           ${content}
//         </body>
//       </html>
//       `;
//     res.status(200).send(html);
//   });
// };

// const getRecipesByLabel = (req, res) => {
//   read(FILENAME, (err, data) => {
//     if (err) {
//       console.error('Read error', err);
//       res.status(500).send(err);
//       return;
//     }

//     const label = req.params.label.toLowerCase();
//     const recipes = data.recipes.filter((el) => el.label?.toLowerCase().replaceAll(' ', '-') === label);

//     if (recipes.length === 0) {
//       res.status(404).send(`Sorry, no recipes with label ${label}!`);
//       return;
//     }

//     let content = '';
//     recipes.forEach((recipe) => {
//       Object.keys(recipe).forEach((key) => {
//         content += `<p><strong>${key}</strong>: ${getInnerContent(key, recipe)}</p>`;
//       });
//       content += '<hr>';
//     });

//     const html = `
//       <html>
//         <body>
//           ${content}
//         </body>
//       </html>
//       `;
//     res.status(200).send(html);
//   });
// };

app.get('/', getAllRecipes);
app.get('/recipe/:index', getRecipeByIndex);
app.get('/category/:category', getRecipesByCategory);
// app.get('/yield/:num', getRecipesByYield);
// app.get('/recipe-label/:label', getRecipesByLabel);

app.listen(3004);
