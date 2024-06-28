using Microsoft.AspNetCore.Builder;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Text.Encodings.Web;
using System.Threading.Tasks;
using System.Xml.Linq;

namespace POC.FileStore
{
    public class FileStore : IFileStore
    {
        private static readonly string[] badNameBits = { "\\..\\", };
        private readonly string _fileStoreLocation;
        private const string DirectoryType = "Directory";
        private const string FileType = "File";
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

        private static bool ValidatePath(string path, string name)
        {
            bool result = !string.IsNullOrWhiteSpace(path)
                && path[0] == '\\'
                && !(badNameBits.Any(s => path.Contains(s))
                || Path.GetInvalidPathChars().Any(c => path.Contains(c))
                || Path.GetInvalidFileNameChars().Any(c => name.Contains(c)));
            return result;
        }
        private static bool ValidateSearchTerms(string term)
        {
            bool result = !string.IsNullOrWhiteSpace(term)                
                && !(badNameBits.Any(s => term.Contains(s))
                || Path.GetInvalidPathChars().Any(c => term.Contains(c))
                || Path.GetInvalidFileNameChars().Any(c => term.Contains(c)));
            return result;
        }
        private string RelativeToAbsoulteFileSystem(string partialPath) => Path.Combine(_fileStoreLocation, partialPath.TrimStart('\\'));

        private DirectoryAsset GetDirectory(string urlPath, string path, string name)
        {
            DirectoryAsset result = new DirectoryAsset()
            {
                Name = string.IsNullOrWhiteSpace(name) ? "Root" : name,
                Location = urlPath,
                Children = new List<Asset>()
            };


            foreach (string dir in Directory.GetDirectories(path))
            {
                result.Children.Add(new DirectoryAsset()
                {
                    Name = Path.GetFileName(dir) ?? string.Empty,
                    Location = Path.Combine(urlPath, Path.GetFileName(dir) ?? string.Empty).Replace("\\","/")
                });
            }

            long size = 0;
            foreach (string file in Directory.GetFiles(path))
            {
                size = GetFileFromPath(urlPath, result.Children, size, file);
            }
            result.SizeInBytes = size;
            return result;
        }

        private static long GetFileFromPath(string urlPath, IList<Asset> items, long size, string file)
        {
            FileInfo fileInfo = new FileInfo(file);
            size += fileInfo.Length;
            string fileName = Path.GetFileName(file);

            items.Add(new FileAsset()
            {
                Name = fileName,
                Location = Path.Combine(urlPath, fileName).Replace("\\","/"),
                SizeInBytes = fileInfo.Length
            });
            return size;
        }

        private static bool GenerateVaildFileLocation(string urlPath, out string partialPath, out string name)
        {
            partialPath = urlPath.Replace('/', Path.DirectorySeparatorChar);
            name = partialPath.Split(Path.DirectorySeparatorChar).LastOrDefault("");
            return ValidatePath(partialPath, name);
        }

        public string CreateDirectory(string destination)
        {
            string partialPath, name;
            if (!GenerateVaildFileLocation(destination, out partialPath, out name))
            {
                return string.Empty;
            }

            string path = RelativeToAbsoulteFileSystem(partialPath);

            if (!Directory.Exists(path))
            {
                try
                {
                    DirectoryInfo dir = Directory.CreateDirectory(path);
                    return partialPath;
                }
                catch
                {
                    return string.Empty;
                }
            }
            return string.Empty;
        }

        public bool DeleteAsset(string urlPath)
        {
            string partialPath, name;

            if (!GenerateVaildFileLocation(urlPath, out partialPath, out name))
            {
                return false;
            }
            string path = RelativeToAbsoulteFileSystem(partialPath);

            bool result = true;
            if (!Asset.IsDestructiveActionAllowed(path))
            {
                return false;
            }
            if (File.Exists(path))
            {
                try
                {
                    File.Delete(path);
                }
                catch
                {
                    result = false;
                }
            }
            else if (Directory.Exists(path))
            {
                try
                {
                    Directory.Delete(path, true);
                }
                catch
                {
                    result = false;
                }
            }
            else
            {
                result = false;
            }
            return result;
        }

        public async Task<Asset?> GetAsset(string urlPath)
        {
            string partialPath, name;

            if (!GenerateVaildFileLocation(urlPath, out partialPath, out name))
            {
                return null;
            }
            string path = RelativeToAbsoulteFileSystem(partialPath);

            if (File.Exists(path))
            {
                FileAsset file = new FileAsset
                {
                    Name = name,
                    Location = urlPath
                };
                file.Contents = await File.ReadAllBytesAsync(path);

                return file;
            }
            else if (Directory.Exists(path))
            {
                return GetDirectory(urlPath, path, name);
            }
            return null;
        }

        public async Task<string> CreateFile(string destination, string fileName, byte[] Content)
        {
            string partialPath, name;

            if (!GenerateVaildFileLocation(Path.Combine(destination, fileName), out partialPath, out name))
            {
                return String.Empty;
            }
            string path = RelativeToAbsoulteFileSystem(partialPath);
            try
            {
                if (!File.Exists(path))
                {
                    await File.WriteAllBytesAsync(path, Content);
                }
                else
                {
                    return string.Empty;
                }
            }
            catch
            {
                return string.Empty;
            }

            return partialPath;
        }

        public SearchResult? Search(string search)
        {
            if (!ValidateSearchTerms(search))
            {
                return null;
            }
            SearchResult result = new SearchResult();

            result.Term = $"*{search}*";

            EnumerationOptions options = new EnumerationOptions();
            options.RecurseSubdirectories = true;
            options.MatchCasing = MatchCasing.CaseInsensitive;
            options.MatchType = MatchType.Simple;

            long size = 0;
            int rootLength = _fileStoreLocation.Length;
            foreach (string file in Directory.EnumerateFiles(_fileStoreLocation, result.Term, options))
            {
                
                size = GetFileFromPath(GetSearchLocation(rootLength, file), result.ItemsFound, size, file);
            }
            result.SizeInBytes = size; 
            return result;
        }

        private static string GetSearchLocation(int rootLength, string fileLocation )
        {
            string result = (Path.GetDirectoryName(fileLocation)?.Substring(rootLength) ?? fileLocation.Substring(rootLength)).Replace("\\","/");
            if(!result.StartsWith("/"))
            {
                result = "/" + result;
            }
            return result;
        }
    }
}
