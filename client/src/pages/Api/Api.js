import axios from "axios";
const api = "https://hackanintern.herokuapp.com"

const Api = axios.create({
 baseURL: api,
});
Api.defaults.headers.post['Content-Type'] = 'application/json';

export default Api;