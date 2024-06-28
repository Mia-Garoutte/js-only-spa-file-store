using POC.FileStore;

namespace TestProject
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            //builder.Services.Configure<FileStoreOptions>(builder.Configuration.GetSection(FileStoreOptions.Section));
            
            // builder.Configuration.GetValue<string>("FileStoreLocation");
            // Add services to the container.
            
            builder.Services.AddControllers();
            builder.Services.AddScoped<IFileStore, FileStore>();
            builder.Services.AddOptions<FileStoreOptions>().BindConfiguration(FileStoreOptions.Section)
                .ValidateDataAnnotations()
                .ValidateOnStart();
            var app = builder.Build();

            // Configure the HTTP request pipeline.

            app.UseHttpsRedirection();

            app.UseDefaultFiles();
            app.UseWhen(
                context => !context.Request.Path.StartsWithSegments("/browse"),
                appBuilder => appBuilder.UseStaticFiles());


            app.MapControllers();

            app.MapFallbackToFile("index.html");

            //endpoints.MapFallbackToFile("index.html").WithMetadata(new HttpMethodMetadata(new[] { "GET" }))

            app.Run();
        }
    }
}