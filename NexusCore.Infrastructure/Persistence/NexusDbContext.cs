using Microsoft.EntityFrameworkCore;
using NexusCore.Application.Abstractions.Persistence;
using NexusCore.Domain.Entities;

namespace NexusCore.Infrastructure.Persistence;

public class NexusDbContext : DbContext, INexusDbContext
{
    public NexusDbContext(DbContextOptions<NexusDbContext> options) : base(options) { }

    public DbSet<Customer> Customers => Set<Customer>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(NexusDbContext).Assembly);
    }
}

