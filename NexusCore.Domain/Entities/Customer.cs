namespace NexusCore.Domain.Entities;

public class Customer
{
    // EF
    private Customer() { }

    public Customer(
        string customerNumber,
        string firstName,
        string lastName,
        string? address = null,
        string? city = null,
        string? state = null,
        string? zipcode = null,
        string? email = null)
    {
        CustomerNumber = customerNumber ?? throw new ArgumentNullException(nameof(customerNumber));
        FirstName = firstName ?? throw new ArgumentNullException(nameof(firstName));
        LastName = lastName ?? throw new ArgumentNullException(nameof(lastName));

        Address = address;
        City = city;
        State = state;
        Zipcode = zipcode;
        Email = email;
    }

    public int Id { get; private set; }
    public string CustomerNumber { get; private set; } = null!;
    public string FirstName { get; private set; } = null!;
    public string LastName { get; private set; } = null!;
    public string? Address { get; private set; }
    public string? City { get; private set; }
    public string? State { get; private set; }
    public string? Zipcode { get; private set; }
    public string? Email { get; private set; }
}

