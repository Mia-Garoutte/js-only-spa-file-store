using Microsoft.AspNetCore.StaticFiles;
using System.Text.Json.Serialization;

namespace POC.FileStore
{
    public class FileAsset : Asset
    {                
        public string ContentType { get {
                string contentType;
                new FileExtensionContentTypeProvider().TryGetContentType(this.Name, out contentType);
                return contentType ?? "application/octet-stream";
            } }
        public Byte[] Contents { get; set; }

        public FileAsset()
        {
            this.AssetType = "File";
        }


    }
}