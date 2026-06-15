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

    // 1. Keyset Paginated Query - O(1) constant performance on massive tables
    public async Task<IReadOnlyList<Customer>> GetPaginatedAsync(int lastSeenId, int pageSize, CancellationToken cancellationToken = default)
    {
        // AsNoTracking: This bypasses Entity Framework's internal change tracker mechanism, cutting down memory allocation drastically when querying thousands of data rows meant exclusively for UI display
        return await _db.Customers
            .AsNoTracking()
            .OrderBy(c => c.Id) // Must sort by our primary key sequence
            .Where(c => c.Id > lastSeenId) // Database immediately jumps here using the PK index
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    // 2. Index Filtered Query - Instantly hits the B-Tree index on LastName
    public async Task<IReadOnlyList<Customer>> GetByLastNameAsync(string lastName, CancellationToken cancellationToken = default)
    {
        return await _db.Customers
            .AsNoTracking()
            .Where(c => c.LastName == lastName) // Triggers IX_customers_last_name
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
}
