require('dotenv').config();
const fs = require('fs');
const {GraphQLClient} = require('graphql-request');
const getRepositories = require('./getRepositories');
const getIssues = require('./getIssues');
const { async } = require('rxjs');
const token = process.env.GITHUB_TOKEN;

const clientGraphQl = new GraphQLClient("https://api.github.com/graphql", { headers: {authorization: `Bearer ${token}`}});

const num_repo = 100;
const repositories = [];
(async () => {
    process.stdout.write('Get repositories\n');
    process.stdout.write(`${repositories.length} of ${num_repo}\r`);
    for await (const repo of getRepositories(num_repo, clientGraphQl)) {
        repo.issues = [];
        for await (const issue of getIssues(num_repo, clientGraphQl, repo)) {
            repo.issues.push(issue);
        }
        repositories.push(repo);
        process.stdout.write(`${repositories.length} of ${num_repo}\r`);
    }
    console.log();

    console.log('Write file');
    fs.writeFileSync('./repositories.json', JSON.stringify(repositories, null, 2));
})().catch((err) => {
    console.error(err);
});
