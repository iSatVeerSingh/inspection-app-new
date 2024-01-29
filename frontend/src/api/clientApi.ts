class ClientApi {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async request(
    url: string,
    method: string = "GET",
    data: any = null
  ): Promise<{ success: boolean; data: any; error: any }> {
    try {
      const endpoint = this.baseURL + url;

      const config: RequestInit = {
        method,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      };

      if (data) {
        config.body = JSON.stringify(data);
      }

      const response = await fetch(endpoint, config);
      const responseData = await response.json();

      if (!response.ok) {
        return {
          success: false,
          data: null,
          error: responseData.message || "Request failed",
        };
      }

      return { success: true, data: responseData, error: null };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: `HTTP error: ${error.message}`,
      };
    }
  }

  get(url: string): Promise<{ success: boolean; data: any; error: any }> {
    return this.request(url, "GET", null);
  }

  post(
    url: string,
    data: any
  ): Promise<{ success: boolean; data: any; error: any }> {
    return this.request(url, "POST", data);
  }

  put(
    url: string,
    data: any
  ): Promise<{ success: boolean; data: any; error: any }> {
    return this.request(url, "PUT", data);
  }

  delete(url: string): Promise<{ success: boolean; data: any; error: any }> {
    return this.request(url, "DELETE", null);
  }
}

const clientApi = new ClientApi("/client");
export default clientApi;
