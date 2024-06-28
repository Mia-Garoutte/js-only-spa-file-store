using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace POC.FileStore
{
    public class FileStoreOptions
    {
        public const string Section = "FileStore";
        [Required(AllowEmptyStrings = false)]
        public string FileStoreRootPath { get; set; } = string.Empty;
    }
}
