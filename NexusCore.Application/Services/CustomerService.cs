using Microsoft.EntityFrameworkCore;
using NexusCore.Application.Abstractions.Persistence;
using NexusCore.Domain.Entities;

namespace NexusCore.Application.Services;

public sealed class CustomerService
{
    private readonly INexusDbContext _db;

    public CustomerService(INexusDbContext db)
    {
        _db = db;
    }

    public Task<List<Customer>> GetAllCustomersAsync(CancellationToken cancellationToken = default)
    {
        return _db.Customers
            .AsNoTracking()
            .OrderBy(c => c.Id)
            .ToListAsync(cancellationToken);
    }
}

