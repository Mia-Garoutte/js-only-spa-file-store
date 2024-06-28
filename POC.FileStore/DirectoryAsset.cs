namespace POC.FileStore
{
    public class DirectoryAsset : Asset
    {
        public string[] BreadCrumb
        {
            get =>
                this.Location.Split('/').Where(s=> s!=string.Empty).ToArray();
        }

        public DirectoryAsset()
        {
            this.AssetType = "Directory";
        }
        public IList<Asset>? Children { get; set; }

        public int TotalDirectories { get => Children?.Count(c => c is DirectoryAsset) ?? 0; }
        public int TotalFiles { get => Children?.Count(c => c is FileAsset) ?? 0; }


    }
}