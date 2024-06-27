using Microsoft.AspNetCore.StaticFiles;
using System.Text.Json.Serialization;

namespace POC.FileStore
{
    public class FileAsset : Asset
    {
        [JsonIgnore]
        public string FileLocation { get; set; } = string.Empty;
        
        public string ContentType { get {
                string contentType;
                new FileExtensionContentTypeProvider().TryGetContentType(this.Name, out contentType);
                return contentType ?? "application/octet-stream";
            } }
        public FileAsset()
        {
            this.AssetType = "File";
        }


    }
}