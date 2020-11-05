const sleep = require('./sleep');
const query = `
{
    node(id: "{id}") {
      ... on Repository {
        id
        issues(first: 100, after:{after}, orderBy: {field: COMMENTS, direction: DESC}) {
          pageInfo {
            endCursor
            hasNextPage
          }
          nodes {
            id
            title
            number
            createdAt
          }
        }
      }
    }
  }  
`;

module.exports= async function* (num_issues, client, repo) {
    if (repo && repo['id']) {
        let collected = 0;
        let hasNextPage = true;
        let endCursor = null;
        while(hasNextPage && collected < num_issues) {
            try {
                const result = await client.request(query.replace("{after}", endCursor).replace("{id}", repo['id']));
                const node = result['node'];
                if(node) {
                    const issues = node['issues'];
                    const pageInfo = issues['pageInfo'];
                    hasNextPage = pageInfo['hasNextPage'];
                    endCursor = pageInfo['endCursor'] ? `"${pageInfo['endCursor']}"`: null;
                    for(let issue of issues['nodes']) {
                        yield issue;
                        collected++;
                    }
                }
            } catch(e) {
                sleep(10000)
            }            
        }
    }
};