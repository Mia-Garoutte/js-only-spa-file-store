namespace POC.FileStore
{
    public interface IFileStore
    {
        Asset? GetAsset(string path);
        
    }
}