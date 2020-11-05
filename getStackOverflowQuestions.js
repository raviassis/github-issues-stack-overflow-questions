const axios = require('axios');
const url_api = 'https://api.stackexchange.com/2.2/';
const axiosClient = axios.create({baseURL: url_api});
const sleep = require('./sleep');

module.exports = async (query) => {
    const questions = [];
    let has_more = true; 
    let page = 1;
    const pageSize = 100;
    while(has_more) {
        try {
            const result = await axiosClient.get(`search/advanced?page=${page}&pageSize=${pageSize}&order=desc&sort=activity&q=${query}&site=stackoverflow`);
            if(result.status === 200 && result.data) {
                questions.push(...result.data.items);
                has_more = result.data.has_more;
                page++;
            }
        } catch (e) {
            console.log(e);
        }
        sleep(10000);
    }
    
    return questions;
};
