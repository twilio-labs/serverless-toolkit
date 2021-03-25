const boxen = require('boxen');
const chalk = require('chalk');

const printInBox = (heading, body) => {
  console.log(
    boxen(chalk`{green {bold ${heading}}}\n\n${body}`, {
      padding: 1,
      borderStyle: 'round',
    })
  );
};

module.exports = { printInBox };
