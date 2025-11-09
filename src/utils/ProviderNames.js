// Map internal provider IDs to user-friendly display names
export const PROVIDER_DISPLAY_NAMES = {
  kaido: "Server 1",
  animepahe: "Server 2",
};

// Get display name for a provider ID
export function getProviderDisplayName(providerId) {
  return PROVIDER_DISPLAY_NAMES[providerId] || providerId;
}
