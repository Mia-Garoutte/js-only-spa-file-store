using Microsoft.AspNetCore.Mvc;
using POC.FileStore;

namespace TestProject.Controllers {
    [ApiController]
    [Route("[controller]")]
    public class TestController : ControllerBase {

        private readonly ILogger<TestController> _logger;
        private readonly IFileStore _fileStore;
        public TestController(ILogger<TestController> logger, IFileStore fileStore) {
            _logger = logger;
            _fileStore = fileStore;
        }

        [HttpGet]
        [Route("{*path}")]
        [ProducesResponseType(typeof(Asset),200)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public IActionResult Get(string path) {
            Asset? result = _fileStore.GetAsset(path);
            if (result == null)
            {
                return NotFound();
            }
            return Ok(result);
        }
    }
}