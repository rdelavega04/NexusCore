using NexusCore.Domain.Entities;

namespace NexusCore.Application.Abstractions.Persistence;

public interface ICustomerRepository
{
    Task<IReadOnlyList<Customer>> GetPaginatedAsync(int lastSeenId, int pageSize, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Customer>> GetByLastNameAsync(string lastName, CancellationToken cancellationToken = default);
    Task AddAsync(Customer customer, CancellationToken cancellationToken = default);
    Task<int> GetTotalCountAsync(CancellationToken cancellationToken = default);
}
