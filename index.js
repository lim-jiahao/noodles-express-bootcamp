import express from 'express';
import cookieParser from 'cookie-parser';
import read from './jsonFileStorage.js';

const app = express();
app.use(cookieParser());
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

    let favIndexes = [];
    if (req.cookies.favourites) favIndexes = req.cookies.favourites;

    res.status(200).render('index', { recipes: data.recipes, categories, favIndexes });
  });
};

const getRecipeByIndex = (req, res) => {
  read(FILENAME, (err, data) => {
    if (err) {
      console.error('Read error', err);
      res.status(500).send(err);
      return;
    }

    const { index } = req.params;
    const recipe = data.recipes[index];
    recipe.index = index;

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

const addRecipeToFavourites = (req, res) => {
  const { index } = req.query;

  let favIndexes = [];

  if (req.cookies.favourites) favIndexes = req.cookies.favourites;

  if (!favIndexes.includes(Number(index))) favIndexes.push(Number(index));

  res.cookie('favourites', favIndexes);
  res.redirect('/');
};

const removeAllFavourites = (req, res) => {
  res.clearCookie('favourites');
  res.redirect('/');
};

app.get('/', getAllRecipes);
app.get('/recipe/:index', getRecipeByIndex);
app.get('/category/:category', getRecipesByCategory);
app.get('/favourites', addRecipeToFavourites);
app.get('/favourites/remove', removeAllFavourites);

app.listen(3004);
