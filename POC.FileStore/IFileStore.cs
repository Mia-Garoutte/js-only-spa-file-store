namespace POC.FileStore
{
    public interface IFileStore
    {
        Task<string> CreateFile(string destination, string fileName, byte[] Content);
        string CreateDirectory(string destination);
        bool DeleteAsset(string path);
        Task<Asset?> GetAsset(string path);
        SearchResult? Search(string search);
    }
}