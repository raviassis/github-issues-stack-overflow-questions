const sleep = require('./sleep');
const repositoryQuery = `
{
    search(
        query: "stars:>=100 sort:stars",
        type: REPOSITORY, 
        first: 100,
        after: {after}
    ) {
        pageInfo {
        endCursor
        hasNextPage
        }
        nodes {
            ... on Repository {
                id
                nameWithOwner
                stargazerCount
                issues {
                    totalCount
                }
            }
        }
    }
}  
`;

const isValid= (repo) => {
    return repo.stargazerCount >= 100 &&
            repo.issues.totalCount >= 100;
};

module.exports = async function* (num_repositories, client) {
    let collected = 0;
    let hasNextPage = true;
    let endCursor = null;
    while (hasNextPage && collected < num_repositories) {
        try {
            const result = await client.request(repositoryQuery.replace("{after}", endCursor));
            const search = result['search'];
            const pageInfo = search ? search['pageInfo'] : null;
            const nodes = search ? search['nodes'] : null;
            
            if(nodes && pageInfo) {
                hasNextPage = pageInfo['hasNextPage'];
                endCursor = pageInfo['endCursor'] ? `"${pageInfo['endCursor']}"`: null;
                for(let node of search['nodes']) {
                    if(isValid(node) && collected <= num_repositories) {
                        collected++;
                        yield node;
                    }
                }
            }  
        } catch (e) {
            sleep(10000);
        }              
    }    
};