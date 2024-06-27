namespace POC.FileStore
{
    public struct Asset
    {
        public string Name { get; set; }
        public string Location { get; set; }
        public string AssetType { get; set; }

        public IList<Asset>? Children { get; set; }

    }
}