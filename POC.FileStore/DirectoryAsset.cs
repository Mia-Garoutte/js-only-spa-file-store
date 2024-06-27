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


    }
}