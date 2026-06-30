using System;
using System.Collections.Generic;
using System.Text;

namespace NexusCore.Application.DTOs;

public record CustomerDto(
    int Id,
    string CustomerNumber,
    string FirstName,
    string LastName,
    string? Email,
    string? City,
    string? State,
    string? Zipcode);

