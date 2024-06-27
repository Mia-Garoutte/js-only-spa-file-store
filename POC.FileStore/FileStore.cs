using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace POC.FileStore
{
    public class FileStore : IFileStore
    {
        private readonly string _fileStoreLocation;
        /// <summary>
        /// Create a file store
        /// </summary>
        /// <param name="fileStoreLocation"></param>
        public FileStore(string fileStoreLocation)
        {
            _fileStoreLocation = fileStoreLocation;
            if (!System.IO.Directory.Exists(_fileStoreLocation))
            {
                throw new DirectoryNotFoundException($"Path {_fileStoreLocation} was not found");
            }
        }

        public Folder
    }
}
