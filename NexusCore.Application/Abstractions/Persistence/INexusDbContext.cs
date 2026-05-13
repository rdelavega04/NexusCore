using Microsoft.EntityFrameworkCore;
using NexusCore.Domain.Entities;

namespace NexusCore.Application.Abstractions.Persistence;

public interface INexusDbContext
{
    DbSet<Customer> Customers { get; }
}

