namespace NexusCore.Api.Models;

public sealed record CreateCustomerRequest(
    string Name,
    string? Email,
    string? City,
    string? State,
    string? Zip);
