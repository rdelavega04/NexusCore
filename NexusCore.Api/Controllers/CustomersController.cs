using Microsoft.AspNetCore.Mvc;
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

    [HttpGet]
    [ProducesResponseType(typeof(List<Customer>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<Customer>>> GetAll(CancellationToken cancellationToken)
    {
        var customers = await _customerService.GetAllCustomersAsync(cancellationToken);
        return Ok(customers);
    }
}

