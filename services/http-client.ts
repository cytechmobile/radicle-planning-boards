/**
 * @devs This is a basic setup of an http client.
 */

// TODO: remove test
const TOKEN = '';

interface Params {
  [key: string]: string;
}

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  },
});

const onError = (error: unknown) => {
  throw new Error(`Error: ${error}`);
};

export const httpClient = {
  async get(url: string, params: Params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();

      const requestUrl = queryString ? `${url}?${queryString}` : url;

      const response = await fetch(requestUrl);

      if (!response.ok) onError(response.status);

      return await response.json();
    } catch (error) {
      onError(error);
    }
  },

  async post(url: string, data: Params = {}) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        ...getHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) onError(response.status);

      return await response.json();
    } catch (error) {
      onError(error);
    }
  },

  async put(url: string, data: Params = {}) {
    try {
      const response = await fetch(url, {
        method: 'PUT',
        ...getHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) onError(response.status);

      return await response.json();
    } catch (error) {
      onError(error);
    }
  },

  async delete(url: string, params: Params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();

      const requestUrl = queryString ? `${url}?${queryString}` : url;

      const response = await fetch(requestUrl, {
        method: 'DELETE',
        ...getHeaders(),
      });

      if (!response.ok) onError(response.status);

      return await response.json();
    } catch (error) {
      onError(error);
    }
  },
};
