import { apiClient } from "@/lib/api/api-client";

export async function getCurrentUserWithCapabilities() {
  try {
    const response = await apiClient("/auth/profile-with-capabilities", {
      method: "GET",
    });
    if (response && response.success === 1 && response.data) {
      return {
        user: response.data.user || null,
        capabilities: response.data.capabilities || [],
        isImpersonating: response.data.isImpersonating || false,
      };
    }
  } catch (error) {
    if (error && error.message && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Failed to bootstrap user from backend:", error);
  }
  return { user: null, capabilities: [] };
}
