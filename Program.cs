namespace TestProject {
    public class Program {
        public static void Main(string[] args) {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder.Services.AddControllers();

            var app = builder.Build();

            // Configure the HTTP request pipeline.

            app.UseHttpsRedirection();

            app.UseDefaultFiles();
            app.UseStaticFiles();
            
            app.MapControllers();

            app.MapFallbackToFile("index.html");
            
            //endpoints.MapFallbackToFile("index.html").WithMetadata(new HttpMethodMetadata(new[] { "GET" }))

            app.Run();
        }
    }
}