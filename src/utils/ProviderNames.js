// Map internal provider IDs to user-friendly display names
export const PROVIDER_DISPLAY_NAMES = {
  kaido: "Server 1",
  hianime: "Server 2",
  animepahe: "Server 3",
  megaplay: "Server 4",
};

// Get display name for a provider ID
export function getProviderDisplayName(providerId) {
  return PROVIDER_DISPLAY_NAMES[providerId] || providerId;
}
