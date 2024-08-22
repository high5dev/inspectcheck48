const API_BASE = "https://playbyplay.hostedapp.cloud";
// const API_BASE = "http://192.168.234.127:8082";
// const API_BASE = "http://0.0.0.0:8082";

import axios from 'axios';

const API_URL = API_BASE + "/s1/";
let tHeaders = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
};
module.exports = {
  postData(url = '', data = {}, token = "") {
    if (token.length > 0) tHeaders['token'] = token;
    return axios({
      baseURL: API_URL,
      url: url,
      method: 'post',
      headers: tHeaders,
      responseType: 'json',
      data: data,
    }).then(response => response.data);
  },
  getData(url = "", data = {}, token = "") {
    if (token.length > 0) tHeaders['token'] = token;
    return axios({
      baseURL: API_URL,
      params: data,
      url: url,
      method: 'get',
      headers: tHeaders,
      responseType: 'json',
    }).then(response => response.data);
  },
  deleteData(url = '', data = {}, token = "") {
    if (token.length > 0) tHeaders['token'] = token;
    return axios({
      baseURL: API_URL,
      url: url,
      method: 'delete',
      headers: tHeaders,
      responseType: 'json',
      data: data,
    }).then(response => response.data);
  },

  uploadFile(url = "", data, token, username, password, header = {}) {
    var lHeaders = {
      'Accept': 'application/json',
      'Content-Type': 'multipart/form-data',
      ...header
    };
    if (token.length > 0) lHeaders['token'] = token;
    if (username.length > 0) lHeaders['username'] = username;
    if (password.length > 0) lHeaders['password'] = password;
    return module.exports.fetchWithTimeout(API_URL + url, {
      method: 'POST',
      cache: false,
      headers: lHeaders,
      body: data,
      timeout: 45000
    }).then(async response => {
      return await response.json();
    });
    // var lHeaders = {
    //   'Content-Type': 'multipart/form-data',
    // };
    // if (token.length > 0) lHeaders['token'] = token;
    // if (username.length > 0) lHeaders['username'] = username;
    // if (password.length > 0) lHeaders['password'] = password;
    // return axios({
    //   baseURL: API_URL,
    //   url: url,
    //   method: "POST",
    //   cache: false,
    //   headers: lHeaders,
    //   responseType: 'json',
    //   data: data,
    // }).then(response => response.data);
  },
  fetchWithTimeout(resource, options) {
    const {timeout = 30000} = options;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    return fetch(resource, {
      ...options,
      signal: controller.signal
    }).finally(() => {
      clearTimeout(id);
    });
  }
};
