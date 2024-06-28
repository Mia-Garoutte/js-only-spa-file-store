using Microsoft.AspNetCore.StaticFiles;
using System.Text.Json.Serialization;

namespace POC.FileStore
{
    public class FileAsset : Asset
    {
        public string ContentType
        {
            get
            {
                string contentType;
                new FileExtensionContentTypeProvider().TryGetContentType(this.Name, out contentType);
                return contentType ?? "application/octet-stream";
            }
        }
        public Byte[] Contents { get; set; }

        public long SizeInKB => (long)Math.Ceiling((double)SizeInBytes / 1024) ;

#pragma warning disable CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider declaring as nullable.
        public FileAsset()
#pragma warning restore CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider declaring as nullable.
        {
            this.AssetType = "File";
        }



    }
}