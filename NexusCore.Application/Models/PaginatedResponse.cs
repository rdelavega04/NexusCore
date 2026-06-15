using System;
using System.Collections.Generic;
using System.Text;

namespace NexusCore.Application.Models
{
    public class PaginatedResponse<T>
    {
        public IReadOnlyList<T> Items { get; set; } = Array.Empty<T>();
        public int TotalRecords { get; set; }
    }
}
