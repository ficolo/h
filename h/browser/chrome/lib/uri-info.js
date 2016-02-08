var settings = require('./settings');

/** encodeUriQuery encodes a string for use in a query parameter */
function encodeUriQuery(val) {
  return encodeURIComponent(val).replace(/%20/g, '+');
}

function queryHeaders() {
  try {
    var state = JSON.parse(window.localStorage.getItem("sessionState"));
    var headers = {};
    if (state.api_token) {
      headers['Authorization'] = 'Bearer ' + state.api_token;
    }
    return headers;
  } catch (err) {
    return {};
  }
}

/**
 * Queries the Hypothesis service that provides
 * statistics about the annotations for a given URL.
 */
function query(uri) {
  return fetch(settings.apiUrl + '/badge?uri=' + encodeUriQuery(uri), {
    headers: new Headers(queryHeaders())
  })
    .then(function (res) {
    return res.json();
  }).then(function (data) {
    if (typeof data.total !== 'number') {
      throw new Error('Annotation count is not a number');
    }
    return data;
  });
}

module.exports = {
  query: query
};
