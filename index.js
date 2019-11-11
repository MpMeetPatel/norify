#!/usr/bin/env node

const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const inquirer = require('inquirer');
const fse = require('fs-extra');
const path = require('path');
const CLI = require('clui');
const delay = require('delay');
const util = require('util');

const exec = util.promisify(require('child_process').exec);
const filesUtil = require('./lib/files');
const Spinner = CLI.Spinner;

clear();

console.log(
    chalk.blueBright(figlet.textSync('NORIFY', { horizontalLayout: 'full' }))
);
console.log(chalk.blueBright('Generate Node API boilerplates from CLI !'));
console.log(chalk.blueBright('----------------------------------------'));

if (filesUtil.directoryExist('.git')) {
    console.log(
        chalk.red(
            'Already a Git repository!,Please remove .git folder and let norify do the rest ...'
        )
    );
    process.exit();
}

const CHOICES = fse.readdirSync(path.join(__dirname, 'api-boilerplates'));

const QUESTIONS = [
    {
        name: 'project-choice',
        type: 'list',
        message: 'What project template would you like to generate?',
        choices: CHOICES
    },
    {
        name: 'project-name',
        type: 'input',
        message: 'Project name:',
        validate: function(input) {
            if (/^([A-Za-z\-\_\d])+$/.test(input)) return true;
            else
                return 'Project name may only include letters, numbers, underscores and hashes.';
        }
    }
];

inquirer.prompt(QUESTIONS).then(async answers => {
    const status = new Spinner('Generating Your Project ...');
    const install = new Spinner('Installing Dependencies, Please wait ...');
    const gitInit = new Spinner('Initializing with git ...');
    try {
        status.start();
        await delay(1000);
        if (filesUtil.directoryExist(answers['project-name'])) {
            console.log(
                chalk.red(`${answers['project-name']} folder already exists!`)
            );
            status.stop();
            process.exit(0);
        } else {
            await fse.copySync(
                path.join(
                    __dirname,
                    'api-boilerplates',
                    answers['project-choice']
                ),
                `${answers['project-name']}`
            );

            status.stop();
            console.log(chalk.green.bold('Project Generated'));

            install.start();
            await exec(`cd ${answers['project-name']} && npm install`);
            install.stop();

            gitInit.start();
            await delay(1500);
            await exec(`cd ${answers['project-name']} && git init`);
            gitInit.stop();

            console.log(
                chalk.yellow.bold(
                    `cd ./${answers['project-name']} and enjoy !!!`
                )
            );
        }
    } catch (err) {
        console.log(err);
        install.stop();
        status.stop();
    }
});
