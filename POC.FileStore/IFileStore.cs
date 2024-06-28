namespace POC.FileStore
{
    public interface IFileStore
    {
        string CreateDirectory(string destination);
        bool DeleteAsset(string path);
        Asset? GetAsset(string path);
        
    }
}