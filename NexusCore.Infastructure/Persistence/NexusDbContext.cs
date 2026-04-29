using Microsoft.EntityFrameworkCore;
using NexusCore.Domain.Entities;

namespace NexusCore.Infrastructure.Persistence;

public class NexusDbContext : DbContext
{
    public NexusDbContext(DbContextOptions<NexusDbContext> options) : base(options) { }

    public DbSet<Customer> Customers => Set<Customer>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Customer>(entity =>
        {
            entity.ToTable("customers");

            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id)
                .HasColumnName("customer_id")
                .ValueGeneratedOnAdd();

            entity.Property(x => x.CustomerNumber)
                .HasColumnName("customer_number")
                .HasMaxLength(20)
                .IsRequired();

            entity.HasIndex(x => x.CustomerNumber)
                .IsUnique();

            entity.Property(x => x.FirstName)
                .HasColumnName("first_name")
                .IsRequired();

            entity.Property(x => x.LastName)
                .HasColumnName("last_name")
                .IsRequired();

            entity.Property(x => x.Address)
                .HasColumnName("address");

            entity.Property(x => x.City)
                .HasColumnName("city");

            entity.Property(x => x.State)
                .HasColumnName("state")
                .HasColumnType("char(2)");

            entity.Property(x => x.Zipcode)
                .HasColumnName("zipcode")
                .HasMaxLength(10);

            entity.Property(x => x.Email)
                .HasColumnName("email");

            entity.HasIndex(x => x.Email)
                .IsUnique();
        });
    }
}

