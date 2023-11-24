/**
 * @devs This is a basic setup of an http client.
 */

// TODO: remove test
const TOKEN = '';

interface Params {
  [key: string]: any;
}

interface HttpClient {
  delete: (url: string, params: Params) => Promise<any>;
  get: (url: string, params: Params) => Promise<any>;
  post: (url: string, data: Params) => Promise<any>;
  put: (url: string, params: Params) => Promise<any>;
}

const Method = {
  DELETE: 'DELETE',
  POST: 'POST',
  PUT: 'PUT',
} as const;

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  },
});

const onError = (error: unknown) => {
  throw new Error(`Error: ${error}`);
};

export const httpClient: HttpClient = {
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

  async post(url: string, params: Params = {}) {
    try {
      const response = await fetch(url, {
        method: Method.POST,
        ...getHeaders(),
        body: JSON.stringify(params),
      });

      if (!response.ok) onError(response.status);

      return await response.json();
    } catch (error) {
      onError(error);
    }
  },

  async put(url: string, params: Params = {}) {
    try {
      const response = await fetch(url, {
        method: Method.PUT,
        ...getHeaders(),
        body: JSON.stringify(params),
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
        method: Method.DELETE,
        ...getHeaders(),
      });

      if (!response.ok) onError(response.status);

      return await response.json();
    } catch (error) {
      onError(error);
    }
  },
};
