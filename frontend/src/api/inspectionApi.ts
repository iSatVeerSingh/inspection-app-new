class InspectionApi {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async request(
    url: string,
    method: string = "GET",
    data: any = null,
    headers: Record<string, string> = {}
  ): Promise<{ success: boolean; data: any; error: any }> {
    try {
      const endpoint = this.baseURL + url;

      let auth = "";
      const jsonUser = localStorage.getItem("user");
      if (jsonUser) {
        const user = JSON.parse(jsonUser);
        auth = `Bearer ${user.access_token}`;
      }

      const config: RequestInit = {
        method,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: auth,
          ...headers,
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

  get(
    url: string,
    headers: Record<string, string> = {}
  ): Promise<{ success: boolean; data: any; error: any }> {
    return this.request(url, "GET", null, headers);
  }

  post(
    url: string,
    data: any,
    headers: Record<string, string> = {}
  ): Promise<{ success: boolean; data: any; error: any }> {
    return this.request(url, "POST", data, headers);
  }

  put(
    url: string,
    data: any,
    headers: Record<string, string> = {}
  ): Promise<{ success: boolean; data: any; error: any }> {
    return this.request(url, "PUT", data, headers);
  }

  delete(
    url: string,
    headers: Record<string, string> = {}
  ): Promise<{ success: boolean; data: any; error: any }> {
    return this.request(url, "DELETE", null, headers);
  }
}

const inspectionApi = new InspectionApi("/api");
export default inspectionApi;
