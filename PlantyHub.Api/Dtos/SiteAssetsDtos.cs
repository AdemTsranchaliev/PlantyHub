namespace PlantyHub.Api.Dtos;

public record SiteAssetsDto(Dictionary<string, string> Images);

public record UpdateSiteAssetsRequest(Dictionary<string, string>? Images);
