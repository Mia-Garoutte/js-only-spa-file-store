using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using POC.FileStore;
using System.ComponentModel.DataAnnotations;
using System.Xml.Linq;

namespace TestProject.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class TestController : ControllerBase
    {

        private readonly ILogger<TestController> _logger;
        private readonly IFileStore _fileStore;
        public TestController(ILogger<TestController> logger, IFileStore fileStore)
        {
            _logger = logger;
            _fileStore = fileStore;
        }

        [HttpGet]
        [ProducesResponseType(typeof(Asset), 200)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Get()
        {
            return await Get("/");
        }

        [HttpGet]
        [Route("{*path}")]
        [ProducesResponseType(typeof(Asset), 200)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Get(string path)
        {

            if (!path.StartsWith('/'))
            {
                path = '/' + path;
            }
            Asset? result = await _fileStore.GetAsset(path);
            if (result == null)
            {
                return NotFound();
            }

            if (result is FileAsset theFile)
            {
                return File(theFile.Contents, theFile.ContentType, fileDownloadName: theFile.Name);
            }
            return Ok(result);
        }

        [HttpDelete]
        [Route("{*path}")]
        //[Authorize]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public IActionResult Delete(string path)
        {
            if (!path.StartsWith('/'))
            {
                path = '/' + path;
            }

            if (_fileStore.DeleteAsset(path))
            {
                return NoContent();
            }
            return BadRequest();
        }


        [HttpPost]
        public IActionResult Post(DirectoryForm form)
        {
            return Post("/", form);
        }


        [HttpPost]
        [Route("{*path}")]
        public IActionResult Post(string path, DirectoryForm form)
        {
            if (!path.StartsWith('/'))
            {
                path = '/' + path;
            }

            if (string.IsNullOrWhiteSpace(form.DirectoryName))
            {
                return BadRequest();
            }

            string dir = _fileStore.CreateDirectory(Path.Combine(path, form.DirectoryName));
            if (string.IsNullOrWhiteSpace(dir))
            {
                return BadRequest();
            }
            return Created(dir, dir);
        }

        [HttpPost]
        [Route("createFile")]
        public async Task<IActionResult> Post([FromForm] FileForm form)
        {
            return await Post("/", form);
        }

        [HttpPost]
        [Route("createFile/{*path}")]
        public async Task<IActionResult> Post(string path, [FromForm] FileForm form)
        {
            if (!path.StartsWith('/'))
            {
                path = '/' + path;
            }

            if (form.FormFile is null)
            {
                return BadRequest();
            }
            using (var memoryStream = new MemoryStream())
            {
                await form.FormFile.CopyToAsync(memoryStream);
                //cap at 2 MB for this
                //There's a lot of overhead with larger files to stream them properly.
                if (memoryStream.Length < 2097152)
                {
                    string untrustedFileName = form.FormFile.FileName;

                    string fileName = await _fileStore.CreateFile(path, Path.GetFileName(untrustedFileName), memoryStream.ToArray());
                    if (string.IsNullOrWhiteSpace(fileName))
                    {
                        return BadRequest();
                    }
                    return Created(fileName, fileName);
                }
                else
                {
                    return BadRequest("The file is too large.");
                }
            }
        }
    }

    public class DirectoryForm
    {
        public string DirectoryName { get; set; } = string.Empty;
    }

    public class FileForm
    {
        [Display(Name = "File")]

        //the controller creates this with serialization. It is not something we would be using anyways.
#pragma warning disable CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider declaring as nullable.
        public IFormFile FormFile { get; set; }
#pragma warning restore CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider declaring as nullable.
    }
}