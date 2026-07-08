namespace PlantyHub.Api.Dtos;

public record HomepageStateDto(
    int? LayoutVersion,
    Dictionary<string, bool> Sections,
    Dictionary<string, Dictionary<string, string>> Texts,
    Dictionary<string, string> Images);

public record UpdateHomepageRequest(
    int? LayoutVersion,
    Dictionary<string, bool>? Sections,
    Dictionary<string, Dictionary<string, string>>? Texts,
    Dictionary<string, string>? Images);
