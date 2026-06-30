using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using NexusCore.Application.Abstractions.Persistence;
using NexusCore.Domain.Entities;
using NexusCore.Infrastructure.Persistence;

namespace NexusCore.Infrastructure.Repositories;

public sealed class CustomerRepository : ICustomerRepository
{
    private readonly NexusDbContext _db;

    public CustomerRepository(NexusDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<Customer>> GetPaginatedAsync(
        int skip,
        int pageSize,
        string? sortBy,
        bool sortDescending,
        CancellationToken cancellationToken = default)
    {
        var query = ApplySort(_db.Customers.AsNoTracking(), sortBy, sortDescending);

        return await query
            .Skip(skip)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Customer>> GetByLastNameAsync(string lastName, CancellationToken cancellationToken = default)
    {
        return await _db.Customers
            .AsNoTracking()
            .Where(c => c.LastName == lastName)
            .OrderBy(c => c.LastName)
            .ThenBy(c => c.FirstName)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Customer customer, CancellationToken cancellationToken = default)
    {
        await _db.Customers.AddAsync(customer, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task<int> GetTotalCountAsync(CancellationToken cancellationToken = default)
    {
        return await _db.Customers
            .AsNoTracking()
            .CountAsync(cancellationToken);
    }

    private static IQueryable<Customer> ApplySort(IQueryable<Customer> query, string? sortBy, bool desc)
    {
        return (sortBy?.ToLowerInvariant()) switch
        {
            "customernumber" => OrderBy(query, c => c.CustomerNumber, desc),
            "name" => desc
                ? query.OrderByDescending(c => c.LastName).ThenByDescending(c => c.FirstName)
                : query.OrderBy(c => c.LastName).ThenBy(c => c.FirstName),
            "email" => OrderBy(query, c => c.Email, desc),
            "city" => OrderBy(query, c => c.City, desc),
            "state" => OrderBy(query, c => c.State, desc),
            "zip" => OrderBy(query, c => c.Zipcode, desc),
            _ => OrderBy(query, c => c.Id, desc),
        };
    }

    private static IOrderedQueryable<Customer> OrderBy<TKey>(
        IQueryable<Customer> query,
        Expression<Func<Customer, TKey>> keySelector,
        bool desc)
    {
        return desc ? query.OrderByDescending(keySelector) : query.OrderBy(keySelector);
    }
}
