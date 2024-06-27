namespace POC.FileStore
{
    public interface IFileStore
    {
        bool DeleteAsset(string path);
        Asset? GetAsset(string path);
        
    }
}