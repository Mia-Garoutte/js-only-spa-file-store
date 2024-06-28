using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using POC.FileStore;

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
        public IActionResult Get()
        {
            return Get("/");
        }

        [HttpGet]
        [Route("{*path}")]
        [ProducesResponseType(typeof(Asset), 200)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public IActionResult Get(string path)
        {

            if (!path.StartsWith('/'))
            {
                path = '/' + path;
            }
            Asset? result = _fileStore.GetAsset(path);
            if (result == null)
            {
                return NotFound();
            }

            if (result is FileAsset theFile)
            {
                return File(theFile.FileLocation, theFile.ContentType, fileDownloadName: theFile.Name);
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

            if (string.IsNullOrWhiteSpace(form.directoryName))
            {
                return BadRequest();
            }

            string dir = _fileStore.CreateDirectory(Path.Combine( path, form.directoryName));
            if (string.IsNullOrWhiteSpace(dir))
            {
                return BadRequest();
            }
            return Created(dir,dir);
        }


    }

    public class DirectoryForm
    {
        public string directoryName { get; set; } = string.Empty;
    }
}