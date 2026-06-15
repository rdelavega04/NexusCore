namespace NexusCore.Application.Models;

public sealed record CreateCustomerCommand(
    string Name,
    string? Email,
    string? City,
    string? State,
    string? Zip);
