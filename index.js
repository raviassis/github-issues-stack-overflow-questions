require('dotenv').config();
const fs = require('fs');
const getQuestions = require('./getStackOverflowQuestions');
const repositories = require('./repositories.json');

(async () => {
    let count = 0;
    console.log('Get repositories questions on StackOverflow');
    console.log(`${count} of ${repositories.length}`);
    for (const repo of repositories) {
        for (const issue of repo.issues) {
            if (!issue.gotQuestions) {
                const query = `${repo.nameWithOwner}/issues/${issue.number}`;
                issue.so_questions = await getQuestions(query);
                issue.gotQuestions = true;
            }            
        }
        
        fs.writeFileSync('./repositories.json', JSON.stringify(repositories, null, 2));
        count++;
        console.log(`${count} of ${repositories.length}`);
    }
    console.log();

    console.log('Write file');
    fs.writeFileSync('./repositories.json', JSON.stringify(repositories, null, 2));
})().catch((err) => {
    console.error(err);
});
