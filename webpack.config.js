const Dotenv = require('dotenv-webpack');

module.exports = {
  entry: './play.js',
  output: {
    filename: 'bundle.js'
  },
  plugins: [
    new Dotenv()
  ]
};
