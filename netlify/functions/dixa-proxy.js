exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { endpoint, method = 'GET', body, apiToken } = JSON.parse(event.body);

    if (!apiToken || !endpoint) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing apiToken or endpoint' })
      };
    }

    const fetchOptions = {
      method: method,
      headers: {
        'Authorization': apiToken,
        'Content-Type': 'application/json',
      },
    };

    // Only add body for non-GET requests
    if (method !== 'GET' && body) {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(`https://dev.dixa.io${endpoint}`, fetchOptions);

    const data = await response.json();

    return {
      statusCode: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
