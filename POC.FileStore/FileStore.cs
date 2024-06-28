using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
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
        private ILogger<FileStore> _logger;
        /// <summary>
        /// Create a file store
        /// </summary>
        /// <param name="fileStoreLocation"></param>
        public FileStore(ILogger<FileStore> logger, IOptions<FileStoreOptions> config)
        {
            _fileStoreLocation = config.Value.FileStoreRootPath;
            _logger = logger;

            if (!System.IO.Directory.Exists(_fileStoreLocation))
            {
                throw new DirectoryNotFoundException($"Path {_fileStoreLocation} was not found");
            }
        }

        private bool ValidatePath(string path, string name)
        {
            bool result = !string.IsNullOrWhiteSpace(path)
                && path[0] == '\\'
                && !(badNameBits.Any(s => path.Contains(s))
                || Path.GetInvalidPathChars().Any(c => path.Contains(c))
                || Path.GetInvalidFileNameChars().Any(c => name.Contains(c)));
            if (!result) { _logger.LogInformation("the {path} for the Asset {name} failed validation", path, name); }

            return result;
        }
        private bool ValidateSearchTerms(string term)
        {
            bool result = !string.IsNullOrWhiteSpace(term)
                && !(badNameBits.Any(s => term.Contains(s))
                || Path.GetInvalidPathChars().Any(c => term.Contains(c))
                || Path.GetInvalidFileNameChars().Any(c => term.Contains(c)));
            if (!result) { _logger.LogInformation("the search term {term} failed validation", term); }
            return result;
        }
        private string RelativeToAbsoulteFileSystem(string partialPath) => Path.Combine(_fileStoreLocation, partialPath.TrimStart('\\'));

        private static string GetParentPath(string url)
        {
            return (Path.GetDirectoryName(url) ?? "/").Replace("\\", "/");

        }
        private DirectoryAsset GetDirectory(string urlPath, string path, string name)
        {
            DirectoryAsset result = new DirectoryAsset()
            {
                Name = string.IsNullOrWhiteSpace(name) ? "Root" : name,
                Location = urlPath,
                Children = new List<Asset>(),
                Parent = GetParentPath(urlPath)
            };


            foreach (string dir in Directory.GetDirectories(path))
            {
                result.Children.Add(new DirectoryAsset()
                {
                    Name = Path.GetFileName(dir) ?? string.Empty,
                    Location = Path.Combine(urlPath, Path.GetFileName(dir) ?? string.Empty).Replace("\\", "/")
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
                Location = Path.Combine(urlPath, fileName).Replace("\\", "/"),
                SizeInBytes = fileInfo.Length,
                Parent = urlPath
            }); ;
            return size;
        }

        private bool GenerateVaildFileLocation(string urlPath, out string partialPath, out string name)
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
                _logger.LogWarning("the {destination} failed validation while creating a directory", destination);
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
                catch (Exception ex)
                {
                    _logger.LogError(ex, "An error occurred while creating a directory at {path}", path);
                    return string.Empty;
                }
            }
            _logger.LogInformation("Unable to create a directory at {path}.  It already exists", path);
            return string.Empty;
        }

        public bool DeleteAsset(string urlPath)
        {
            string partialPath, name;

            if (!GenerateVaildFileLocation(urlPath, out partialPath, out name))
            {
                _logger.LogWarning("the {urlPath} failed validation while deleting an asset", urlPath);
                return false;
            }
            string path = RelativeToAbsoulteFileSystem(partialPath);

            bool result = true;
            if (!Asset.IsDestructiveActionAllowed(path))
            {
                _logger.LogWarning("the {path} does not Allow Destructive Actions ", path);
                return false;
            }
            if (File.Exists(path))
            {
                try
                {
                    File.Delete(path);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "An error occurred while deleting a file at {path}", path);
                    result = false;
                }
            }
            else if (Directory.Exists(path))
            {
                try
                {
                    Directory.Delete(path, true);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "An error occurred while deleting a directory at {path}", path);
                    result = false;
                }
            }
            else
            {
                _logger.LogError("There is noting to delete at {path}", path);
                result = false;
            }
            return result;
        }

        public async Task<Asset?> GetAsset(string urlPath)
        {
            string partialPath, name;

            if (!GenerateVaildFileLocation(urlPath, out partialPath, out name))
            {
                _logger.LogWarning("the {urlPath} failed validation while creating a directory", urlPath);
                return null;
            }
            string path = RelativeToAbsoulteFileSystem(partialPath);

            if (File.Exists(path))
            {
                var contents = await File.ReadAllBytesAsync(path);
                FileAsset file = new FileAsset
                {
                    Name = name,
                    Location = urlPath,
                    Parent = GetParentPath(urlPath),
                    SizeInBytes = contents.Length,
                    Contents = contents
                };

                return file;
            }
            else if (Directory.Exists(path))
            {
                return GetDirectory(urlPath, path, name);
            }
            _logger.LogWarning("There is no Asset at {path} to fetch", path);
            return null;
        }

        public async Task<string> CreateFile(string destination, string fileName, byte[] Content)
        {
            string partialPath, name;

            if (!GenerateVaildFileLocation(Path.Combine(destination, fileName), out partialPath, out name))
            {
                _logger.LogWarning("the {destination} failed validation while creating a file", destination);
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
                    _logger.LogWarning("the {destination} for {name} already has a file.", destination,name);
                    return string.Empty;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while creating a file at {path}", path);
                return string.Empty;
            }

            return partialPath;
        }

        public SearchResult? Search(string search)
        {
            if (!ValidateSearchTerms(search))
            {
                //already logged in
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
            try
            {
                foreach (string file in Directory.EnumerateFiles(_fileStoreLocation, result.Term, options))
                {

                    size = GetFileFromPath(GetSearchLocation(rootLength, file), result.ItemsFound, size, file);
                }
            }catch(Exception err)
            {
                _logger.LogError(err, "An error occurred while searching for {term}", result.Term);
            }

            result.SizeInBytes = size;
            return result;
        }

        private static string GetSearchLocation(int rootLength, string fileLocation)
        {
            string result = (Path.GetDirectoryName(fileLocation)?.Substring(rootLength) ?? fileLocation.Substring(rootLength)).Replace("\\", "/");
            if (!result.StartsWith("/"))
            {
                result = "/" + result;
            }
            return result;
        }
    }
}
