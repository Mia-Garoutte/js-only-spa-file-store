﻿namespace POC.FileStore
{
    public abstract class Asset
    {
        public string Name { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;

        public string Parent { get; set; } = string.Empty;
        public string AssetType { get; protected set; } = string.Empty;

        public long SizeInBytes { get; set; }
        public long SizeInKB { get { return (long)Math.Ceiling((decimal)this.SizeInBytes / 1024); } }
        public bool DestructiveActionAllowed { get { return Asset.IsDestructiveActionAllowed(this.Location); } }
        public static bool IsDestructiveActionAllowed(string path)
        {
            switch (path.ToLower())
            {
                case "\\":
                case "\\.gitkeep":
                case "/":
                case "/.gitkeep":
                    return false;
                default:
                    return true;
            }

        }
    }
}