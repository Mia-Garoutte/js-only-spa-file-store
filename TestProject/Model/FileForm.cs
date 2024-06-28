using System.ComponentModel.DataAnnotations;

namespace TestProject.Model
{
    public class FileForm
    {
        [Display(Name = "File")]

        //the controller creates this with serialization. It is not something we would be using anyways.
#pragma warning disable CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider declaring as nullable.
        public IFormFile FormFile { get; set; }
#pragma warning restore CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider declaring as nullable.
    }
}