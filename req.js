const axios = require('axios');
const token_max_length = 120;
const temp = 1.0;
const top_p = 0.6;
const top_k = 40;

const getOutput = async function(input) {
    const payload = { 'context': input, 'token_max_length': token_max_length, 'temperature': temp, 'top_p': top_p, 'top_k': top_k};
    const result = await axios.post(`http://api.vicgalle.net:5000/generate`, null, {params: payload});
    console.log(result.data.text);
    return result.data.text;
};

console.log(getOutput("import numpy as np"));