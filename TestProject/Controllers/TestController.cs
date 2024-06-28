using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using POC.FileStore;
using System.Xml.Linq;
using TestProject.Model;

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
        [Route("search/{search}")]
        public IActionResult Search(string search)
        {
            SearchResult? result = _fileStore.Search(search);
            return Ok(result);
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
                _logger.LogInformation("Unable to get the asset for {path}.  Please check the logs for errors", path);
                return NotFound();
            }

            if (result is FileAsset theFile)
            {
                try
                {
                    return File(theFile.Contents, theFile.ContentType, fileDownloadName: theFile.Name);
                }
                catch (Exception err)
                {
                    _logger.LogError(err, "An error occurred while sending the {theFile.Name}.  Please check the logs for errors", theFile.Name);
                }
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
            _logger.LogInformation("Unable to delete the asset for {path}.  Please check the logs for errors", path);
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
                return BadRequest("Directory Name was not supplied.");
            }

            string dir = _fileStore.CreateDirectory(Path.Combine(path, form.DirectoryName));
            if (string.IsNullOrWhiteSpace(dir))
            {
                _logger.LogInformation("Unable to create the directory {} for {path}.  Please check the logs for errors", path);
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
                return BadRequest("There was no file attached");
            }
            using (var memoryStream = new MemoryStream())
            {
                try
                {
                    await form.FormFile.CopyToAsync(memoryStream);
                }
                catch (Exception err)
                {
                    _logger.LogCritical(err, "Unable to process the MemoryStream for the uploaded file for {path}.  Please check the logs for errors", path);
                    return StatusCode(500);
                }
                //cap at 2 MB for this
                //There's a lot of overhead with larger files to stream them properly.
                if (memoryStream.Length < 2097152)
                {
                    string untrustedFileName = form.FormFile.FileName;

                    string fileName = await _fileStore.CreateFile(path, Path.GetFileName(untrustedFileName), memoryStream.ToArray());
                    if (string.IsNullOrWhiteSpace(fileName))
                    {
                        _logger.LogInformation("Unable to create the file for {path}.  Please check the logs for errors", path);
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
}