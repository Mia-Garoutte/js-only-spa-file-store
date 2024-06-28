using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace POC.FileStore
{
    public class SearchResult 
    {
        public string Term { get; set; } = String.Empty;
        public IList<Asset> ItemsFound { get; set; } = new List<Asset>();

        public long SizeInBytes { get; set; }

        public int TotalFiles { get => ItemsFound.Count; }
    }
}
