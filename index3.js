require('dotenv').config();
const fs = require('fs');
const {GraphQLClient} = require('graphql-request');
const getRepositories = require('./getRepositories');
const getIssues = require('./getIssues');
const getQuestions = require('./getStackOverflowQuestions')
const token = process.env.GITHUB_TOKEN2;

const clientGraphQl = new GraphQLClient("https://api.github.com/graphql", { headers: {authorization: `Bearer ${token}`}});

const num_repo = 100;
const repositories = [];
(async () => {
    console.log('Get repositories');
    console.log(`${repositories.length} of ${num_repo}`);
    for await (const repo of getRepositories(num_repo, clientGraphQl)) {
        repo.issues = [];
        for await (const issue of getIssues(num_repo, clientGraphQl, repo)) {
            repo.issues.push(issue);
        }
        repositories.push(repo);
        console.log(`${repositories.length} of ${num_repo}`);
    }
    console.log();

    console.log('Write file');
    fs.writeFileSync('./repositories.json', JSON.stringify(repositories, null, 2));
})().catch((err) => {
    console.error(err);
});
