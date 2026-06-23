import { apiClient } from "@/lib/api/api-client";

export async function getCurrentUserWithCapabilities() {
  try {
    const response = await apiClient("/auth/me-with-capabilities", {
      method: "GET",
    });
    if (response && response.success === 1 && response.data) {
      return {
        user: response.data.user || null,
        capabilities: response.data.capabilities || [],
      };
    }
  } catch (error) {
    console.error("Failed to bootstrap user from backend:", error);
  }
  return { user: null, capabilities: [] };
}
