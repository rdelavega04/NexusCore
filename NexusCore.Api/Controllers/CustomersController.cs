using Microsoft.AspNetCore.Mvc;
using NexusCore.Api.Models;
using NexusCore.Application.DTOs;
using NexusCore.Application.Models;
using NexusCore.Application.Services;
using NexusCore.Domain.Entities;

namespace NexusCore.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class CustomersController : ControllerBase
{
    private readonly CustomerService _customerService;

    public CustomersController(CustomerService customerService)
    {
        _customerService = customerService;
    }

    // ==========================================
    // 1. HIGH-PERFORMANCE KEYSET PAGINATION
    // ==========================================
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedResponse<CustomerDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PaginatedResponse<CustomerDto>>> GetPaginated(
    [FromQuery] int lastSeenId = 0,
    [FromQuery] int pageSize = 20,
    CancellationToken cancellationToken = default)
    {
        // Enforce upper bound
        if (pageSize > 100) pageSize = 100;

        // 1. Fetch the total dynamic count from the database service
        int totalCount = await _customerService.GetTotalCountAsync(cancellationToken);

        // 2. Fetch the specific keyset page slice
        var customers = await _customerService.GetCustomersPageAsync(lastSeenId, pageSize);

        // 3. Return the combined metadata payload
        var response = new PaginatedResponse<CustomerDto>
        {
            Items = customers,
            TotalRecords = totalCount
        };

        return Ok(response);
    }

    // ==========================================
    // 2. INDEX-OPTIMIZED LAST NAME SEARCH
    // ==========================================
    [HttpGet("search")]
    [ProducesResponseType(typeof(IReadOnlyList<CustomerDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<IReadOnlyList<CustomerDto>>> SearchByLastName(
        [FromQuery] string lastName,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(lastName))
        {
            return BadRequest("Search query 'lastName' cannot be empty.");
        }

        var results = await _customerService.SearchByLastNameAsync(lastName, cancellationToken);
        return Ok(results);
    }

    //[HttpGet]
    //[ProducesResponseType(typeof(IReadOnlyList<Customer>), StatusCodes.Status200OK)]
    //public async Task<ActionResult<IReadOnlyList<Customer>>> GetAll(CancellationToken cancellationToken)
    //{
    //    var customers = await _customerService.GetAllCustomersAsync(cancellationToken);
    //    return Ok(customers);
    //}

    [HttpPost]
    [ProducesResponseType(typeof(Customer), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Customer>> Create([FromBody] CreateCustomerRequest request, CancellationToken cancellationToken)
    {
        if (request is null || string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest("Name is required.");
        }

        try
        {
            var customer = await _customerService.CreateCustomerAsync(
                new CreateCustomerCommand(request.Name, request.Email, request.City, request.State, request.Zip),
                cancellationToken);

            return Created($"/api/customers/{customer.Id}", customer);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }
}

