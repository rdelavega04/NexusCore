using NexusCore.Application.Abstractions.Persistence;
using NexusCore.Application.DTOs;
using NexusCore.Application.Models;
using NexusCore.Domain.Entities;

namespace NexusCore.Application.Services;

public sealed class CustomerService
{
    private readonly ICustomerRepository _customerRepository;

    public CustomerService(ICustomerRepository customers)
    {
        _customerRepository = customers;
    }

    // Expose the optimized keyset pagination query through the service
    public async Task<IReadOnlyList<CustomerDto>> GetCustomersPageAsync(
        int skip,
        int pageSize,
        string? sortBy,
        bool sortDescending,
        CancellationToken cancellationToken = default)
    {
        var customers = await _customerRepository.GetPaginatedAsync(
            skip,
            pageSize,
            sortBy,
            sortDescending,
            cancellationToken);

        return customers.Select(c => new CustomerDto(
            c.Id,
            c.CustomerNumber,
            c.FirstName,
            c.LastName,
            c.Email,
            c.City,
            c.State,
            c.Zipcode
        )).ToList();
    }

    // Expose the fast index search query through the service
    public async Task<IReadOnlyList<CustomerDto>> SearchByLastNameAsync(string lastName, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(lastName))
            return Array.Empty<CustomerDto>();

        var customers = await _customerRepository.GetByLastNameAsync(lastName.Trim(), cancellationToken);

        return customers.Select(c => new CustomerDto(
            c.Id,
            c.CustomerNumber,
            c.FirstName,
            c.LastName,
            c.Email,
            c.City,
            c.State,
            c.Zipcode
        )).ToList();
    }

    public Task<int> GetTotalCountAsync(CancellationToken cancellationToken = default)
    {
        return _customerRepository.GetTotalCountAsync(cancellationToken);
    }

    public async Task<Customer> CreateCustomerAsync(CreateCustomerCommand command, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(command);

        var name = command.Name.Trim();
        if (string.IsNullOrEmpty(name))
        {
            throw new ArgumentException("Name is required.", nameof(command));
        }

        var (firstName, lastName) = SplitName(name);
        var customerNumber = GenerateCustomerNumber();

        var customer = new Customer(
            customerNumber,
            firstName,
            lastName,
            address: null,
            NullIfWhiteSpace(command.City),
            NormalizeState(command.State),
            NullIfWhiteSpace(command.Zip),
            NullIfWhiteSpace(command.Email));

        await _customerRepository.AddAsync(customer, cancellationToken);
        return customer;
    }

    private static (string FirstName, string LastName) SplitName(string fullName)
    {
        var parts = fullName.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        var first = parts[0];
        var last = parts.Length > 1 ? string.Join(' ', parts[1..]) : "-";
        return (first, last);
    }

    /// <summary>
    /// Generates a unique value within the 20-character limit on <see cref="Customer.CustomerNumber"/>.
    /// </summary>
    private static string GenerateCustomerNumber()
    {
        var g = Guid.NewGuid().ToString("N");
        return "C" + g[..19];
    }

    private static string? NullIfWhiteSpace(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    private static string? NormalizeState(string? state)
    {
        var s = NullIfWhiteSpace(state);
        if (s is null)
        {
            return null;
        }

        var upper = s.ToUpperInvariant();
        if (upper.Length > 2)
        {
            throw new ArgumentException("State must be a 2-letter abbreviation.", nameof(state));
        }

        return upper;
    }
}
